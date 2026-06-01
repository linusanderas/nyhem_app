import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let pushToken: string | null = null;

export async function initNotifications(): Promise<void> {
  if (!Device.isDevice) {
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notiser',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    return;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  pushToken = tokenData.data;
}

export function getPushToken(): string | null {
  return pushToken;
}

export async function subscribeToEventTopic(_eventId: number): Promise<void> {
  // FCM topic subscription requires a server component.
  // Store the preference; the backend handles FCM subscribe via Admin SDK.
}

export async function unsubscribeFromEventTopic(_eventId: number): Promise<void> {
  // FCM topic unsubscription requires a server component.
  // Store the preference; the backend handles FCM unsubscribe via Admin SDK.
}

export function onNotificationTapped(callback: (eventId: number) => void) {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const eventId = response.notification.request.content.data?.eventId;
    if (typeof eventId === 'number') {
      callback(eventId);
    }
  });
  return () => sub.remove();
}
