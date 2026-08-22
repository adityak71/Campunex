import { NotificationPayload, NotificationCategory, NotificationPriority, NotificationState } from '@campunex/shared';

// Module-scoped persistent set of processed toast IDs across navigations and remounts
export const processedToastIdsSet = new Set<string>();

/**
 * Triggers a toast alert ONLY if the notification ID has NEVER been toasted in this browser session.
 */
export function triggerNotificationToast(
  item: NotificationPayload,
  showToastFn: (msg: string, type?: 'info' | 'success' | 'error') => void
): boolean {
  // Ignore duplicate toasts or background coordinate / connection events
  if (!item.id || processedToastIdsSet.has(item.id)) {
    return false;
  }
  if (item.type === 'GPS_UPDATE' || item.type === 'WEBSOCKET_RECONNECT') {
    return false;
  }

  // Mark as processed permanently for session
  processedToastIdsSet.add(item.id);

  // Trigger single toast popup
  const toastType = item.state === 'SUCCESS' ? 'success' : item.state === 'WARNING' || item.state === 'CRITICAL' ? 'error' : 'info';
  showToastFn(`🔔 ${item.title}`, toastType);
  return true;
}

// Comprehensive Seed Notifications for Rider
export const SEED_RIDER_NOTIFICATIONS: NotificationPayload[] = [
  // RIDE MATCHING
  {
    id: 'r_match_1',
    role: 'RIDER',
    category: 'RIDE',
    type: 'MATCHING_RIDE_AVAILABLE',
    title: 'New Matching Ride Available',
    message: 'Driver Rahul Kumar published a route matching your saved search (LPU Main Gate ➔ Jalandhar Station).',
    timestamp: '5 mins ago',
    read: false,
    state: 'ACTION_REQUIRED',
    priority: 'HIGH',
    link: '/rides/find',
    action_label: 'View Ride',
  },
  {
    id: 'r_match_2',
    role: 'RIDER',
    category: 'RIDE',
    type: 'MULTIPLE_MATCHES_AVAILABLE',
    title: 'Multiple Compatible Rides Available',
    message: '3 new compatible driver routes overlap with your commute time window.',
    timestamp: '20 mins ago',
    read: false,
    state: 'INFORMATIONAL',
    priority: 'NORMAL',
    link: '/rides/find',
    action_label: 'View Matches',
    group_count: 3,
  },
  {
    id: 'r_alert_1',
    role: 'RIDER',
    category: 'RIDE',
    type: 'ALERT_MATCH_PUBLISHED',
    title: 'Matching Ride Published for Saved Alert',
    message: 'A driver published a route matching your active alert for Phagwara Junction.',
    timestamp: '45 mins ago',
    read: true,
    state: 'INFORMATIONAL',
    priority: 'NORMAL',
    link: '/rides/find',
    action_label: 'View Ride',
  },

  // RIDE REQUESTS
  {
    id: 'r_req_1',
    role: 'RIDER',
    category: 'REQUEST',
    type: 'RIDE_REQUEST_SENT',
    title: 'Ride Request Sent',
    message: 'Your seat request has been delivered to driver Rahul Kumar.',
    timestamp: '1 hour ago',
    read: true,
    state: 'INFORMATIONAL',
    priority: 'NORMAL',
    link: '/rides/requests',
    action_label: 'View Request',
  },
  {
    id: 'r_req_2',
    role: 'RIDER',
    category: 'REQUEST',
    type: 'REQUEST_ACCEPTED',
    title: 'Driver Accepted Request',
    message: 'Driver Rahul Kumar accepted your seat booking request! Trip tracking room is active.',
    timestamp: '1.5 hours ago',
    read: false,
    state: 'SUCCESS',
    priority: 'HIGH',
    link: '/rides/requests',
    action_label: 'View Ride',
  },
  {
    id: 'r_req_3',
    role: 'RIDER',
    category: 'REQUEST',
    type: 'REQUEST_DECLINED',
    title: 'Driver Declined Request',
    message: 'Driver was unable to accept your request. Explore other compatible rides.',
    timestamp: '3 hours ago',
    read: true,
    state: 'WARNING',
    priority: 'NORMAL',
    link: '/rides/find',
    action_label: 'Find Rides',
  },

  // TRIP & OTP
  {
    id: 'r_trip_1',
    role: 'RIDER',
    category: 'TRIP',
    type: 'DRIVER_APPROACHING',
    title: 'Driver Approaching Pickup',
    message: 'Driver is within 500m of your pickup landmark (LPU Main Gate).',
    timestamp: 'Just now',
    read: false,
    state: 'ACTION_REQUIRED',
    priority: 'HIGH',
    link: '/trip/t123',
    action_label: 'View Trip',
  },
  {
    id: 'r_otp_1',
    role: 'RIDER',
    category: 'TRIP',
    type: 'START_OTP_GENERATED',
    title: 'Start OTP Ready for Verification',
    message: 'Provide your 4-digit security code upon meeting your driver.',
    timestamp: '2 mins ago',
    read: false,
    state: 'ACTION_REQUIRED',
    priority: 'HIGH',
    link: '/trip/t123',
    action_label: 'View Trip',
  },
  {
    id: 'r_trip_2',
    role: 'RIDER',
    category: 'TRIP',
    type: 'TRIP_COMPLETED',
    title: 'Trip Completed Successfully',
    message: 'Completion OTP verified. Commute transaction logged in PostgreSQL.',
    timestamp: 'Yesterday',
    read: true,
    state: 'SUCCESS',
    priority: 'NORMAL',
    link: '/trip/t123/complete',
    action_label: 'Review',
  },

  // SAFETY & ACCOUNT & SYSTEM
  {
    id: 'r_safe_1',
    role: 'RIDER',
    category: 'SAFETY',
    type: 'PRE_TRIP_SAFETY_REMINDER',
    title: 'Pre-Boarding Safety Check',
    message: 'Verify vehicle make, model, color, and registration plate (PB-08-AB-1234) before entering vehicle.',
    timestamp: '1 day ago',
    read: true,
    state: 'INFORMATIONAL',
    priority: 'NORMAL',
    link: '/safety',
    action_label: 'Safety Center',
  },
  {
    id: 'r_acc_1',
    role: 'RIDER',
    category: 'ACCOUNT',
    type: 'INSTITUTION_VERIFIED',
    title: 'University Verification Successful',
    message: 'Your .edu campus domain credentials have been verified by administration.',
    timestamp: '2 days ago',
    read: true,
    state: 'SUCCESS',
    priority: 'NORMAL',
    link: '/profile',
    action_label: 'View Profile',
  },
  {
    id: 'r_sys_1',
    role: 'RIDER',
    category: 'SYSTEM',
    type: 'SCHEDULED_MAINTENANCE',
    title: 'Scheduled System Maintenance',
    message: 'Platform maintenance scheduled for Sunday 2:00 AM - 3:00 AM IST.',
    timestamp: '3 days ago',
    read: true,
    state: 'INFORMATIONAL',
    priority: 'LOW',
    link: '/help',
    action_label: 'Details',
  },
];

