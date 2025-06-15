import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/context/AuthContext';
import Login from './src/screens/Login';
import MainMenuScreen from './src/screens/MainMenuScreen';
import AdminPanel from './src/screens/AdminPanel';
import BarcodeScannerModal from './src/components/BarcodeScannerModal';

const Stack = createStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="MainMenu" component={MainMenuScreen} />
            <Stack.Screen name="AdminPanel" component={AdminPanel} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}