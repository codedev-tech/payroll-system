<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Payslip;
use App\Models\PayrollSetting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayslipController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $actor = $this->resolveActor($request);
        if (! $actor) {
            return response()->json([
                'message' => 'actor_user_id or X-Actor-User-Id header is required.',
            ], 401);
        }

        if ($actor->role === 'employee') {
            if ($actor->employeeProfile) {
                $this->ensureMonthlyPayslipsForEmployeeIds([(int) $actor->employeeProfile->id]);
            }
        } else {
            $employeeIds = Employee::query()
                ->when($request->filled('employee_id'), fn ($q) => $q->where('id', $request->integer('employee_id')))
                ->pluck('id')
                ->all();

            $this->ensureMonthlyPayslipsForEmployeeIds($employeeIds);
        }

        $query = Payslip::query()
            ->with(['employee:id,user_id,employee_no,first_name,last_name,middle_name,position,employment_status', 'employee.department:id,name'])
            ->latest('period_end');

        if ($actor->role === 'employee') {
            $employee = $actor->employeeProfile;
            if (! $employee) {
                return response()->json([
                    'data' => [],
                ]);
            }

            $query->where('employee_id', $employee->id);
        } elseif ($request->filled('employee_id')) {
            $query->where('employee_id', $request->integer('employee_id'));
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    public function show(Request $request, Payslip $payslip): JsonResponse
    {
        $actor = $this->resolveActor($request);
        if (! $actor) {
            return response()->json([
                'message' => 'actor_user_id or X-Actor-User-Id header is required.',
            ], 401);
        }

        $payslip->load(['employee:id,user_id,employee_no,first_name,last_name,middle_name,position,employment_status', 'employee.department:id,name']);

        if ($actor->role === 'employee' && (int) $payslip->employee?->user_id !== (int) $actor->id) {
            return response()->json([
                'message' => 'Access denied. Employees can only view their own payslips.',
            ], 403);
        }

        return response()->json([
            'data' => $payslip,
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

    private function ensureMonthlyPayslipsForEmployeeIds(array $employeeIds): void
    {
        if ($employeeIds === []) {
            return;
        }

        $settings = PayrollSetting::current();

        $employees = Employee::query()
            ->whereIn('id', $employeeIds)
            ->where('employment_status', 'active')
            ->get(['id', 'basic_salary']);

        foreach ($employees as $employee) {
            $basicSalary = (float) ($employee->basic_salary ?? 0);
            $estimatedTax = round($basicSalary * (float) $settings->tax_rate, 2);
            $estimatedPhilHealth = round($basicSalary * (float) $settings->philhealth_rate, 2);
            $totalDeductions = $estimatedTax + $estimatedPhilHealth;
            $netPay = max(0, $basicSalary - $totalDeductions);

            Payslip::query()->updateOrCreate(
                [
                    'employee_id' => $employee->id,
                    'period_start' => now()->startOfMonth()->toDateString(),
                    'period_end' => now()->endOfMonth()->toDateString(),
                ],
                [
                    'gross_pay' => $basicSalary,
                    'total_deductions' => $totalDeductions,
                    'net_pay' => $netPay,
                    'earnings' => [
                        ['label' => 'Basic Salary', 'amount' => $basicSalary],
                    ],
                    'deductions' => [
                        ['label' => 'Estimated Tax', 'amount' => $estimatedTax],
                        ['label' => 'Estimated PhilHealth', 'amount' => $estimatedPhilHealth],
                    ],
                    'released_at' => now()->toDateString(),
                ]
            );
        }
    }
}
