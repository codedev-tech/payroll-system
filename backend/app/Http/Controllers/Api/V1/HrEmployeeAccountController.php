<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Payslip;
use App\Models\PayrollSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HrEmployeeAccountController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'position' => ['nullable', 'string', 'max:255'],
            'hire_date' => ['nullable', 'date'],
            'basic_salary' => ['nullable', 'numeric', 'min:0'],
        ]);

        $employeeNo = 'EMP-'.date('Y').'-'.str_pad((string) ((int) Employee::max('id') + 1), 4, '0', STR_PAD_LEFT);

        $employee = Employee::query()->create([
            'employee_no' => $employeeNo,
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'department_id' => $validated['department_id'] ?? null,
            'position' => $validated['position'] ?? null,
            'hire_date' => $validated['hire_date'] ?? null,
            'employment_status' => 'active',
            'basic_salary' => $validated['basic_salary'] ?? 0,
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

        return response()->json([
            'data' => [
                'employee' => $employee,
            ],
            'message' => 'Employee created successfully.',
        ], 201);
    }
}
