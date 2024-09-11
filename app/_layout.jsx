import { Stack } from 'expo-router/stack';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/login" options={{ headerShown: false, navigationBarHidden: true }} />
      <Stack.Screen name="index" options={{ headerShown: false, navigationBarHidden: true }} />
    
    </Stack>
  );
}
