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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Guest
            $table->foreignId('homestay_id')->constrained()->onDelete('cascade');
            $table->foreignId('payment_method_id')->nullable()->constrained()->onDelete('set null');
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('total_guests');
            $table->decimal('total_price', 12, 2);
            $table->string('payment_receipt_path')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('status')->default('pending_payment'); // pending_payment, pending_approval, confirmed, completed, cancelled
            $table->timestamps();

            // Indexing for faster date overlap checks
            $table->index(['homestay_id', 'check_in', 'check_out']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
