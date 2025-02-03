# FriendCircle - Group-Based Location Sharing & Chat App

FriendCircle is a modern application that combines location sharing and group chat functionality, allowing users to stay connected with their friends, family, and colleagues through real-time location tracking and communication.

## 🌟 Key Features

### 👥 Group Management
- Create and join multiple groups (family, friends, colleagues)
- Invite members via unique links or invitation codes
- Admin controls for group management
- Customizable group settings

### 📍 Location Sharing
- Daily location check-in system
- Real-time location tracking on interactive maps
- Privacy controls for location precision
- Optional location history tracking
- Check-in reminders and notifications

### 💬 Group Chat
- Real-time messaging within groups
- Media sharing (photos/videos)
- Message reactions and emoji support
- Message notifications
- Chat moderation tools for admins

### 🔐 Privacy & Security
- Secure user authentication
- Granular privacy controls
- Location data encryption
- Group-specific sharing settings

### 🔔 Smart Notifications
- Check-in reminders
- New message alerts
- Location update notifications
- Customizable notification preferences

## 🏗️ Technical Architecture

### Frontend (`/front`)
- Reactnative for app interface
- Modern, responsive UI design
- Real-time updates using WebSocket
- Google Maps integration

### Backend (`/back`)
- Laravel PHP framework
- RESTful API architecture
- Real-time event handling
- Secure authentication system

### Key Technologies
- **Frontend**: React.js
- **Backend**: Laravel
- **Database**: MySQL
- **Maps**: Google Maps API
- **Real-time Communication**: WebSocket
- **Authentication**: JWT/Session-based
- **Push Notifications**: Firebase Cloud Messaging

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PHP 8.1 or higher
- Composer
- MySQL
- Google Maps API key
- Firebase project (for notifications)


2. Frontend Setup:
```bash
cd front
npm install
npm start
```

3. Backend Setup:
```bash
cd back
composer install
cp .env.example .env
# Configure your database and API keys
php artisan key:generate
php artisan migrate
php artisan serve
```

## 📱 Features in Detail

### User Authentication
- Secure signup/login system
- Profile management
- Password recovery
- Session management

### Group Features
- Group creation and management
- Member roles (admin, moderator, member)
- Invitation system
- Group settings customization

### Location Services
- Daily check-in system
- Real-time location updates
- Location history
- Privacy controls
- Map visualization

### Chat System
- Real-time messaging
- Media sharing
- Message reactions
- Chat history
- Moderation tools

## 🤝 Contributing

We welcome contributions to FriendCircle! Please read our contributing guidelines before submitting pull requests.

## 👥 Team

- [Karwan] - Frontend Developer
- [Rezdar] - Backend Developer


