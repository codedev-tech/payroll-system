<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Employee;
use App\Services\PayslipCalculationService;
use App\Services\EmployeeStatusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * EmployeeController
 *
 * Handles CRUD operations and status management for employees.
 * Uses EmployeeStatusService to ensure status changes are consistently
 * applied across the application including dashboard metrics.
 */
class EmployeeController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly PayslipCalculationService $payslipService,
        private readonly EmployeeStatusService $statusService,
    ) {}

    /**
     * Get paginated list of employees.
     *
     * Retrieves all employees with pagination, sorting, and filtering support.
     * Includes employees of all statuses (active, on_leave, inactive, pending) so that HR
     * can see and manage the complete workforce, including those who have been offboarded.
     *
     * Query Parameters:
     * - limit: Number of results per page (default: 15)
     * - sort: Field to sort by (default: last_name)
     * - order: Sort order - asc or desc (default: asc)
     * - search: Search by name, email, or employee number
     * - employment_status: Filter by status (active, on_leave, pending, inactive)
     * - department_id: Filter by department
     *
     * @param Request $request HTTP request with query parameters
     * @return JsonResponse Paginated employee list
     */
    public function index(Request $request): JsonResponse
    {
        // Extract and validate pagination parameters
        $limit = $request->integer('limit', 15);
        $sortField = $request->string('sort', 'last_name')->toString();
        $sortOrder = $request->string('order', 'asc')->toString();

        // Define allowed sortable fields for security
        $allowedSorts = ['last_name', 'first_name', 'hire_date', 'basic_salary', 'employee_no', 'created_at'];
        if (! in_array($sortField, $allowedSorts, true)) {
            $sortField = 'last_name';
        }
        // Ensure sort order is either asc or desc
        $sortOrder = in_array($sortOrder, ['asc', 'desc'], true) ? $sortOrder : 'asc';

        // Build base query: get ALL employees including inactive ones
        // HR needs to see the complete workforce for management and record-keeping
        $query = Employee::query()
            ->with('department:id,name')
            ->orderBy($sortField, $sortOrder);

        // Secondary sort for consistency
        if ($sortField !== 'last_name') {
            $query->orderBy('last_name');
        }

        // Apply search filter if provided - search across multiple fields
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

        // Filter by employment status if provided
        if ($request->filled('employment_status')) {
            $query->where('employment_status', $request->string('employment_status'));
        }

        // Filter by department if provided
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->integer('department_id'));
        }

        // Return paginated results
        return $this->paginated($query->paginate($limit));
    }

    /**
     * Create a new employee record.
     *
     * HR or admin users can create new employee profiles. If no employee number
     * is provided, one is auto-generated. A monthly payslip is automatically created.
     *
     * @param Request $request HTTP request with employee data
     * @return JsonResponse Created employee with 201 status
     */
    public function store(Request $request): JsonResponse
    {
        // Validate incoming employee data
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

        // Auto-generate employee number if not provided
        if (empty($validated['employee_no'])) {
            $nextId = (int) Employee::max('id') + 1;
            $validated['employee_no'] = 'EMP-'.date('Y').'-'.str_pad((string) $nextId, 4, '0', STR_PAD_LEFT);
        }

        // Create the employee and load related department data
        $employee = Employee::create($validated)->load('department:id,name');

        // Ensure a monthly payslip is created for the new employee
        $this->payslipService->ensureMonthlyPayslip($employee);

        return $this->success($employee, 'Employee created successfully.', 201);
    }

    /**
     * Get a single employee record.
     *
     * Retrieves a single employee by ID with related department information.
     *
     * @param Employee $employee The employee to retrieve
     * @return JsonResponse Employee data
     */
    public function show(Employee $employee): JsonResponse
    {
        // Load related department data
        $employee->load('department:id,name');

        return $this->success($employee);
    }

    /**
     * Update an employee record.
     *
     * HR or admin users can update employee details. Uses EmployeeStatusService
     * to handle status updates, ensuring changes are reflected in dashboard metrics.
     *
     * Supports both PUT (full update) and PATCH (partial update) requests.
     *
     * @param Request $request HTTP request with updated employee data
     * @param Employee $employee The employee to update
     * @return JsonResponse Updated employee data
     */
    public function update(Request $request, Employee $employee): JsonResponse
    {
        // Validate incoming employee data (using 'sometimes' for partial updates)
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

        // If employment_status is being updated, use the EmployeeStatusService
        // to ensure dashboard metrics are updated accordingly
        if (isset($validated['employment_status'])) {
            $newStatus = $validated['employment_status'];
            unset($validated['employment_status']); // Remove from validated array
            
            // Update other fields if any
            if (! empty($validated)) {
                $employee->update($validated);
            }
            
            // Use status service to update status and sync with dashboard
            $employee = $this->statusService->updateStatus($employee, $newStatus);
        } else {
            // No status change, just update provided fields
            $employee->update($validated);
            $employee = $employee->fresh('department:id,name');
        }

        return $this->success($employee, 'Employee updated successfully.');
    }

    /**
     * Permanently delete an employee and all related data.
     *
     * Removes the employee record and all associated data including:
     * - User account (if linked)
     * - Payslips
     * - Leave requests
     *
     * This is a hard delete operation and cannot be undone. The employee record
     * and all their data will be permanently removed from the system.
     *
     * @param Employee $employee The employee to delete
     * @return JsonResponse Success message
     */
    public function destroy(Employee $employee): JsonResponse
    {
        // Load the linked user if one exists
        $employee->load('user');
        $linkedUser = $employee->user;

        // Delete all payslips for this employee
        $employee->payslips()->delete();

        // Delete all leave requests for this employee
        $employee->leaveRequests()->delete();

        // Delete the linked user account if one exists
        if ($linkedUser) {
            $linkedUser->delete();
        }

        // Permanently delete the employee record
        $employee->delete();

        return $this->success(message: 'Employee and all related data permanently deleted.');
    }
}
