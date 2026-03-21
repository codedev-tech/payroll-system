<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'tax_rate',
        'philhealth_rate',
    ];

    protected function casts(): array
    {
        return [
            'tax_rate' => 'float',
            'philhealth_rate' => 'float',
        ];
    }

    public static function current(): self
    {
        return self::query()->firstOrCreate([], [
            'tax_rate' => 0.08,
            'philhealth_rate' => 0.03,
        ]);
    }
}
