<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'homestay_id',
        'check_in',
        'check_out',
        'total_guests',
    ];

    protected $casts = [
        'check_in' => 'date',
        'check_out' => 'date',
        'total_guests' => 'integer',
    ];

    /**
     * Get the user who owns the cart item.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the homestay in this cart item.
     */
    public function homestay(): BelongsTo
    {
        return $this->belongsTo(Homestay::class);
    }
}
