import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RidesProvider } from './context/RidesContext';
import { ThemeProvider } from './context/ThemeContext';
import { TranslationProvider } from './context/TranslationContext';

import MainMenuScreen from './screens/MainMenuScreen';
import AddRideScreen from './screens/AddRideScreen';
import StatsScreen from './screens/StatsScreen';
import AllRidesScreen from './screens/AllRidesScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';
import AboutScreen from './screens/AboutScreen';
import MonthlyStatsScreen from './screens/MonthlyStatsScreen';
import LoginScreen from './screens/LoginScreen';
import AdminPanel from './screens/AdminPanel';

// OVO DODAJ
import ChooseRideType from './screens/ChooseRideType';
import AddAbholung from './screens/AddAbholung';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <TranslationProvider>
        <RidesProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="AdminPanel" component={AdminPanel} />
              <Stack.Screen name="MainMenu" component={MainMenuScreen} />
              <Stack.Screen name="ChooseRideType" component={ChooseRideType} />
              <Stack.Screen name="AddRide" component={AddRideScreen} />
              <Stack.Screen name="AddAbholung" component={AddAbholung} />
              <Stack.Screen name="Stats" component={StatsScreen} />
              <Stack.Screen name="MonthlyStats" component={MonthlyStatsScreen} />
              <Stack.Screen name="AllRides" component={AllRidesScreen} />
              <Stack.Screen name="Reports" component={ReportsScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="About" component={AboutScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </RidesProvider>
      </TranslationProvider>
    </ThemeProvider>
  );
}
