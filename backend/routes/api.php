<?php

use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\AdminHrAccountController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\HrEmployeeAccountController;
use App\Http\Controllers\Api\V1\PayslipController;
use App\Http\Controllers\Api\V1\PayrollSettingController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('/admin/hr-accounts', [AdminHrAccountController::class, 'store'])->middleware('admin_only');

    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::post('/departments', [DepartmentController::class, 'store'])->middleware('hr_or_admin');

    Route::post('/hr/employee-accounts', [HrEmployeeAccountController::class, 'store'])->middleware('hr_or_admin');

    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store'])->middleware('hr_or_admin');
    Route::get('/employees/{employee}', [EmployeeController::class, 'show']);
    Route::put('/employees/{employee}', [EmployeeController::class, 'update'])->middleware('hr_or_admin');
    Route::patch('/employees/{employee}', [EmployeeController::class, 'update'])->middleware('hr_or_admin');

    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance/clock-in', [AttendanceController::class, 'clockIn'])->middleware('hr_or_admin');
    Route::post('/attendance/clock-out', [AttendanceController::class, 'clockOut'])->middleware('hr_or_admin');

    Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);
    Route::get('/analytics/payroll', [AnalyticsController::class, 'payroll']);
    Route::get('/analytics/reports', [AnalyticsController::class, 'reports']);

    Route::get('/payroll-settings', [PayrollSettingController::class, 'show']);
    Route::put('/payroll-settings', [PayrollSettingController::class, 'update'])->middleware('hr_or_admin');

    Route::get('/payslips', [PayslipController::class, 'index']);
    Route::get('/payslips/{payslip}', [PayslipController::class, 'show']);

    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy'])->middleware('hr_or_admin');
});
