import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { PracticeScreen } from '../screens/PracticeScreen';
import { BrowseScreen } from '../screens/BrowseScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { StudySetupScreen } from '../screens/StudySetupScreen';
import { StudySessionScreen } from '../screens/StudySessionScreen';
import { ListsScreen } from '../screens/ListsScreen';
import { ListDetailScreen } from '../screens/ListDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SessionType, StudyMode } from '../config/studyConfig';
import { useTheme } from '../theme';

export type RootStackParamList = {
  Home: undefined;
  Practice: { selectedKanji?: string } | undefined;
  Browse: undefined;
  Progress: undefined;
  StudySetup: { sessionType: SessionType };
  StudySession: {
    sessionType: SessionType;
    mode: StudyMode;
    shuffle: boolean;
    kanjiCharacters: string[];
  };
  Lists: undefined;
  ListDetail: { listId: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Practice"
        component={PracticeScreen}
        options={{ title: 'Free Practice', headerShown: false }}
      />
      <Stack.Screen
        name="Browse"
        component={BrowseScreen}
        options={{ title: 'Browse Kanji' }}
      />
      <Stack.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ title: 'Progress' }}
      />
      <Stack.Screen
        name="StudySetup"
        component={StudySetupScreen}
        options={({ route }) => ({
          title: route.params?.sessionType === 'srs' ? 'Review Setup' : 'Study Setup',
        })}
      />
      <Stack.Screen
        name="StudySession"
        component={StudySessionScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Lists"
        component={ListsScreen}
        options={{ title: 'My Lists' }}
      />
      <Stack.Screen
        name="ListDetail"
        component={ListDetailScreen}
        options={{ title: 'List' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}
