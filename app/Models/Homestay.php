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

#[Fillable(['user_id', 'name', 'slug', 'description', 'address', 'city', 'price_per_night', 'max_guests', 'status', 'category'])]
class Homestay extends Model
{
    /** @use HasFactory<HomestayFactory> */
    use HasFactory;

    protected $appends = ['display_status', 'average_rating'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price_per_night' => 'decimal:2',
            'max_guests' => 'integer',
        ];
    }

    /**
     * @param  Builder<Homestay>  $query
     * @return Builder<Homestay>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', ['active', 'aktif']);
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

    /**
     * Get the dynamic display status of the room (aktif, tersewa, tutup).
     */
    public function getDisplayStatusAttribute(): string
    {
        if ($this->status === 'inactive' || $this->status === 'tutup') {
            return 'tutup';
        }

        $today = now()->format('Y-m-d');

        // A room is considered 'tersewa' if it has a confirmed booking for today
        $isOccupied = $this->bookings()
            ->where('status', 'confirmed')
            ->where('check_in', '<=', $today)
            ->where('check_out', '>=', $today)
            ->exists();

        return $isOccupied ? 'tersewa' : 'aktif';
    }
}
