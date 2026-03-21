<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('app:create-system-user {role : admin or hr} {email} {name}', function (string $role, string $email, string $name) {
    $normalizedRole = strtolower(trim($role));
    if (! in_array($normalizedRole, ['admin', 'hr'], true)) {
        $this->error('Invalid role. Allowed values: admin, hr');

        return 1;
    }

    if (User::query()->where('email', $email)->exists()) {
        $this->error('Email already exists: '.$email);

        return 1;
    }

    $password = $this->secret('Enter password (min 8 chars):');
    if (! is_string($password) || strlen($password) < 8) {
        $this->error('Password must be at least 8 characters.');

        return 1;
    }

    $confirmPassword = $this->secret('Confirm password:');
    if ($password !== $confirmPassword) {
        $this->error('Password confirmation does not match.');

        return 1;
    }

    $user = User::query()->create([
        'name' => $name,
        'email' => $email,
        'password' => $password,
        'role' => $normalizedRole,
    ]);

    $this->info(ucfirst($normalizedRole).' account created successfully.');
    $this->line('User ID: '.$user->id);
    $this->line('Email: '.$user->email);

    return 0;
})->purpose('Create an initial admin or hr account securely via CLI.');
