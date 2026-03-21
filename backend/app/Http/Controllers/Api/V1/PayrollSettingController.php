<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PayrollSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollSettingController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'data' => PayrollSetting::current(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tax_rate' => ['required', 'numeric', 'min:0', 'max:1'],
            'philhealth_rate' => ['required', 'numeric', 'min:0', 'max:1'],
        ]);

        $settings = PayrollSetting::current();
        $settings->update($validated);

        return response()->json([
            'data' => $settings->fresh(),
            'message' => 'Payroll settings updated successfully.',
        ]);
    }
}
