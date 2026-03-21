<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminHrAccountController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $hrUser = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => 'hr',
        ]);

        return response()->json([
            'data' => [
                'id' => $hrUser->id,
                'name' => $hrUser->name,
                'email' => $hrUser->email,
                'role' => $hrUser->role,
            ],
            'message' => 'HR account created successfully.',
        ], 201);
    }
}
