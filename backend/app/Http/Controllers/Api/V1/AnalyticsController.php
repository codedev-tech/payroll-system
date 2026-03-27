<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Employee;
use App\Models\Payslip;
use App\Services\EmployeeStatusService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * AnalyticsController
 *
 * Provides dashboard and reporting endpoints for payroll analytics.
 * Uses EmployeeStatusService to ensure employee status metrics stay in sync
 * with employee status updates from the EmployeeController.
 */
class AnalyticsController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly EmployeeStatusService $statusService,
    ) {}


    /**
     * Get dashboard analytics data.
     *
     * Returns key metrics for the dashboard including employee counts and payroll information.
     * Automatically reflects any employee status changes made via EmployeeController.
     *
     * Returns:
     * - total_employees: Count of all employees including inactive
     * - active_employees: Count of employees with 'active' status only
     * - inactive_employees: Count of employees marked as inactive
     * - total_payroll: Total net pay for the current month
     * - pending_payroll: Count of active employees without a payslip this month
     * - recent_activity: Last 5 payslips released
     *
     * @return JsonResponse Dashboard statistics and recent activity
     */
    public function dashboard(): JsonResponse
    {
        // Define the current month range for payroll calculations
        $startOfMonth = now()->startOfMonth()->toDateString();
        $endOfMonth = now()->endOfMonth()->toDateString();

        // Count ALL employees including inactive for a complete view of the workforce
        $totalEmployees = Employee::query()->count();

        // Count only fully active employees for active workforce tracking
        $activeEmployees = count($this->statusService->getFullyActiveEmployees());

        // Count inactive employees for visibility when status changes
        $inactiveEmployees = Employee::query()->where('employment_status', 'inactive')->count();

        // Calculate total payroll for current month
        $currentMonthPayroll = (float) Payslip::query()
            ->whereDate('period_start', '>=', $startOfMonth)
            ->whereDate('period_end', '<=', $endOfMonth)
            ->sum('net_pay');

        // Calculate pending payroll: active employees without a payslip this month
        $pendingPayroll = max(0, $activeEmployees - Payslip::query()
            ->whereDate('period_start', '>=', $startOfMonth)
            ->whereDate('period_end', '<=', $endOfMonth)
            ->distinct('employee_id')
            ->count('employee_id'));

        // Get recent payslip releases from active employees only
        $recentActivity = Payslip::query()
            ->with('employee:id,first_name,last_name,middle_name')
            ->whereHas('employee', function ($query) {
                $query->where('employment_status', 'active');
            })
            ->latest('released_at')
            ->limit(5)
            ->get()
            ->map(function (Payslip $payslip) {
                return [
                    'employee' => $payslip->employee?->full_name ?? 'N/A',
                    'action' => 'Payslip released',
                    'date' => optional($payslip->released_at)->format('M d, Y') ?? optional($payslip->period_end)->format('M d, Y'),
                    'amount' => (float) $payslip->net_pay,
                ];
            })
            ->values();

        return $this->success([
            'stats' => [
                'total_employees' => $totalEmployees,
                'active_employees' => $activeEmployees,
                'inactive_employees' => $inactiveEmployees,
                'total_payroll' => $currentMonthPayroll,
                'pending_payroll' => $pendingPayroll,
            ],
            'recent_activity' => $recentActivity,
        ]);
    }

    /**
     * Get payroll analytics for a specified period.
     *
     * Returns payroll aggregates and individual payslip details for active employees.
     * Respects employee status changes to only include currently active employees.
     *
     * Query Parameters:
     * - start_date: Optional start date (default: first day of last month)
     * - end_date: Optional end date (default: last day of current month)
     *
     * Returns:
     * - gross_pay: Total gross pay for period
     * - deduction: Total deductions for period
     * - net_pay: Total net pay for period
     * - recent_payroll: Last 10 payslips for active employees
     * - period: Start and end dates of the report
     *
     * @param Request $request HTTP request with optional date parameters
     * @return JsonResponse Payroll statistics and details
     */
    public function payroll(Request $request): JsonResponse
    {
        // Resolve the date period to query
        [$startDate, $endDate] = $this->resolvePeriod($request);

        // Build base query for payslips in the period
        $query = Payslip::query()
            ->with('employee:id,first_name,last_name,middle_name,employee_no')
            ->whereDate('period_start', '>=', $startDate)
            ->whereDate('period_end', '<=', $endDate);

        // Calculate aggregate payroll amounts
        $grossPay = (float) (clone $query)->sum('gross_pay');
        $totalDeductions = (float) (clone $query)->sum('total_deductions');
        $netPay = (float) (clone $query)->sum('net_pay');

        // Get recent payroll entries for active employees only
        // Ensures status changes are reflected in the analytics
        $recentPayroll = (clone $query)
            ->whereHas('employee', function ($employeeQuery) {
                $employeeQuery->where('employment_status', 'active');
            })
            ->latest('period_end')
            ->limit(10)
            ->get()
            ->map(function (Payslip $payslip) {
                return [
                    'id' => $payslip->id,
                    'employee' => $payslip->employee?->full_name ?? 'N/A',
                    'gross_pay' => (float) $payslip->gross_pay,
                    'deduction' => (float) $payslip->total_deductions,
                    'net_pay' => (float) $payslip->net_pay,
                ];
            })
            ->values();

        return $this->success([
            'stats' => [
                'gross_pay' => $grossPay,
                'deduction' => $totalDeductions,
                'net_pay' => $netPay,
            ],
            'recent_payroll' => $recentPayroll,
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ]);
    }

    /**
     * Get comprehensive payroll reports for a specified period.
     *
     * Generates detailed reports including payroll expenses, department costs,
     * and monthly breakdown. Only includes employees with active/on_leave/pending status.
     *
     * Query Parameters:
     * - start_date: Optional start date (default: 8 months back)
     * - end_date: Optional end date (default: end of current month)
     *
     * Returns:
     * - payroll_expenses: Monthly payroll trends
     * - department_cost: Top 6 departments by payroll cost
     * - monthly_report: Detailed monthly breakdown with status
     * - period: Start and end dates of the report
     *
     * @param Request $request HTTP request with optional date parameters
     * @return JsonResponse Report data with trends and breakdowns
     */
    public function reports(Request $request): JsonResponse
    {
        // Resolve the date period (default: last 8 months)
        [$startDate, $endDate] = $this->resolvePeriod($request, 8);

        // Get monthly payroll expense trends
        $payrollExpenses = Payslip::query()
            ->selectRaw('DATE_FORMAT(period_end, "%Y-%m") as month_key, SUM(net_pay) as total_net')
            ->whereDate('period_end', '>=', $startDate)
            ->whereDate('period_end', '<=', $endDate)
            ->groupBy('month_key')
            ->orderBy('month_key')
            ->get()
            ->map(function ($row) {
                $label = Carbon::createFromFormat('Y-m', $row->month_key)->format('M');

                return [
                    'label' => $label,
                    'value' => (float) $row->total_net,
                    'month_key' => $row->month_key,
                ];
            })
            ->values();

        // Get department costs - includes only employees with active/on_leave/pending status
        // Ensures status changes are reflected in department analytics
        $departmentCost = DB::table('payslips')
            ->join('employees', 'employees.id', '=', 'payslips.employee_id')
            ->leftJoin('departments', 'departments.id', '=', 'employees.department_id')
            ->selectRaw('COALESCE(departments.name, "Unassigned") as department_name, SUM(payslips.net_pay) as total_net')
            ->whereDate('payslips.period_end', '>=', $startDate)
            ->whereDate('payslips.period_end', '<=', $endDate)
            ->whereIn('employees.employment_status', ['active', 'on_leave', 'pending'])
            ->groupBy('department_name')
            ->orderByDesc('total_net')
            ->limit(6)
            ->get()
            ->map(function ($row) {
                return [
                    'label' => $row->department_name,
                    'value' => (float) $row->total_net,
                ];
            })
            ->values();

        // Get detailed monthly report with payment status
        $monthlyReport = Payslip::query()
            ->selectRaw('DATE_FORMAT(period_end, "%Y-%m") as month_key, SUM(net_pay) as total_payroll, SUM(total_deductions) as total_deductions')
            ->whereDate('period_end', '>=', $startDate)
            ->whereDate('period_end', '<=', $endDate)
            ->groupBy('month_key')
            ->orderBy('month_key')
            ->get()
            ->map(function ($row) {
                return [
                    'month' => Carbon::createFromFormat('Y-m', $row->month_key)->format('F'),
                    'total_payroll' => (float) $row->total_payroll,
                    'status' => (float) $row->total_payroll > 0 ? 'Paid' : 'Pending',
                    'taxes' => (float) $row->total_deductions,
                ];
            })
            ->values();

        return $this->success([
            'payroll_expenses' => $payrollExpenses,
            'department_cost' => $departmentCost,
            'monthly_report' => $monthlyReport,
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ]);
    }

    /**
     * Resolve the date period for analytics queries.
     *
     * If start_date and end_date are provided in the request, uses those.
     * Otherwise, calculates a default range based on monthsBack parameter.
     *
     * @param Request $request HTTP request potentially containing start_date and end_date
     * @param int $monthsBack Number of months to go back if no dates provided (default: 1)
     * @return array Array with ['start_date_string', 'end_date_string']
     */
    private function resolvePeriod(Request $request, int $monthsBack = 1): array
    {
        // If both dates are provided, use them
        if ($request->filled('start_date') && $request->filled('end_date')) {
            return [
                Carbon::parse($request->string('start_date'))->startOfDay()->toDateString(),
                Carbon::parse($request->string('end_date'))->endOfDay()->toDateString(),
            ];
        }

        // Default: current month end to (monthsBack) months back start
        $end = now()->endOfMonth();
        $start = now()->subMonths($monthsBack - 1)->startOfMonth();

        return [$start->toDateString(), $end->toDateString()];
    }
}
