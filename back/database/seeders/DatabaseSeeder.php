<?php

namespace Database\Seeders;

use App\Models\Friendship;
use App\Models\Group;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Database\Factories\FriendshipFactory;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * php artisan db:seed
     */
    public function run(): void
    {
        Friendship::factory(10)->create();
    }
}
