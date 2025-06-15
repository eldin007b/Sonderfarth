import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import MainMenuScreen from './screens/MainMenuScreen';
import AdminPanel from './screens/AdminPanel';

const Stack = createStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="MainMenu">
            <Stack.Screen name="MainMenu" component={MainMenuScreen} />
            <Stack.Screen name="AdminPanel" component={AdminPanel} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}
