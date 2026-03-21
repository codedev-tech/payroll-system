<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Payslip;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $startOfMonth = now()->startOfMonth()->toDateString();
        $endOfMonth = now()->endOfMonth()->toDateString();

        $totalEmployees = Employee::query()
            ->whereIn('employment_status', ['active', 'on_leave', 'pending'])
            ->count();
        $activeEmployees = Employee::query()->where('employment_status', 'active')->count();

        $currentMonthPayroll = (float) Payslip::query()
            ->whereDate('period_start', '>=', $startOfMonth)
            ->whereDate('period_end', '<=', $endOfMonth)
            ->sum('net_pay');

        $pendingPayroll = max(0, $activeEmployees - Payslip::query()
            ->whereDate('period_start', '>=', $startOfMonth)
            ->whereDate('period_end', '<=', $endOfMonth)
            ->distinct('employee_id')
            ->count('employee_id'));

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

        return response()->json([
            'data' => [
                'stats' => [
                    'total_employees' => $totalEmployees,
                    'active_employees' => $activeEmployees,
                    'total_payroll' => $currentMonthPayroll,
                    'pending_payroll' => $pendingPayroll,
                ],
                'recent_activity' => $recentActivity,
            ],
        ]);
    }

    public function payroll(Request $request): JsonResponse
    {
        [$startDate, $endDate] = $this->resolvePeriod($request);

        $query = Payslip::query()
            ->with('employee:id,first_name,last_name,middle_name,employee_no')
            ->whereDate('period_start', '>=', $startDate)
            ->whereDate('period_end', '<=', $endDate);

        $grossPay = (float) (clone $query)->sum('gross_pay');
        $totalDeductions = (float) (clone $query)->sum('total_deductions');
        $netPay = (float) (clone $query)->sum('net_pay');

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

        return response()->json([
            'data' => [
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
            ],
        ]);
    }

    public function reports(Request $request): JsonResponse
    {
        [$startDate, $endDate] = $this->resolvePeriod($request, 8);

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

        return response()->json([
            'data' => [
                'payroll_expenses' => $payrollExpenses,
                'department_cost' => $departmentCost,
                'monthly_report' => $monthlyReport,
                'period' => [
                    'start' => $startDate,
                    'end' => $endDate,
                ],
            ],
        ]);
    }

    private function resolvePeriod(Request $request, int $monthsBack = 1): array
    {
        if ($request->filled('start_date') && $request->filled('end_date')) {
            return [
                Carbon::parse($request->string('start_date'))->startOfDay()->toDateString(),
                Carbon::parse($request->string('end_date'))->endOfDay()->toDateString(),
            ];
        }

        $end = now()->endOfMonth();
        $start = now()->subMonths($monthsBack - 1)->startOfMonth();

        return [$start->toDateString(), $end->toDateString()];
    }
}
