import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface ReminderNotification {
  reminderId: string;
  title: string;
  subject?: string;
  description?: string;
  dueDate: Date;
}

export class NotificationService {
  static async configure(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(
          'recordatorios',
          {
            name: 'Recordatorios académicos',
            description:
              'Avisos de tareas y actividades próximas a vencer',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            sound: 'default',
            enableVibrate: true,
            showBadge: true,
          }
        );

        await Notifications.setNotificationChannelAsync(
          'nuevas-tareas',
          {
            name: 'Nuevas tareas',
            description:
              'Avisos inmediatos cuando un profesor crea una tarea',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            sound: 'default',
            enableVibrate: true,
            showBadge: true,
          }
        );
      }

      const currentPermissions =
        await Notifications.getPermissionsAsync();

      let finalStatus = currentPermissions.status;

      if (finalStatus !== 'granted') {
        const requestedPermissions =
          await Notifications.requestPermissionsAsync();

        finalStatus = requestedPermissions.status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error(
        'Error configurando notificaciones:',
        error
      );

      return false;
    }
  }

  static async getExpoPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.warn(
          'El Expo Push Token debe obtenerse en un dispositivo físico.'
        );

        return null;
      }

      const hasPermission = await this.configure();

      if (!hasPermission) {
        console.warn(
          'No se concedieron permisos para notificaciones.'
        );

        return null;
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      if (!projectId) {
        console.error(
          'No se encontró el projectId de EAS.'
        );

        return null;
      }

      const tokenResponse =
        await Notifications.getExpoPushTokenAsync({
          projectId,
        });

      return tokenResponse.data;
    } catch (error: any) {
  console.error(
    'Error obteniendo Expo Push Token:',
    error
  );

  throw new Error(
    error?.message ||
      'No se pudo obtener el Expo Push Token.'
  );
}
  }

  private static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  private static async scheduleSingleNotification(
    reminder: ReminderNotification,
    notificationType: '24h' | '1h' | 'same-day',
    notificationDate: Date,
    message: string
  ): Promise<string | null> {
    try {
      if (notificationDate.getTime() <= Date.now()) {
        return null;
      }

      return await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.subject
            ? `${reminder.subject}: ${reminder.title}`
            : reminder.title,
          body: message,
          sound: 'default',
          data: {
            reminderId: reminder.reminderId,
            notificationType,
            dueDate: reminder.dueDate.toISOString(),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notificationDate,
          channelId:
            Platform.OS === 'android'
              ? 'recordatorios'
              : undefined,
        },
      });
    } catch (error) {
      console.error(
        `Error programando notificación ${notificationType}:`,
        error
      );

      return null;
    }
  }

  static async scheduleReminderNotifications(
    reminder: ReminderNotification
  ): Promise<string[]> {
    const hasPermission = await this.configure();

    if (!hasPermission) {
      return [];
    }

    const dueDate = new Date(reminder.dueDate);

    if (Number.isNaN(dueDate.getTime())) {
      return [];
    }

    const notificationIds: string[] = [];

    const twentyFourHoursBefore = new Date(
      dueDate.getTime() - 24 * 60 * 60 * 1000
    );

    const oneHourBefore = new Date(
      dueDate.getTime() - 60 * 60 * 1000
    );

    const sameDay = new Date(dueDate);
    sameDay.setHours(8, 0, 0, 0);

    const notification24Hours =
      await this.scheduleSingleNotification(
        reminder,
        '24h',
        twentyFourHoursBefore,
        `La actividad vence mañana: ${this.formatDate(
          dueDate
        )}.`
      );

    if (notification24Hours) {
      notificationIds.push(notification24Hours);
    }

    const notification1Hour =
      await this.scheduleSingleNotification(
        reminder,
        '1h',
        oneHourBefore,
        'Falta una hora para que venza esta actividad.'
      );

    if (notification1Hour) {
      notificationIds.push(notification1Hour);
    }

    const notificationSameDay =
      await this.scheduleSingleNotification(
        reminder,
        'same-day',
        sameDay,
        `Esta actividad vence hoy: ${this.formatDate(
          dueDate
        )}.`
      );

    if (notificationSameDay) {
      notificationIds.push(notificationSameDay);
    }

    return notificationIds;
  }

  static async cancelNotificationsByReminderId(
    reminderId: string
  ): Promise<void> {
    try {
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();

      const matchingNotifications =
        scheduledNotifications.filter(
          (notification) =>
            notification.content.data?.reminderId ===
            reminderId
        );

      await Promise.all(
        matchingNotifications.map((notification) =>
          Notifications.cancelScheduledNotificationAsync(
            notification.identifier
          )
        )
      );
    } catch (error) {
      console.error(
        'Error cancelando notificaciones del recordatorio:',
        error
      );
    }
  }

  static async syncReminderNotifications(
    reminder: ReminderNotification
  ): Promise<string[]> {
    try {
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();

      const expectedDueDate =
        reminder.dueDate.toISOString();

      const currentNotifications =
        scheduledNotifications.filter(
          (notification) =>
            notification.content.data?.reminderId ===
            reminder.reminderId
        );

      const notificationsAreUpdated =
        currentNotifications.length > 0 &&
        currentNotifications.every(
          (notification) =>
            notification.content.data?.dueDate ===
            expectedDueDate
        );

      if (notificationsAreUpdated) {
        return currentNotifications.map(
          (notification) =>
            notification.identifier
        );
      }

      await this.cancelNotificationsByReminderId(
        reminder.reminderId
      );

      return this.scheduleReminderNotifications(
        reminder
      );
    } catch (error) {
      console.error(
        'Error sincronizando notificaciones:',
        error
      );

      return [];
    }
  }

  static async showTestNotification(): Promise<
    string | null
  > {
    try {
      const hasPermission = await this.configure();

      if (!hasPermission) {
        return null;
      }

      return await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Agenda Inteligente 🔔',
          body:
            'Prueba: tienes una actividad próxima a vencer.',
          sound: 'default',
          data: {
            type: 'test',
          },
        },
        trigger: {
          type:
            Notifications
              .SchedulableTriggerInputTypes
              .TIME_INTERVAL,
          seconds: 5,
          repeats: false,
          channelId:
            Platform.OS === 'android'
              ? 'recordatorios'
              : undefined,
        },
      });
    } catch (error) {
      console.error(
        'Error programando notificación de prueba:',
        error
      );

      return null;
    }
  }

  static async cancelAllReminderNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error(
        'Error cancelando notificaciones:',
        error
      );
    }
  }

  static async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error(
        'Error consultando notificaciones:',
        error
      );

      return [];
    }
  }
}