import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PracticeScreen } from '../screens/PracticeScreen';
import { BrowseScreen } from '../screens/BrowseScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { useTheme } from '../theme';

export type RootStackParamList = {
  Practice: undefined;
  Browse: undefined;
  Progress: undefined;
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
      <Stack.Screen name="Practice" component={PracticeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Browse" component={BrowseScreen} options={{ title: 'Browse Kanji' }} />
      <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
    </Stack.Navigator>
  );
}
