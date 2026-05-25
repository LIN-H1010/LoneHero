import { Stack } from 'expo-router';
import { GameProvider } from '../store/GameContext';
import { useNotifications } from '../hooks/useNotifications';

export default function RootLayout() {
  // Initialize notifications on app launch
  useNotifications();

  return (
    <GameProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GameProvider>
  );
}
