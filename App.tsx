import React, { useEffect } from 'react';

import AppNavigator from './src/navigation/AppNavigator';
import { NotificationService } from './src/services/notifications/NotificationService';

export default function App() {
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const permissionsGranted =
          await NotificationService.configure();

        if (permissionsGranted) {
          console.log('Notificaciones habilitadas correctamente');
        } else {
          console.log('El permiso de notificaciones no fue concedido');
        }
      } catch (error) {
        console.error(
          'Error al iniciar las notificaciones:',
          error
        );
      }
    };

    initializeNotifications();
  }, []);

  return <AppNavigator />;
}