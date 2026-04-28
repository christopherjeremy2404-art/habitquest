import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a1a',
          borderTopColor: '#1a1a35',
          borderTopWidth: 1,
          height: 60,
        },
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: '#5a5080',
        tabBarLabelStyle: {
          fontFamily: 'monospace',
          fontSize: 9,
          letterSpacing: 1,
          marginBottom: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'INICIO',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'MISIONES',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚡</Text>,
        }}
      />
      <Tabs.Screen
        name="finanzas"
        options={{
          title: 'CRÉDITOS',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💎</Text>,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'PERFIL',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🛡️</Text>,
        }}
      />
    </Tabs>
  );
}