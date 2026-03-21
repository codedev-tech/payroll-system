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

    public function kioskClockIn(Request $request): JsonResponse
    {
        if ($unauthorized = $this->ensureKioskAccess($request)) {
            return $unauthorized;
        }

        $validated = $request->validate([
            'employee_no' => ['required', 'string', 'max:50'],
            'pin' => ['required', 'string', 'min:4', 'max:12'],
            'clock_in' => ['nullable', 'date'],
        ]);

        $employee = $this->resolveKioskEmployee($validated['employee_no']);
        if (! $employee) {
            return response()->json([
                'message' => 'Employee not found or inactive.',
            ], 422);
        }

        if (! $employee->attendance_pin || ! Hash::check($validated['pin'], $employee->attendance_pin)) {
            return response()->json([
                'message' => 'Invalid attendance PIN.',
            ], 422);
        }

        $clockIn = isset($validated['clock_in']) ? Carbon::parse($validated['clock_in']) : now();

        $attendance = AttendanceRecord::firstOrCreate(
            [
                'employee_id' => $employee->id,
                'work_date' => $clockIn->toDateString(),
            ],
            [
                'clock_in' => $clockIn,
                'source' => 'self_service',
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

    public function kioskClockOut(Request $request): JsonResponse
    {
        if ($unauthorized = $this->ensureKioskAccess($request)) {
            return $unauthorized;
        }

        $validated = $request->validate([
            'employee_no' => ['required', 'string', 'max:50'],
            'pin' => ['required', 'string', 'min:4', 'max:12'],
            'clock_out' => ['nullable', 'date'],
        ]);

        $employee = $this->resolveKioskEmployee($validated['employee_no']);
        if (! $employee) {
            return response()->json([
                'message' => 'Employee not found or inactive.',
            ], 422);
        }

        if (! $employee->attendance_pin || ! Hash::check($validated['pin'], $employee->attendance_pin)) {
            return response()->json([
                'message' => 'Invalid attendance PIN.',
            ], 422);
        }

        $clockOut = isset($validated['clock_out']) ? Carbon::parse($validated['clock_out']) : now();

        $attendance = AttendanceRecord::query()
            ->where('employee_id', $employee->id)
            ->whereDate('work_date', $clockOut->toDateString())
            ->first();

        if (! $attendance) {
            return response()->json([
                'message' => 'No clock-in record found for today.',
            ], 422);
        }

        if (! $attendance->clock_in) {
            return response()->json([
                'message' => 'Clock-in must be recorded before clock-out.',
            ], 422);
        }

        $attendance->clock_out = $clockOut;
        $attendance->source = 'self_service';

        $workedMinutes = max(0, $attendance->clock_in->diffInMinutes($clockOut));
        $attendance->minutes_overtime = max(0, $workedMinutes - 480);
        $attendance->minutes_undertime = max(0, 480 - $workedMinutes);

        $attendance->save();

        return response()->json([
            'data' => $attendance->fresh('employee:id,employee_no,first_name,last_name,middle_name'),
            'message' => 'Clock-out recorded successfully.',
        ]);
    }

    private function resolveKioskEmployee(string $employeeNo): ?Employee
    {
        return Employee::query()
            ->where('employee_no', trim($employeeNo))
            ->whereIn('employment_status', ['active', 'on_leave', 'pending'])
            ->first();
    }

    private function ensureKioskAccess(Request $request): ?JsonResponse
    {
        $configuredKey = (string) config('services.attendance_kiosk.key', '');
        if ($configuredKey === '') {
            return null;
        }

        $requestKey = (string) $request->header('X-Kiosk-Key', '');
        if ($requestKey === '' || ! hash_equals($configuredKey, $requestKey)) {
            return response()->json([
                'message' => 'Unauthorized kiosk device.',
            ], 403);
        }

        $allowedIps = config('services.attendance_kiosk.allowed_ips', []);
        if ($allowedIps !== [] && ! $this->isIpAllowed((string) $request->ip(), $allowedIps)) {
            return response()->json([
                'message' => 'Kiosk access is not allowed from this network.',
                'detected_ip' => (string) $request->ip(),
                'allowed_ips' => array_values(array_map(static fn ($ip) => (string) $ip, $allowedIps)),
            ], 403);
        }

        return null;
    }

    private function isIpAllowed(string $ip, array $allowedIps): bool
    {
        if ($ip === '') {
            return false;
        }

        foreach ($allowedIps as $allowedIp) {
            $allowedIp = trim((string) $allowedIp);
            if ($allowedIp === '') {
                continue;
            }

            if ($allowedIp === '*') {
                return true;
            }

            if ($allowedIp === $ip) {
                return true;
            }

            if (str_contains($allowedIp, '/') && $this->ipMatchesCidr($ip, $allowedIp)) {
                return true;
            }
        }

        return false;
    }

    private function ipMatchesCidr(string $ip, string $cidr): bool
    {
        [$subnet, $prefix] = array_pad(explode('/', $cidr, 2), 2, null);

        if ($subnet === null || $prefix === null || ! is_numeric($prefix)) {
            return false;
        }

        $ipBinary = @inet_pton($ip);
        $subnetBinary = @inet_pton($subnet);

        if ($ipBinary === false || $subnetBinary === false || strlen($ipBinary) !== strlen($subnetBinary)) {
            return false;
        }

        $bitLength = strlen($ipBinary) * 8;
        $prefixLength = (int) $prefix;

        if ($prefixLength < 0 || $prefixLength > $bitLength) {
            return false;
        }

        $fullBytes = intdiv($prefixLength, 8);
        $remainingBits = $prefixLength % 8;

        if ($fullBytes > 0 && substr($ipBinary, 0, $fullBytes) !== substr($subnetBinary, 0, $fullBytes)) {
            return false;
        }

        if ($remainingBits === 0) {
            return true;
        }

        $mask = (~(0xFF >> $remainingBits)) & 0xFF;

        return (ord($ipBinary[$fullBytes]) & $mask) === (ord($subnetBinary[$fullBytes]) & $mask);
    }
}
