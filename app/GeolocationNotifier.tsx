"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

// Calculate distance between two coordinates using Haversine formula (in meters)
function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const OFFICE_RADIUS_METERS = 500; // Notify when within 500m of office
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes
const NOTIFICATION_COOLDOWN_MS = 24 * 60 * 60 * 1000; // Don't notify more than once per 24 hours

export default function GeolocationNotifier() {
  const [enabled, setEnabled] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastNotificationRef = useRef<number>(0);
  const isNearOfficeRef = useRef(false);

  useEffect(() => {
    // Check if geolocation is available
    if (!("geolocation" in navigator)) {
      return;
    }

    // Fetch user's geolocation notification preference
    const fetchPreference = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("geolocation_notifications_enabled")
        .eq("id", user.id)
        .single();

      if (data?.geolocation_notifications_enabled) {
        setEnabled(true);
      }
    };

    fetchPreference();
  }, []);

  useEffect(() => {
    if (!enabled) {
      // Clean up any existing watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    // Request permission for geolocation
    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        setPermissionGranted(result.state === "granted");
        if (result.state === "granted") {
          startWatching();
        }
      })
      .catch(() => {
        // Try to start watching anyway - will trigger permission prompt
        startWatching();
      });

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled]);

  const startWatching = () => {
    const officeLat = parseFloat(
      process.env.NEXT_PUBLIC_OFFICE_LATITUDE || "0"
    );
    const officeLon = parseFloat(
      process.env.NEXT_PUBLIC_OFFICE_LONGITUDE || "0"
    );

    if (!officeLat || !officeLon) {
      console.warn("Office coordinates not configured");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = getDistanceInMeters(
          latitude,
          longitude,
          officeLat,
          officeLon
        );

        const isNear = distance <= OFFICE_RADIUS_METERS;
        const wasNotNear = !isNearOfficeRef.current;

        // Update ref
        isNearOfficeRef.current = isNear;

        // Only notify if:
        // 1. User just entered the office area (wasn't near before, is near now)
        // 2. Cooldown period has passed
        // 3. Notifications are supported and granted
        if (
          isNear &&
          wasNotNear &&
          Date.now() - lastNotificationRef.current > NOTIFICATION_COOLDOWN_MS
        ) {
          checkAndNotify();
        }
      },
      (error) => {
        console.warn("Geolocation error:", error.message);
      },
      {
        enableHighAccuracy: false,
        maximumAge: CHECK_INTERVAL_MS,
        timeout: 30000,
      }
    );
  };

  const checkAndNotify = async () => {
    // Check if user has already updated presence today
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: presence } = await supabase
      .from("presences")
      .select("am, pm, day")
      .eq("user_id", user.id)
      .eq("day", today)
      .single();

    // If user already has a presence for today, don't notify
    if (presence) {
      return;
    }

    // Send notification
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification("Update your presence", {
          body: "You're near the office! Don't forget to update your presence for today.",
          icon: "/android-chrome-192x192.png",
          badge: "/android-chrome-192x192.png",
          tag: "presence-reminder",
          data: { url: "/" },
          requireInteraction: false,
        });
        lastNotificationRef.current = Date.now();
      } catch (error) {
        console.warn("Failed to show notification:", error);
      }
    }
  };

  return null;
}
