import { Stack } from 'expo-router';

export default function DuelHealthMonitorLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          headerShown: false,
          title: 'Health Monitor',
        }}
      />
    </Stack>
  );
}
