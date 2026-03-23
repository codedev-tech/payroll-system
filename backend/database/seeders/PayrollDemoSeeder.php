<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\LeaveType;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class PayrollDemoSeeder extends Seeder
{
    public function run(): void

    {

        Department::query()->updateOrCreate(
            ['code' => 'ENG'],
            [
                'name' => 'Engineering',
                'description' => 'Engineering Department',
                'status' => 'active',
            ]
        );

        Department::query()->updateOrCreate(
            ['code' => 'HR'],
            [
                'name' => 'Human Resources',
                'description' => 'Human Resources Department',
                'status' => 'active',
            ]
        );

        Department::query()->updateOrCreate(
            ['code' => 'FIN'],
            [
                'name' => 'Finance',
                'description' => 'Finance Department',
                'status' => 'active',
            ]
        );

        LeaveType::query()->updateOrCreate(
            ['code' => 'VL'],
            [
                'name' => 'Vacation Leave',
                'is_paid' => true,
                'annual_allocation' => 10,
                'requires_approval' => true,
            ]
        );

        LeaveType::query()->updateOrCreate(
            ['code' => 'SL'],
            [
                'name' => 'Sick Leave',
                'is_paid' => true,
                'annual_allocation' => 10,
                'requires_approval' => true,
            ]
        );

        // USERS (IMPORTANT)
User::updateOrCreate(
    ['email' => 'admin@gmail.com'],
    [
        'name' => 'Admin',
        'password' => Hash::make('123456'),
        'role' => 'admin',
    ]
);

User::updateOrCreate(
    ['email' => 'hr@gmail.com'],
    [
        'name' => 'HR User',
        'password' => Hash::make('123456'),
        'role' => 'hr',
    ]
);

        $this->command?->info('Seeded master data only (departments and leave types).');
    }
}
