# Geolocation-Based Presence Reminders

## Overview

This feature allows users to receive automatic notifications when they are near the office, reminding them to update their presence status.

## How It Works

1. **Geolocation Monitoring**: When enabled, the app monitors the user's location in the background
2. **Distance Calculation**: Uses the Haversine formula to calculate distance from the office
3. **Smart Notifications**: Only sends notifications when:
   - User enters the office vicinity (within 500m radius)
   - User hasn't updated their presence today
   - At least 24 hours have passed since the last notification

## Setup

### 1. Environment Variables

Add the office coordinates to your `.env` file:

```env
NEXT_PUBLIC_OFFICE_LATITUDE=48.693495604098935
NEXT_PUBLIC_OFFICE_LONGITUDE=6.186899250161665
```

### 2. Database Migration

Run the migration to add the geolocation preference column:

```bash
# Apply the migration using your Supabase setup
# The migration file: supabase/migrations/20251022120000_add_geolocation_notifications_to_profiles.sql
```

### 3. Browser Permissions

Users must grant two permissions:

- **Notification Permission**: To receive notifications
- **Geolocation Permission**: To track location

## User Activation

Users can enable/disable this feature via the location toggle in the menu bar (next to the notification bell icon):

- 🌍 Green icon = Location reminders enabled
- 🌍 Gray icon with slash = Location reminders disabled

## Technical Details

### Components

- **`GeolocationNotifier.tsx`**: Main component that handles geolocation tracking
- **`Menu.tsx`**: Updated with geolocation toggle
- **`icons.tsx`**: New location icons (LocationOnIcon, LocationOffIcon)

### Settings

- **Detection Radius**: 500 meters from office
- **Check Interval**: Every 5 minutes (browser optimized)
- **Notification Cooldown**: 24 hours minimum between notifications
- **Default State**: Disabled (users must opt-in)

### Privacy

- Location tracking only occurs when explicitly enabled by the user
- Location data is processed client-side only
- No location data is stored on the server
- Users can disable the feature at any time

## Testing

To test the feature locally:

1. Enable location services in your browser
2. Toggle the location icon in the menu to "On"
3. Grant geolocation permission when prompted
4. Simulate location near the office using browser DevTools:
   - Chrome: DevTools → More Tools → Sensors → Location
   - Firefox: DevTools → Settings → Enable custom location
   - Set to: Latitude 48.693495604098935, Longitude 6.186899250161665

## Troubleshooting

### Notifications not appearing

- Check if notification permission is granted
- Verify geolocation permission is granted
- Ensure service worker is registered
- Check browser console for errors

### Toggle not working

- Verify the database migration has been applied
- Check the `geolocation_notifications_enabled` column exists in the profiles table
- Ensure user is authenticated

### Location not being detected

- Verify office coordinates are set in environment variables
- Check if browser supports Geolocation API
- Ensure device location services are enabled
- Try refreshing geolocation permissions
