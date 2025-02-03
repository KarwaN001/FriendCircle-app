<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('device_name');
            $table->string('refresh_token', 64);
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['refresh_token', 'device_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refresh_tokens');
    }
};
