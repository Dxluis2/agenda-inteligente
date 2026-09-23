import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '../services/firebase/firebaseConfig';

// Autenticación
import RoleSelectionScreen from '../modules/auth/RoleSelectionScreen';
import AdminLoginScreen from '../modules/auth/AdminLoginScreen';
import TeacherLoginScreen from '../modules/auth/TeacherLoginScreen';
import StudentLoginScreen from '../modules/auth/StudentLoginScreen';
import RegisterUserScreen from '../modules/auth/RegisterUserScreen';
import StudentRegisterScreen from '../modules/auth/StudentRegisterScreen';
import LoginScreen from '../modules/auth/LoginScreen';
import ActivateAccountScreen from '../modules/auth/ActivateAccountScreen';

// Administrador
import AdminHomeScreen from '../modules/admin/AdminHomeScreen';
import UsersListScreen from '../modules/admin/UsersListScreen';
import PendingUsersScreen from '../modules/admin/PendingUsersScreen';
import AdminTabs from './AdminTabs';

// Carreras
import CreateCareerScreen from '../modules/admin/careers/CreateCareerScreen';
import CareerListScreen from '../modules/admin/careers/CareerListScreen';
import EditCareerScreen from '../modules/admin/careers/EditCareerScreen';

// Asignaturas
import AdminCreateSubjectScreen from '../modules/admin/subjects/CreateSubjectScreen';
import AdminSubjectListScreen from '../modules/admin/subjects/AdminSubjectListScreen';
import EditSubjectScreen from '../modules/admin/subjects/EditSubjectScreen';

// Cursos
import CourseListScreen from '../modules/admin/courses/CourseListScreen';
import CreateCourseScreen from '../modules/admin/courses/CreateCourseScreen';
import EditCourseScreen from '../modules/admin/courses/EditCourseScreen';
import CourseDetailScreen from '../modules/admin/courses/CourseDetailScreen';
import AddStudentsScreen from '../modules/admin/courses/AddStudentsScreen';
import CourseStudentsListScreen from '../modules/admin/courses/CourseStudentsListScreen';

// Profesor
import TeacherHomeScreen from '../modules/teacher/TeacherHomeScreen';
import TeacherCourseDetailScreen from '../modules/teacher/courses/TeacherCourseDetailScreen';
import CreateTaskScreen from '../modules/teacher/tasks/CreateTaskScreen';
import TasksListScreen from '../modules/teacher/tasks/TasksListScreen';
import EditTaskScreen from '../modules/teacher/tasks/EditTaskScreen';
import TaskProgressScreen from '../modules/teacher/tasks/TaskProgressScreen';
// Alumno
import StudentHomeScreen from '../modules/student/StudentHomeScreen';
import StudentAgendaScreen from '../modules/student/StudentAgendaScreen';
import StudentCourseDetailScreen from '../modules/student/StudentCourseDetailScreen';

type InitialScreen =
  | 'RoleSelection'
  | 'AdminTabs'
  | 'TeacherHome'
  | 'StudentHome';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [checkingSession, setCheckingSession] =
    useState(true);

  const [initialScreen, setInitialScreen] =
    useState<InitialScreen>('RoleSelection');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user: User | null) => {
        try {
          if (!user) {
            setInitialScreen('RoleSelection');
            return;
          }

          const userReference = doc(
            db,
            'users',
            user.uid
          );

          const userSnapshot = await getDoc(
            userReference
          );

          if (!userSnapshot.exists()) {
            await signOut(auth);
            setInitialScreen('RoleSelection');
            return;
          }

          const userData = userSnapshot.data();

          if (
            userData.active === false ||
            userData.status === 'pending'
          ) {
            await signOut(auth);
            setInitialScreen('RoleSelection');
            return;
          }

          switch (userData.role) {
            case 'admin':
              setInitialScreen('AdminTabs');
              break;

            case 'teacher':
              setInitialScreen('TeacherHome');
              break;

            case 'student':
              setInitialScreen('StudentHome');
              break;

            default:
              await signOut(auth);
              setInitialScreen('RoleSelection');
              break;
          }
        } catch (error) {
          console.log(
            'Error comprobando la sesión:',
            error
          );

          setInitialScreen('RoleSelection');
        } finally {
          setCheckingSession(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialScreen}
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Autenticación */}

        <Stack.Screen
          name="RoleSelection"
          component={RoleSelectionScreen}
        />

        <Stack.Screen
          name="AdminLogin"
          component={AdminLoginScreen}
        />

        <Stack.Screen
          name="TeacherLogin"
          component={TeacherLoginScreen}
        />

        <Stack.Screen
          name="StudentLogin"
          component={StudentLoginScreen}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="ActivateAccount"
          component={ActivateAccountScreen}
        />

        <Stack.Screen
          name="RegisterUser"
          component={RegisterUserScreen}
        />

        <Stack.Screen
          name="StudentRegister"
          component={StudentRegisterScreen}
        />

        {/* Paneles principales */}

        <Stack.Screen
          name="AdminTabs"
          component={AdminTabs}
        />

        <Stack.Screen
          name="AdminHome"
          component={AdminHomeScreen}
        />

        <Stack.Screen
          name="TeacherHome"
          component={TeacherHomeScreen}
        />

        <Stack.Screen
          name="StudentHome"
          component={StudentHomeScreen}
        />

        {/* Usuarios */}

        <Stack.Screen
          name="UsersList"
          component={UsersListScreen}
        />

        <Stack.Screen
          name="PendingUsers"
          component={PendingUsersScreen}
        />

        {/* Carreras */}

        <Stack.Screen
          name="CreateCareer"
          component={CreateCareerScreen}
        />

        <Stack.Screen
          name="CareerList"
          component={CareerListScreen}
        />

        <Stack.Screen
          name="EditCareer"
          component={EditCareerScreen}
        />

        {/* Asignaturas */}

        <Stack.Screen
          name="AdminCreateSubject"
          component={AdminCreateSubjectScreen}
        />

        <Stack.Screen
          name="AdminSubjectList"
          component={AdminSubjectListScreen}
        />

        <Stack.Screen
          name="EditSubject"
          component={EditSubjectScreen}
        />

        {/* Cursos */}

        <Stack.Screen
          name="CourseList"
          component={CourseListScreen}
        />

        <Stack.Screen
          name="CreateCourse"
          component={CreateCourseScreen}
        />

        <Stack.Screen
          name="EditCourse"
          component={EditCourseScreen}
        />

        <Stack.Screen
          name="CourseDetail"
          component={CourseDetailScreen}
        />

        <Stack.Screen
          name="AddStudents"
          component={AddStudentsScreen}
        />

        <Stack.Screen
          name="CourseStudentsList"
          component={CourseStudentsListScreen}
        />

        {/* Profesor */}

        <Stack.Screen
          name="TeacherCourseDetail"
          component={TeacherCourseDetailScreen}
        />

        <Stack.Screen
          name="CreateTask"
          component={CreateTaskScreen}
        />

        <Stack.Screen
          name="TasksList"
          component={TasksListScreen}
        />
        <Stack.Screen
          name="EditTask"
          component={EditTaskScreen} 
        />
        <Stack.Screen
          name="TaskProgress"
          component={TaskProgressScreen}
        />
        <Stack.Screen
          name="StudentAgenda"
          component={StudentAgendaScreen}
        />
        <Stack.Screen
          name="StudentCourseDetail"
          component={StudentCourseDetailScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});