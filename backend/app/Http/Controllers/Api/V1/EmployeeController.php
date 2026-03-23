<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Payslip;
use App\Models\PayrollSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->integer('limit', 15);

        $query = Employee::query()
            ->where('employment_status', '!=', 'inactive')
            ->with('department:id,name')
            ->orderBy('last_name')
            ->orderBy('first_name');

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('employee_no', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('department', function ($departmentQuery) use ($search) {
                        $departmentQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('employment_status')) {
            $query->where('employment_status', $request->string('employment_status'));
        }

        $employees = $query->paginate($limit);

        return response()->json([
            'data' => $employees->items(),
            'meta' => [
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
                'per_page' => $employees->perPage(),
                'total' => $employees->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id', 'unique:employees,user_id'],
            'employee_no' => ['nullable', 'string', 'max:50', 'unique:employees,employee_no'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:employees,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'position' => ['nullable', 'string', 'max:255'],
            'hire_date' => ['nullable', 'date'],
            'employment_status' => ['nullable', Rule::in(['active', 'on_leave', 'inactive', 'pending'])],
            'basic_salary' => ['nullable', 'numeric', 'min:0'],
        ]);

        if (empty($validated['employee_no'])) {
            $nextId = (int) Employee::max('id') + 1;
            $validated['employee_no'] = 'EMP-'.date('Y').'-'.str_pad((string) $nextId, 4, '0', STR_PAD_LEFT);
        }

        $employee = Employee::create($validated)->load('department:id,name');
        $this->ensureMonthlyPayslip($employee);

        return response()->json([
            'data' => $employee,
            'message' => 'Employee created successfully.',
        ], 201);
    }

    public function show(Employee $employee): JsonResponse
    {
        $employee->load('department:id,name');

        return response()->json([
            'data' => $employee,
        ]);
    }

    public function update(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id', Rule::unique('employees', 'user_id')->ignore($employee->id)],
            'employee_no' => ['sometimes', 'string', 'max:50', Rule::unique('employees', 'employee_no')->ignore($employee->id)],
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('employees', 'email')->ignore($employee->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'position' => ['nullable', 'string', 'max:255'],
            'hire_date' => ['nullable', 'date'],
            'employment_status' => ['nullable', Rule::in(['active', 'on_leave', 'inactive', 'pending'])],
            'basic_salary' => ['nullable', 'numeric', 'min:0'],
        ]);

        $employee->update($validated);

        return response()->json([
            'data' => $employee->fresh('department:id,name'),
            'message' => 'Employee updated successfully.',
        ]);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $employee->load('user');
        $linkedUser = $employee->user;

        $employee->update([
            'employment_status' => 'inactive',
        ]);

        if ($linkedUser) {
            $linkedUser->delete();
        }

        return response()->json([
            'message' => 'Employee offboarded successfully.',
        ]);
    }

    private function ensureMonthlyPayslip(Employee $employee): void
    {
        $settings = PayrollSetting::current();
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
