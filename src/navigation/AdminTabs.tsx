import { MaterialIcons } from '@expo/vector-icons';
import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import AdminHomeScreen from '../modules/admin/AdminHomeScreen';
import UsersListScreen from '../modules/admin/UsersListScreen';
import PendingUsersScreen from '../modules/admin/PendingUsersScreen';

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      initialRouteName="AdminHomeTab"
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',

        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,

          backgroundColor: '#FFFFFF',

          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',

          elevation: 12,

          shadowColor: '#0F172A',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.08,
          shadowRadius: 10,
        },

        tabBarItemStyle: {
          paddingVertical: 2,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="AdminHomeTab"
        component={AdminHomeScreen}
        options={{
          title: 'Inicio',

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <MaterialIcons
              name={
                focused
                  ? 'dashboard'
                  : 'dashboard-customize'
              }
              size={focused ? 27 : 25}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="UsersTab"
        component={UsersListScreen}
        options={{
          title: 'Usuarios',

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <MaterialIcons
              name={
                focused
                  ? 'people'
                  : 'people-outline'
              }
              size={focused ? 27 : 25}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="PendingUsersTab"
        component={PendingUsersScreen}
        options={{
          title: 'Pendientes',

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <MaterialIcons
              name={
                focused
                  ? 'pending-actions'
                  : 'hourglass-empty'
              }
              size={focused ? 27 : 25}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}