// Comprehensive Seed Notifications for Driver
export const SEED_DRIVER_NOTIFICATIONS: NotificationPayload[] = [
  // RIDE REQUESTS
  {
    id: 'd_req_1',
    role: 'DRIVER',
    category: 'REQUEST',
    type: 'NEW_RIDER_REQUEST',
    title: 'New Rider Request',
    message: 'Aditya Kumar requested 1 seat for your LPU Main Gate ➔ Jalandhar Station route.',
    timestamp: '3 mins ago',
    read: false,
    state: 'ACTION_REQUIRED',
    priority: 'HIGH',
    link: '/driver/requests',
    action_label: 'View Request',
  },
  {
    id: 'd_req_2',
    role: 'DRIVER',
    category: 'REQUEST',
    type: 'MULTIPLE_REQUESTS',
    title: '3 New Rider Requests Received',
    message: 'You have 3 pending seat requests waiting for confirmation.',
    timestamp: '15 mins ago',
    read: false,
    state: 'ACTION_REQUIRED',
    priority: 'HIGH',
    link: '/driver/requests',
    action_label: 'View Requests',
    group_count: 3,
  },
  {
    id: 'd_req_3',
    role: 'DRIVER',
    category: 'REQUEST',
    type: 'REQUEST_CANCELLED_BY_RIDER',
    title: 'Rider Request Cancelled',
    message: 'Passenger cancelled their pending seat booking request.',
    timestamp: '40 mins ago',
    read: true,
    state: 'WARNING',
    priority: 'NORMAL',
    link: '/driver/rides',
    action_label: 'View Ride',
  },

  // DRIVER RIDE
  {
    id: 'd_ride_1',
    role: 'DRIVER',
    category: 'RIDE',
    type: 'RIDE_PUBLISHED_SUCCESSFULLY',
    title: 'Ride Published Successfully',
    message: 'Your route from LPU Campus Gate 1 is now open for PostGIS route matching.',
    timestamp: '1 hour ago',
    read: true,
    state: 'SUCCESS',
    priority: 'NORMAL',
    link: '/driver/rides',
    action_label: 'View Ride',
  },
  {
    id: 'd_ride_2',
    role: 'DRIVER',
    category: 'RIDE',
    type: 'RIDE_FULL',
    title: 'Ride Fully Booked',
    message: 'All 3 passenger seats have been reserved for your upcoming commute.',
    timestamp: '2 hours ago',
    read: false,
    state: 'INFORMATIONAL',
    priority: 'NORMAL',
    link: '/driver/rides',
    action_label: 'View Ride',
  },

  // TRIP & OTP
  {
    id: 'd_trip_1',
    role: 'DRIVER',
    category: 'TRIP',
    type: 'RIDER_APPROACHING_PICKUP',
    title: 'Rider Approaching Pickup Point',
    message: 'Rider Aditya Kumar is within 500m proximity of your pickup landmark.',
    timestamp: 'Just now',
    read: false,
    state: 'ACTION_REQUIRED',
    priority: 'HIGH',
    link: '/trip/t123',
    action_label: 'View Trip',
  },
  {
    id: 'd_otp_1',
    role: 'DRIVER',
    category: 'TRIP',
    type: 'START_OTP_REQUIRED',
    title: 'Start OTP Verification Required',
    message: 'Ask rider for their 4-digit initiation OTP upon meeting them.',
    timestamp: '5 mins ago',
    read: false,
    state: 'ACTION_REQUIRED',
    priority: 'HIGH',
    link: '/trip/t123/start',
    action_label: 'View Trip',
  },
  {
    id: 'd_trip_2',
    role: 'DRIVER',
    category: 'TRIP',
    type: 'TRIP_COMPLETED',
    title: 'Trip Completed Successfully',
    message: 'Completion OTP verified. Trip recorded in PostgreSQL history.',
    timestamp: 'Yesterday',
    read: true,
    state: 'SUCCESS',
    priority: 'NORMAL',
    link: '/driver/history',
    action_label: 'Review',
  },

  // SAFETY & ACCOUNT & SYSTEM
  {
    id: 'd_safe_1',
    role: 'DRIVER',
    category: 'SAFETY',
    type: 'SAFETY_REMINDER',
    title: 'Driver Community Safety Reminder',
    message: 'Always verify rider identity before entering vehicle. Never bypass 4-digit OTP checks.',
    timestamp: '1 day ago',
    read: true,
    state: 'INFORMATIONAL',
    priority: 'NORMAL',
    link: '/driver/safety',
    action_label: 'Safety Center',
  },
  {
    id: 'd_acc_1',
    role: 'DRIVER',
    category: 'ACCOUNT',
    type: 'VEHICLE_VERIFICATION_SUCCESSFUL',
    title: 'Vehicle Registration Approved',
    message: 'Honda Civic (PB-08-AB-1234) verified for campus ride publishing.',
    timestamp: '2 days ago',
    read: true,
    state: 'SUCCESS',
    priority: 'NORMAL',
    link: '/driver/profile',
    action_label: 'View Profile',
  },
];

// Helper to deduplicate array of notifications by ID
export function deduplicateNotifications(items: NotificationPayload[]): NotificationPayload[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
