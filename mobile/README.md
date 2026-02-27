# Kinetik HRM — Mobile App

Cross-platform mobile app for the Kinetik Employee Management System, built with React Native (Expo).

## Tech Stack

- **Framework**: React Native (Expo SDK)
- **Navigation**: React Navigation (bottom tabs + stack navigators)  
- **Auth**: JWT via expo-secure-store
- **API**: Axios with interceptors (token + URL rewriting)
- **Icons**: Lucide React Native
- **Fonts**: Inter (via expo-google-fonts)

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode) or Android Emulator (Android Studio)
- Or the **Expo Go** app on your phone

### Install & Run

```bash
cd mobile
npm install

# Start dev server
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android
```

### Run on your phone
1. Install **Expo Go** from App Store / Play Store
2. Scan the QR code from `npx expo start`

## Building APK / App Bundle

### Android APK
```bash
npx expo build:android -t apk
```

### Android App Bundle (for Play Store)
```bash
npx eas build --platform android
```

### iOS (for App Store)
```bash
npx eas build --platform ios
```

> Note: For EAS builds, you need to run `npx eas login` and configure `eas.json` first.

## Project Structure

```
mobile/
├── App.tsx                    # Entry point with font loading & auth gate
├── app.json                   # Expo config (iOS + Android)
├── src/
│   ├── api/index.ts           # Axios instance with auth interceptor
│   ├── context/AuthContext.tsx # Auth provider (login/logout/refresh)
│   ├── theme/index.ts         # Design tokens (colors, fonts, spacing)
│   ├── navigation/
│   │   ├── AuthStack.tsx      # Login flow
│   │   └── AppTabs.tsx        # Bottom tab navigator
│   └── screens/
│       ├── LoginScreen.tsx
│       ├── EmployeeDashboard.tsx
│       ├── AdminDashboard.tsx
│       ├── SuperadminDashboard.tsx
│       ├── AttendanceScreen.tsx
│       ├── ChatListScreen.tsx
│       ├── ChatScreen.tsx
│       ├── LeavesScreen.tsx
│       ├── ProfileScreen.tsx
│       ├── MoreScreen.tsx
│       ├── SettingsScreen.tsx
│       ├── UsersScreen.tsx
│       ├── ProjectsScreen.tsx
│       └── TimesheetsScreen.tsx
```

## Backend

The app connects to the same backend as the web app:
- **API**: `https://employee-api-wcak.onrender.com/api`
- **Socket**: `https://employee-api-wcak.onrender.com`

## Features

- ✅ Role-based dashboards (Employee / Admin / Superadmin)
- ✅ Attendance clock-in/out with history
- ✅ Leave management
- ✅ Real-time chat
- ✅ Projects & Timesheets
- ✅ User management (admin)
- ✅ Profile & Settings
- ✅ Secure token storage (expo-secure-store)
- ✅ Pull-to-refresh on all data screens
