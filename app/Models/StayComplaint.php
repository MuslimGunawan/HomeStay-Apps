<?php

namespace App\Models;

use Database\Factories\StayComplaintFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['booking_id', 'guest_id', 'homestay_id', 'message', 'status'])]
class StayComplaint extends Model
{
    /** @use HasFactory<StayComplaintFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Booking, $this>
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function guest(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guest_id');
    }

    /**
     * @return BelongsTo<Homestay, $this>
     */
    public function homestay(): BelongsTo
    {
        return $this->belongsTo(Homestay::class);
    }
}
