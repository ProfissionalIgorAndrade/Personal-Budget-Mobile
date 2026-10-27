import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { ReferenceDataProvider } from '@/features/catalog/ReferenceDataContext';
import { colors } from '@/theme';

const MODAL = { presentation: 'modal' } as const;

function RootNavigator() {
  const { isSignedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="transaction/new" options={MODAL} />
        <Stack.Screen name="register/index" options={MODAL} />
        <Stack.Screen name="register/category" options={MODAL} />
        <Stack.Screen name="register/card" options={MODAL} />
        <Stack.Screen name="register/account" options={MODAL} />
        <Stack.Screen name="register/savings-box" options={MODAL} />
        <Stack.Screen name="register/member" options={MODAL} />
        <Stack.Screen name="register/budget" options={MODAL} />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );

  // Reference data (household, categories, cards...) only loads for a signed-in user.
  return isSignedIn ? <ReferenceDataProvider>{stack}</ReferenceDataProvider> : stack;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}
