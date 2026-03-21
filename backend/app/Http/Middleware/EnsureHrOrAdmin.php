<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHrOrAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $actorUserId = $request->integer('actor_user_id') ?: (int) $request->header('X-Actor-User-Id');

        if (! $actorUserId) {
            return new JsonResponse([
                'message' => 'actor_user_id or X-Actor-User-Id header is required.',
            ], 401);
        }

        $actor = User::query()->find($actorUserId);

        if (! $actor) {
            return new JsonResponse([
                'message' => 'Actor user not found.',
            ], 401);
        }

        if (! in_array($actor->role, ['admin', 'hr'], true)) {
            return new JsonResponse([
                'message' => 'Access denied. Only HR or Admin can perform this action.',
            ], 403);
        }

        $request->attributes->set('actor_user', $actor);

        return $next($request);
    }
}
