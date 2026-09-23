# Estructura del proyecto

## Organización general

El proyecto Agenda Inteligente está organizado mediante diferentes carpetas que permiten separar las funciones de la aplicación y facilitar su mantenimiento.

### Components

Contiene componentes reutilizables de la interfaz, como botones, tarjetas, campos de entrada, buscadores y selectores.

### Modules

Contiene las pantallas principales de la aplicación, separadas de acuerdo con el tipo de usuario:

* Administrador
* Estudiante
* Profesor
* Autenticación

### Navigation

Contiene la configuración de navegación entre las diferentes pantallas de la aplicación.

### Services

Contiene los servicios utilizados por la aplicación para gestionar información y comunicarse con Firebase.

Entre ellos se encuentran servicios para:

* Usuarios
* Cursos
* Materias
* Carreras
* Tareas
* Profesores
* Notificaciones
* Firebase

### Theme

Contiene los elementos utilizados para mantener una apariencia uniforme en la aplicación, como colores, tamaños, espacios, sombras y tipografías.

### Types

Contiene las definiciones de tipos utilizadas por TypeScript para organizar la información manejada por la aplicación.

## Objetivo de la organización

La estructura permite mantener el código separado por responsabilidades, facilitando la búsqueda de archivos, el mantenimiento del proyecto y el trabajo colaborativo entre los integrantes del equipo.
