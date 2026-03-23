<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeaveRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $actor = $this->resolveActor($request);

        if (! $actor || ! in_array($actor->role, ['admin', 'hr'], true)) {
            return response()->json([
                'message' => 'Access denied. Only HR or Admin can view leave requests.',
            ], 403);
        }

        $query = LeaveRequest::query()
            ->with([
                'employee:id,employee_no,first_name,last_name,middle_name',
                'leaveType:id,code,name,is_paid',
                'reviewer:id,name,email',
            ])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->integer('employee_id'));
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $actor = $this->resolveActor($request);
        $validated = $request->validate([
            'employee_id' => ['nullable', 'integer', 'exists:employees,id'],
            'leave_type_id' => ['required', 'integer', 'exists:leave_types,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        if (! $actor || ! in_array($actor->role, ['admin', 'hr'], true)) {
            return response()->json([
                'message' => 'Access denied. Only HR or Admin can submit leave requests.',
            ], 403);
        }

        if (empty($validated['employee_id'])) {
            return response()->json([
                'message' => 'employee_id is required.',
            ], 422);
        }

        $startDate = Carbon::parse($validated['start_date'])->startOfDay();
        $endDate = Carbon::parse($validated['end_date'])->startOfDay();
        $validated['days_requested'] = (string) ($startDate->diffInDays($endDate) + 1);
        $validated['status'] = 'pending';

        $leaveRequest = LeaveRequest::create($validated)
            ->load(['employee:id,employee_no,first_name,last_name,middle_name', 'leaveType:id,code,name,is_paid']);

        return response()->json([
            'data' => $leaveRequest,
            'message' => 'Leave request submitted successfully.',
        ], 201);
    }

    public function approve(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $validated = $request->validate([
            'reviewed_by' => ['required', 'integer', 'exists:users,id'],
            'review_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending leave requests can be approved.',
            ], 422);
        }

        $leaveRequest->update([
            'status' => 'approved',
            'reviewed_by' => $validated['reviewed_by'],
            'reviewed_at' => now(),
            'review_notes' => $validated['review_notes'] ?? null,
        ]);

        return response()->json([
            'data' => $leaveRequest->fresh(['employee:id,employee_no,first_name,last_name,middle_name', 'leaveType:id,code,name,is_paid', 'reviewer:id,name,email']),
            'message' => 'Leave request approved.',
        ]);
    }

    public function reject(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $validated = $request->validate([
            'reviewed_by' => ['required', 'integer', 'exists:users,id'],
            'review_notes' => ['required', 'string', 'max:1000'],
            'status' => ['nullable', Rule::in(['rejected', 'cancelled'])],
        ]);

        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending leave requests can be rejected or cancelled.',
            ], 422);
        }

        $leaveRequest->update([
            'status' => $validated['status'] ?? 'rejected',
            'reviewed_by' => $validated['reviewed_by'],
            'reviewed_at' => now(),
            'review_notes' => $validated['review_notes'],
        ]);

        return response()->json([
            'data' => $leaveRequest->fresh(['employee:id,employee_no,first_name,last_name,middle_name', 'leaveType:id,code,name,is_paid', 'reviewer:id,name,email']),
            'message' => 'Leave request updated.',
        ]);
    }

    private function resolveActor(Request $request): ?User
    {
        $actorUserId = $request->integer('actor_user_id') ?: (int) $request->header('X-Actor-User-Id');
        if (! $actorUserId) {
            return null;
        }

        return User::query()->with('employeeProfile')->find($actorUserId);
    }
}
