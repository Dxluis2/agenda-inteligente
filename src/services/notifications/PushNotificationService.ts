import {
  doc,
  getDoc,
} from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';

type NewTaskPushData = {
  studentIds: string[];
  taskId: string;
  courseId: string;
  subjectName: string;
  title: string;
  dueDate: string;
  dueTime: string;
};

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  sound: 'default';
  channelId: string;
  priority: 'high';
  data: {
    type: string;
    taskId: string;
    courseId: string;
  };
};

type PushTicket = {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?: string;
  };
};

type ExpoPushResponse = {
  data?: PushTicket[];
  errors?: Array<{
    code?: string;
    message?: string;
  }>;
};

export class PushNotificationService {
  private static readonly EXPO_PUSH_URL =
    'https://exp.host/--/api/v2/push/send';

  private static isValidExpoPushToken(
    token: unknown
  ): token is string {
    if (typeof token !== 'string') {
      return false;
    }

    return (
      token.startsWith('ExponentPushToken[') ||
      token.startsWith('ExpoPushToken[')
    );
  }

  private static async getStudentPushTokens(
    studentIds: string[]
  ): Promise<string[]> {
    const uniqueStudentIds = [
      ...new Set(
        studentIds.filter(
          (studentId) =>
            typeof studentId === 'string' &&
            studentId.trim().length > 0
        )
      ),
    ];

    const tokens = await Promise.all(
      uniqueStudentIds.map(
        async (studentId): Promise<string | null> => {
          try {
            const userSnapshot = await getDoc(
              doc(db, 'users', studentId)
            );

            if (!userSnapshot.exists()) {
              return null;
            }

            const userData = userSnapshot.data();

            if (
              userData.role !== 'student' ||
              userData.active === false ||
              userData.pushNotificationsEnabled === false
            ) {
              return null;
            }

            const token = userData.expoPushToken;

            return this.isValidExpoPushToken(token)
              ? token
              : null;
          } catch (error) {
            console.error(
              `No se pudo obtener el token del alumno ${studentId}:`,
              error
            );

            return null;
          }
        }
      )
    );

    return [
      ...new Set(
        tokens.filter(
          (token): token is string =>
            token !== null
        )
      ),
    ];
  }

  private static createMessage(
    token: string,
    task: NewTaskPushData
  ): ExpoPushMessage {
    const subject =
      task.subjectName.trim() || 'Tu curso';

    return {
      to: token,
      title: `Nuevo recordatorio: ${subject}`,
      body:
        `${task.title} · Entrega: ` +
        `${task.dueDate} a las ${task.dueTime}`,
      sound: 'default',
      channelId: 'nuevas-tareas',
      priority: 'high',
      data: {
        type: 'new-task',
        taskId: task.taskId,
        courseId: task.courseId,
      },
    };
  }

  private static splitIntoChunks<T>(
    items: T[],
    size: number
  ): T[][] {
    const chunks: T[][] = [];

    for (
      let index = 0;
      index < items.length;
      index += size
    ) {
      chunks.push(
        items.slice(index, index + size)
      );
    }

    return chunks;
  }

  private static async sendMessageBatch(
    messages: ExpoPushMessage[]
  ): Promise<PushTicket[]> {
    const response = await fetch(
      this.EXPO_PUSH_URL,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      }
    );

    const responseData =
      (await response.json()) as ExpoPushResponse;

    if (!response.ok) {
      const expoError =
        responseData.errors?.[0]?.message;

      throw new Error(
        expoError ||
          `Expo respondió con el código ${response.status}.`
      );
    }

    return responseData.data ?? [];
  }

  static async sendNewTaskNotification(
    task: NewTaskPushData
  ): Promise<{
    tokensFound: number;
    accepted: number;
    rejected: number;
  }> {
    try {
      const tokens =
        await this.getStudentPushTokens(
          task.studentIds
        );

      if (tokens.length === 0) {
        console.warn(
          'No se encontraron alumnos con token push registrado.'
        );

        return {
          tokensFound: 0,
          accepted: 0,
          rejected: 0,
        };
      }

      const messages = tokens.map((token) =>
        this.createMessage(token, task)
      );

      const batches = this.splitIntoChunks(
        messages,
        100
      );

      const allTickets: PushTicket[] = [];

      for (const batch of batches) {
        const tickets =
          await this.sendMessageBatch(batch);

        allTickets.push(...tickets);
      }

      const accepted = allTickets.filter(
        (ticket) => ticket.status === 'ok'
      ).length;

      const rejected = allTickets.filter(
        (ticket) => ticket.status === 'error'
      ).length;

      allTickets
        .filter(
          (ticket) => ticket.status === 'error'
        )
        .forEach((ticket) => {
          console.warn(
            'Expo rechazó una notificación:',
            ticket.message,
            ticket.details
          );
        });

      return {
        tokensFound: tokens.length,
        accepted,
        rejected,
      };
    } catch (error) {
      console.error(
        'Error enviando notificación push:',
        error
      );

      return {
        tokensFound: 0,
        accepted: 0,
        rejected: 0,
      };
    }
  }
}