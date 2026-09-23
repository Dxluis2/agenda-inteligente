# Agenda Inteligente para una Escuela

## Descripción del proyecto

La Agenda Inteligente para una Escuela es una aplicación móvil desarrollada para facilitar la organización y administración de las actividades académicas.

El sistema permite gestionar información relacionada con alumnos, profesores, administradores, cursos, materias, tareas y agendas escolares. También cuenta con funciones de notificaciones y servicios de Firebase para almacenar y administrar información de la aplicación.

El objetivo principal del proyecto es centralizar la información académica en una sola aplicación y facilitar el seguimiento de las actividades escolares por parte de los diferentes usuarios.

## Integrantes

| Integrante                   | Rol                                           |
| ---------------------------- | --------------------------------------------- |
| Luis Angel Navarrete Sanchez | Desarrollador Frontend y diseño de interfaces |
| Erick David Perez Lozano     | Desarrollador Backend y servicios             |
| Jose Luis Ramirez Arellano   | Desarrollador y encargado de integración      |
| Luis Gabriel Vargas Gonzalez | Analista, pruebas y documentación             |

## Tecnologías utilizadas

* React Native
* Expo
* TypeScript
* JavaScript
* Firebase
* Node.js
* npm
* Git
* GitHub

## Funcionalidades principales

### Administrador

El administrador puede:

* Iniciar sesión.
* Administrar usuarios.
* Gestionar alumnos y profesores.
* Gestionar carreras.
* Crear, editar y consultar cursos.
* Administrar materias.
* Consultar estudiantes inscritos en los cursos.
* Gestionar información académica.
* Consultar la agenda de los estudiantes.

### Profesor

El profesor puede:

* Iniciar sesión.
* Consultar sus cursos.
* Consultar información de los cursos.
* Crear tareas.
* Editar tareas.
* Consultar las tareas registradas.
* Consultar el progreso de las actividades.
* Gestionar actividades académicas.

### Estudiante

El estudiante puede:

* Registrarse.
* Iniciar sesión.
* Activar su cuenta.
* Consultar su agenda.
* Consultar sus cursos.
* Consultar información de las materias.
* Consultar tareas.
* Consultar el progreso de sus actividades.

### Notificaciones

La aplicación también cuenta con servicios relacionados con notificaciones para mantener informados a los usuarios sobre actividades y eventos académicos.

## Arquitectura del proyecto

El proyecto utiliza una estructura modular para organizar los componentes, pantallas, servicios, navegación, temas y tipos de datos.

```text
agenda-inteligente/
│
├── App.tsx
├── app.json
├── eas.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── README.md
├── .gitignore
│
├── assets/
│   ├── adaptive-icon.png
│   └── icon.png
│
└── src/
    │
    ├── components/
    │   ├── buttons/
    │   ├── cards/
    │   ├── inputs/
    │   ├── search/
    │   └── selects/
    │
    ├── modules/
    │   ├── admin/
    │   ├── auth/
    │   ├── student/
    │   └── teacher/
    │
    ├── navigation/
    │
    ├── services/
    │   ├── career/
    │   ├── course/
    │   ├── courseStudent/
    │   ├── firebase/
    │   ├── group/
    │   ├── notifications/
    │   ├── subject/
    │   ├── task/
    │   ├── teacher/
    │   └── user/
    │
    ├── theme/
    │
    └── types/
```

La carpeta `components` contiene componentes reutilizables de la interfaz. La carpeta `modules` contiene las diferentes pantallas y módulos de acuerdo con el tipo de usuario. `services` contiene la lógica relacionada con los diferentes servicios del sistema y Firebase. `navigation` administra la navegación entre pantallas. `theme` contiene los elementos visuales y `types` contiene las definiciones de tipos utilizadas por TypeScript.

## Firebase

El proyecto utiliza Firebase para los servicios relacionados con la gestión y almacenamiento de información de la aplicación.

Los archivos que contienen configuraciones sensibles o específicas del entorno local no deben publicarse en el repositorio. Por esta razón, `google-services.json` se encuentra incluido en el archivo `.gitignore`.

## Requisitos

Para ejecutar el proyecto se requiere tener instalado:

* Node.js
* npm
* Expo
* Git
* Un dispositivo Android o un emulador compatible

También es necesario contar con la configuración correspondiente de Firebase para ejecutar correctamente las funciones que dependen de este servicio.

## Instalación

Primero se debe clonar el repositorio:

```bash
git clone https://github.com/Dxluis2/agenda-inteligente.git
```

Después ingresar a la carpeta del proyecto:

```bash
cd agenda-inteligente
```

Instalar las dependencias:

```bash
npm install
```

Iniciar el proyecto con Expo:

```bash
npx expo start
```

Después se puede ejecutar la aplicación utilizando un dispositivo físico compatible o un emulador.

## Evidencias

En esta sección se pueden agregar capturas de pantalla relacionadas con:

* Pantalla de inicio de sesión.
* Registro de usuarios.
* Panel del administrador.
* Agenda del estudiante.
* Gestión de cursos.
* Gestión de materias.
* Gestión de tareas.
* Pantallas del profesor.
* Sistema de notificaciones.
* Repositorio de GitHub.
* Historial de commits.

## Control de versiones

El proyecto utiliza Git para administrar las diferentes versiones del código fuente y GitHub como plataforma para almacenar el repositorio remoto.

Los cambios importantes del proyecto se registran mediante commits para mantener un historial de desarrollo.

## Estado del proyecto

**En desarrollo.**

El proyecto se encuentra en proceso de desarrollo y pruebas. Las funcionalidades principales de administración, estudiantes, profesores, cursos, materias, tareas, agenda y servicios de Firebase se encuentran integradas en la aplicación.

## Objetivo

Desarrollar una aplicación móvil que facilite la organización de las actividades académicas y permita a estudiantes, profesores y administradores consultar y gestionar información escolar desde una misma plataforma.

## Licencia

Proyecto desarrollado con fines académicos.
