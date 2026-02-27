import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Clock, MessageCircle, Menu, User } from 'lucide-react-native';
import { colors, typography } from '../theme';
import { useAuth } from '../context/AuthContext';
import { Platform } from 'react-native';

// Screens
import EmployeeDashboard from '../screens/EmployeeDashboard';
import AdminDashboard from '../screens/AdminDashboard';
import SuperadminDashboard from '../screens/SuperadminDashboard';
import MasterDashboard from '../screens/MasterDashboard';
import AttendanceScreen from '../screens/AttendanceScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import LeavesScreen from '../screens/LeavesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import UsersScreen from '../screens/UsersScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import TimesheetsScreen from '../screens/TimesheetsScreen';
import MoreScreen from '../screens/MoreScreen';
import FinanceScreen from '../screens/FinanceScreen';
import AssetsScreen from '../screens/AssetsScreen';
import PoliciesScreen from '../screens/PoliciesScreen';
import SuggestionsScreen from '../screens/SuggestionsScreen';
import LogsScreen from '../screens/LogsScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import MasterOrganizationsScreen from '../screens/MasterOrganizationsScreen';
import MasterUsersScreen from '../screens/MasterUsersScreen';
import MasterAnalyticsScreen from '../screens/MasterAnalyticsScreen';
import MasterAuditScreen from '../screens/MasterAuditScreen';
import MasterPulseScreen from '../screens/MasterPulseScreen';
import AssetInventoryScreen from '../screens/AssetInventoryScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import GeofenceSettingsScreen from '../screens/GeofenceSettingsScreen';
import AdminResetRequestsScreen from '../screens/AdminResetRequestsScreen';
import OrgSettingsScreen from '../screens/OrgSettingsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

// Stack navigators for each tab
const HomeStack = createNativeStackNavigator();
const AttendanceStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function HomeStackScreen() {
  const { user } = useAuth();
  const role = user?.role || 'employee';

  const DashboardComponent =
    role === 'master-admin' ? MasterDashboard :
      role === 'superadmin' ? SuperadminDashboard :
        role === 'admin' ? AdminDashboard :
          EmployeeDashboard;

  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Dashboard" component={DashboardComponent} />
    </HomeStack.Navigator>
  );
}

function AttendanceStackScreen() {
  return (
    <AttendanceStack.Navigator screenOptions={{ headerShown: false }}>
      <AttendanceStack.Screen name="AttendanceMain" component={AttendanceScreen} />
      <AttendanceStack.Screen name="GeofenceSettings" component={GeofenceSettingsScreen} />
    </AttendanceStack.Navigator>
  );
}

function ChatStackScreen() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen} />
      <ChatStack.Screen name="Chat" component={ChatScreen} />
    </ChatStack.Navigator>
  );
}

function MoreStackScreen() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="MoreMenu" component={MoreScreen} />
      <MoreStack.Screen name="Leaves" component={LeavesScreen} />
      <MoreStack.Screen name="Projects" component={ProjectsScreen} />
      <MoreStack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <MoreStack.Screen name="Timesheets" component={TimesheetsScreen} />
      <MoreStack.Screen name="Users" component={UsersScreen} />
      <MoreStack.Screen name="Finance" component={FinanceScreen} />
      <MoreStack.Screen name="Assets" component={AssetsScreen} />
      <MoreStack.Screen name="Policies" component={PoliciesScreen} />
      <MoreStack.Screen name="Suggestions" component={SuggestionsScreen} />
      <MoreStack.Screen name="Logs" component={LogsScreen} />
      <MoreStack.Screen name="Permissions" component={PermissionsScreen} />
      <MoreStack.Screen name="MasterOrganizations" component={MasterOrganizationsScreen} />
      <MoreStack.Screen name="MasterUsers" component={MasterUsersScreen} />
      <MoreStack.Screen name="MasterAnalytics" component={MasterAnalyticsScreen} />
      <MoreStack.Screen name="MasterAudit" component={MasterAuditScreen} />
      <MoreStack.Screen name="MasterPulse" component={MasterPulseScreen} />
      <MoreStack.Screen name="AssetInventory" component={AssetInventoryScreen} />
      <MoreStack.Screen name="Documents" component={DocumentsScreen} />
      <MoreStack.Screen name="GeofenceSettings" component={GeofenceSettingsScreen} />
      <MoreStack.Screen name="AdminResetRequests" component={AdminResetRequestsScreen} />
      <MoreStack.Screen name="OrgSettings" component={OrgSettingsScreen} />
      <MoreStack.Screen name="Analytics" component={AnalyticsScreen} />
    </MoreStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="Documents" component={DocumentsScreen} />
    </ProfileStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.slate400,
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.bold,
          fontSize: 10,
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          const iconSize = 22;
          switch (route.name) {
            case 'HomeTab': return <Home size={iconSize} color={color} />;
            case 'AttendanceTab': return <Clock size={iconSize} color={color} />;
            case 'ChatTab': return <MessageCircle size={iconSize} color={color} />;
            case 'MoreTab': return <Menu size={iconSize} color={color} />;
            case 'ProfileTab': return <User size={iconSize} color={color} />;
            default: return null;
          }
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="AttendanceTab" component={AttendanceStackScreen} options={{ tabBarLabel: 'Attendance' }} />
      <Tab.Screen name="ChatTab" component={ChatStackScreen} options={{ tabBarLabel: 'Chat' }} />
      <Tab.Screen name="MoreTab" component={MoreStackScreen} options={{ tabBarLabel: 'More' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
