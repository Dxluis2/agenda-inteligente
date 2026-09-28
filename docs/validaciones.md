# Validaciones de la Agenda Inteligente ## Validaci�n 1: Actividad vac�a **Objetivo:** evitar que el usuario registre una actividad sin nombre. **Dato de entrada:** Campo de actividad vac�o. **Resultado esperado:** El sistema debe mostrar un mensaje indicando que se debe ingresar una actividad. ## Validaci�n 2: Actividad con informaci�n **Objetivo:** comprobar que se pueda registrar una actividad correctamente. **Dato de entrada:** Una actividad con informaci�n v�lida. **Resultado esperado:** La actividad debe registrarse y aparecer en la agenda. ## Validaci�n 3: Informaci�n incompleta **Objetivo:** evitar que se registren actividades con datos necesarios faltantes. **Resultado esperado:** El sistema debe solicitar al usuario completar la informaci�n requerida.
\# Estructura de carpetas del proyecto

## Prueba 1: Agregar actividad

**Objetivo:** comprobar que una actividad pueda registrarse correctamente.

**Pasos:**
1. Abrir la aplicación.
2. Escribir una actividad.
3. Presionar el botón para agregarla.

**Resultado esperado:** La actividad debe aparecer en la lista.

## Prueba 2: Campo vacío

**Objetivo:** comprobar el comportamiento cuando no se introduce una actividad.

**Pasos:**
1. Abrir la aplicación.
2. Dejar vacío el campo.
3. Presionar el botón para agregar.

**Resultado esperado:** El sistema debe solicitar que se ingrese una actividad.

## Prueba 3: Visualización

**Objetivo:** comprobar que las actividades registradas sean visibles.

**Pasos:**
1. Registrar una actividad.
2. Observar la lista.

**Resultado esperado:** La actividad registrada debe mostrarse correctamente.

## Observación adicional

Las validaciones permiten comprobar que los datos ingresados por el usuario sean correctos antes de registrar una actividad.