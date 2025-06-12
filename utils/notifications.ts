import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Medication } from "./storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  let token: string | null = null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  try {
    const response = await Notifications.getExpoPushTokenAsync();
    token = response.data;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#1a8e2d",

      });
    }

    return token;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
}


export async function scheduleMedicationReminder(
  medication: Medication
): Promise<string | undefined> {
  if (!medication.reminderEnabled) return;

  try {
    // Schedule notifications for each time
    for (const time of medication.times) {
      const [hours, minutes] = time.split(":").map(Number);
      const now = new Date();
      const today = new Date();
      today.setHours(hours, minutes, 0, 0);

      // If time has passed for today, schedule for tomorrow

      const delaySeconds = Math.floor((today.getTime() - now.getTime()) / 1000);

      // 🔔 One-time notification today (only if time is still ahead)
      if (delaySeconds > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Medication Reminder",
            body: `Time to take ${medication.name} (${medication.dosage})`,
            data: { medicationId: medication.id },
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: delaySeconds,
            repeats: false,
          },
        });
      }


      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Medication Reminder",
          body: `Time to take ${medication.name} (${medication.dosage})`,
          data: { medicationId: medication.id },
          sound: 'default'
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
          repeats: true,
        } as any,
      });

      return identifier;
    }
  } catch (error) {
    console.error("Error scheduling medication reminder:", error);
    return undefined;
  }
}


export async function cancelMedicationReminders(
  medicationId: string
): Promise<void> {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      const data = notification.content.data as {
        medicationId?: string;
      } | null;
      if (data?.medicationId === medicationId) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
      }
    }
  } catch (error) {
    console.error("Error canceling medication reminders:", error);
  }
}


export async function updateMedicationReminders(
  medication: Medication
): Promise<void> {
  try {
    // Cancel existing reminders
    await cancelMedicationReminders(medication.id);

    // Schedule new reminders
    await scheduleMedicationReminder(medication);
  } catch (error) {
    console.error("Error updating medication reminders:", error);
  }
}


export async function scheduleRefillReminder(medication: Medication): Promise<string | undefined> {

  if (!medication.refillReminder) return;
  try {
    if (medication.currentSupply <= medication.refillAt) {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Refill Reminder',
          body: `Your ${medication.name} supply is running low. Current supply: ${medication.currentSupply}`,
          data: { medicationId: medication.id, type: "refill" },
        },
        trigger: null,
      });
      return identifier;
    }

  }
  catch (error) {
    console.error('Error scheduling refill reminder :', error);
    return undefined;
  }
}

export async function schedulePeriodNotifications(startDate: Date): Promise<void> {
  const hydrationMotivationMessages = [
    "Stay hydrated! 💧 Your body will thank you.",
    "You're doing great! Take care of yourself. 💖",
    "Drink some water and keep shining! ✨",
    "Reminder: Hydration = Energy 🚰💪",
    "Take a moment to rest and refresh. 🌸",
  ];

  try {
    const now = new Date();
    const prePeriodDate = new Date(startDate);
    prePeriodDate.setDate(startDate.getDate() - 3);
    const prePeriodSeconds = Math.floor((prePeriodDate.getTime() - now.getTime()) / 1000);

    if (prePeriodSeconds > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Period Reminder ⏰",
          body: "Your period may start in 3 days. Get ready and take care! 🩷",
          sound: "default",
        },
        trigger: {
          type: 'timeInterval',
          seconds: prePeriodSeconds,
          repeats: false,
        } as Notifications.TimeIntervalTriggerInput,
      });
    }

    // 5-day hydration/motivation reminders during period
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    for (let i = 0; i < 5; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      day.setHours(9, 0, 0, 0);

      const message = hydrationMotivationMessages[i % hydrationMotivationMessages.length];


      for (let j = 0; j < 7; j++) {  // 7 notifications every 2 hours from 9am to 9pm
        const notificationTime = new Date(day.getTime() + j * TWO_HOURS);
        const secondsUntilNotification = Math.floor((notificationTime.getTime() - now.getTime()) / 1000);

        if (secondsUntilNotification > 0) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Period Care 💞",
              body: message,
              sound: "default",
            },
            trigger: {
              type: "timeInterval",
              seconds: secondsUntilNotification,
              repeats: false,
            } as any,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error scheduling period notifications:", error);
  }
}
