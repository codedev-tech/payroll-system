<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->with('employeeProfile.department:id,name')
            ->where('email', $validated['email'])
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        if ($user->role === 'employee') {
            return response()->json([
                'message' => 'Employee role is not supported.',
            ], 403);
        }

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'employee_profile' => $user->employeeProfile,
            ],
            'message' => 'Login successful.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::query()
            ->with('employeeProfile.department:id,name')
            ->findOrFail($validated['user_id']);

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'employee_profile' => $user->employeeProfile,
            ],
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $actorUserId = $request->integer('actor_user_id') ?: (int) $request->header('X-Actor-User-Id');

        if (! $actorUserId) {
            return response()->json([
                'message' => 'actor_user_id or X-Actor-User-Id header is required.',
            ], 401);
        }

        $user = User::query()->find($actorUserId);

        if (! $user) {
            return response()->json([
                'message' => 'Actor user not found.',
            ], 401);
        }

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->update([
            'password' => $validated['new_password'],
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }
}
