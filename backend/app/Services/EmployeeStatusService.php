<?php

namespace App\Services;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Collection;

/**
 * EmployeeStatusService
 *
 * Manages employee status updates and related operations.
 * This service ensures that all status changes are consistently applied
 * across the application, including dashboard metrics.
 */
class EmployeeStatusService
{
    /**
     * Update the employment status of an employee.
     *
     * This method updates an employee's employment status and automatically
     * triggers any related updates needed for the dashboard and other features.
     *
     * @param Employee $employee The employee whose status will be updated
     * @param string $newStatus The new employment status (active, on_leave, inactive, pending)
     * @return Employee The updated employee instance
     */
    public function updateStatus(Employee $employee, string $newStatus): Employee
    {
        // Update the employee's employment status in the database
        $employee->update(['employment_status' => $newStatus]);

        // Reload the employee with related data to ensure fresh state
        return $employee->fresh('department:id,name');
    }

    /**
     * Get all active or employable employees for dashboard metrics.
     *
     * Returns employees whose status indicates they are currently active or
     * considered in the active workforce (excludes 'inactive' status).
     *
     * @return Collection Collection of active employees
     */
    public function getActiveEmployees(): Collection
    {
        return Employee::query()
            ->whereIn('employment_status', ['active', 'on_leave', 'pending'])
            ->get();
    }

    /**
     * Get only currently active employees.
     *
     * Returns employees with 'active' status only.
     *
     * @return Collection Collection of active employees
     */
    public function getFullyActiveEmployees(): Collection
    {
        return Employee::query()
            ->where('employment_status', 'active')
            ->get();
    }

    /**
     * Get all employees excluding inactive ones.
     *
     * Used for employee listing and dashboard calculations.
     *
     * @return Collection Collection of non-inactive employees
     */
    public function getNonInactiveEmployees(): Collection
    {
        return Employee::query()
            ->where('employment_status', '!=', 'inactive')
            ->get();
    }
}
