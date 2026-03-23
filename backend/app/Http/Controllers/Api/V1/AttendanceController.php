<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AttendanceRecord::query()
            ->with('employee:id,employee_no,first_name,last_name,middle_name')
            ->latest('work_date');

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->integer('employee_id'));
        }

        if ($request->filled('work_date')) {
            $query->whereDate('work_date', $request->date('work_date'));
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    public function clockIn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'clock_in' => ['nullable', 'date'],
            'source' => ['nullable', Rule::in(['manual', 'biometric', 'self_service'])],
        ]);

        $clockIn = isset($validated['clock_in']) ? Carbon::parse($validated['clock_in']) : now();

        $attendance = AttendanceRecord::firstOrCreate(
            [
                'employee_id' => $validated['employee_id'],
                'work_date' => $clockIn->toDateString(),
            ],
            [
                'clock_in' => $clockIn,
                'source' => $validated['source'] ?? 'self_service',
                'status' => 'present',
            ]
        );

        if (! $attendance->clock_in) {
            $attendance->clock_in = $clockIn;
            $attendance->save();
        }

        return response()->json([
            'data' => $attendance->fresh('employee:id,employee_no,first_name,last_name,middle_name'),
            'message' => 'Clock-in recorded successfully.',
        ]);
    }

    public function clockOut(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'clock_out' => ['nullable', 'date'],
            'source' => ['nullable', Rule::in(['manual', 'biometric', 'self_service'])],
        ]);

        $clockOut = isset($validated['clock_out']) ? Carbon::parse($validated['clock_out']) : now();

        $attendance = AttendanceRecord::query()
            ->where('employee_id', $validated['employee_id'])
            ->whereDate('work_date', $clockOut->toDateString())
            ->first();

        if (! $attendance) {
            return response()->json([
                'message' => 'No clock-in record found for this employee on the specified date.',
            ], 422);
        }

        if (! $attendance->clock_in) {
            return response()->json([
                'message' => 'Clock-in must be recorded before clock-out.',
            ], 422);
        }

        $attendance->clock_out = $clockOut;
        $attendance->source = $validated['source'] ?? $attendance->source;

        $workedMinutes = max(0, $attendance->clock_in->diffInMinutes($clockOut));
        $attendance->minutes_overtime = max(0, $workedMinutes - 480);
        $attendance->minutes_undertime = max(0, 480 - $workedMinutes);

        $attendance->save();

        return response()->json([
            'data' => $attendance->fresh('employee:id,employee_no,first_name,last_name,middle_name'),
            'message' => 'Clock-out recorded successfully.',
        ]);
    }
}
