<?php

namespace App\Models;

use Database\Factories\HomestayFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'name', 'slug', 'description', 'address', 'city', 'price_per_night', 'max_guests', 'latitude', 'longitude', 'status', 'category'])]
class Homestay extends Model
{
    /** @use HasFactory<HomestayFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price_per_night' => 'decimal:2',
            'max_guests' => 'integer',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    /**
     * @param  Builder<Homestay>  $query
     * @return Builder<Homestay>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return HasMany<HomestayMedia, $this>
     */
    public function media(): HasMany
    {
        return $this->hasMany(HomestayMedia::class);
    }

    /**
     * @return HasMany<RoomMedia, $this>
     */
    public function roomMedia(): HasMany
    {
        return $this->hasMany(RoomMedia::class);
    }

    /**
     * @return BelongsToMany<Amenity, $this>
     */
    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class);
    }

    /**
     * @return HasMany<Booking, $this>
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * @return HasMany<Review, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * @return HasMany<StayComplaint, $this>
     */
    public function stayComplaints(): HasMany
    {
        return $this->hasMany(StayComplaint::class);
    }

    /**
     * Get the average rating of the homestay.
     */
    public function getAverageRatingAttribute(): float
    {
        return (float) ($this->reviews()->avg('rating') ?? 0);
    }
}
