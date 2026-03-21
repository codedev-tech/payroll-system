<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Payslip;
use App\Models\PayrollSetting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class HrEmployeeAccountController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'employee_no' => ['nullable', 'string', 'max:50', 'unique:employees,employee_no'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'position' => ['nullable', 'string', 'max:255'],
            'hire_date' => ['nullable', 'date'],
            'employment_status' => ['nullable', Rule::in(['active', 'on_leave', 'inactive', 'pending'])],
            'basic_salary' => ['nullable', 'numeric', 'min:0'],
            'attendance_pin' => ['nullable', 'string', 'min:4', 'max:12'],
        ]);

        $result = DB::transaction(function () use ($validated) {
            $user = User::query()->create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => 'employee',
            ]);

            $employeeNo = $validated['employee_no'] ?? null;
            if (! $employeeNo) {
                $nextId = (int) Employee::max('id') + 1;
                $employeeNo = 'EMP-'.date('Y').'-'.str_pad((string) $nextId, 4, '0', STR_PAD_LEFT);
            }

            $employee = Employee::query()->create([
                'user_id' => $user->id,
                'employee_no' => $employeeNo,
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'department_id' => $validated['department_id'] ?? null,
                'position' => $validated['position'] ?? null,
                'hire_date' => $validated['hire_date'] ?? null,
                'employment_status' => $validated['employment_status'] ?? 'active',
                'basic_salary' => $validated['basic_salary'] ?? 0,
                'attendance_pin' => $validated['attendance_pin'] ?? null,
            ])->load('department:id,name');

            $settings = PayrollSetting::current();
            $basicSalary = (float) ($validated['basic_salary'] ?? 0);
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

            return [$user, $employee];
        });

        [$user, $employee] = $result;

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'employee' => $employee,
            ],
            'message' => 'Employee account created by HR successfully.',
        ], 201);
    }
}
