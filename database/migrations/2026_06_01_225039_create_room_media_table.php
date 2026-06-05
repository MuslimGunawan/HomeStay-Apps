<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('room_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('homestay_id')->constrained()->onDelete('cascade');
            $table->string('file_path');
            $table->string('type')->default('image'); // image, video
            $table->string('category')->default('bedroom_1'); // bedroom_1, bedroom_2, bathroom, living_room, kitchen, custom
            $table->string('custom_category')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_media');
    }
};
