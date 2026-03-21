<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\LeaveType;
use Illuminate\Database\Seeder;

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

        $this->command?->info('Seeded master data only (departments and leave types).');
    }
}
