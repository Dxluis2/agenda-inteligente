import { sendPasswordResetEmail } from 'firebase/auth';

import { auth } from '../firebase/firebaseConfig';

export class PasswordResetService {
  static async sendResetEmail(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error(
        'El usuario no tiene un correo electrónico registrado.'
      );
    }

    auth.languageCode = 'es';

    await sendPasswordResetEmail(
      auth,
      normalizedEmail
    );
  }
}