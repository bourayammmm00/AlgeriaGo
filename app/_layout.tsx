import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/constants/colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="place/[id]"
          options={{
            title: '',
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="city/[name]"
          options={{ title: '' }}
        />
        <Stack.Screen
          name="trip/[id]"
          options={{ title: 'Trajet de la Journée' }}
        />
        <Stack.Screen
          name="share"
          options={{ title: 'Partager Votre Trajet' }}
        />
        <Stack.Screen
          name="admin/index"
          options={{ title: 'Admin - Gérer les lieux' }}
        />
        <Stack.Screen
          name="admin/add"
          options={{ title: 'Ajouter un lieu' }}
        />
        <Stack.Screen
          name="admin/settings"
          options={{ title: 'Paramètres Admin' }}
        />
      </Stack>
    </>
  );
}
