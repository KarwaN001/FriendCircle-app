<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::where('id', '!=', $request->user()->id)->get();
        \Log::info($users);
        return UserResource::collection($users);
    }

    public function show(Request $request)
    {
        $user = $request->user();
        \Log::info($user);
        return new UserResource($user);
    }
}
