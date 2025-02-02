<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    protected int $id;
    protected string $name;
    protected string $email;
    protected int $age;
    protected string $gender;
    protected int $phone_number;
    protected string $profile_photo;
    protected int $longitude;
    protected int $latitude;
    protected string $created_at;

    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'age' => $this->age,
            'gender' => $this->gender,
            'phone_number' => $this->phone_number,
            'profile_photo' => $this->profile_photo,
            'longitude' => $this->longitude,
            'latitude' => $this->latitude,
            'created_at' => $this->created_at,
        ];
    }
}
