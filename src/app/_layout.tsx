import { Stack } from 'expo-router';
import { GameProvider } from '../store/GameContext';

export default function RootLayout() {
  return (
    <GameProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GameProvider>
  );
}
