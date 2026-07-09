<?php

namespace App\Models;

use Database\Factories\RoomMediaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['homestay_id', 'file_path', 'type', 'category', 'custom_category', 'is_primary'])]
class RoomMedia extends Model
{
    /** @use HasFactory<RoomMediaFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Homestay, $this>
     */
    public function homestay(): BelongsTo
    {
        return $this->belongsTo(Homestay::class);
    }

    /**
     * Get the file path with a fallback prefix for shared hosting.
     */
    public function getFilePathAttribute(?string $value): ?string
    {
        return $value ? str_replace('/storage/', '/uploads/', $value) : null;
    }
}
