import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LandingScreen from '../screens/LandingScreen';
import AuthScreen from '../screens/AuthScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import AddScheduleScreen from '../screens/AddScheduleScreen';
import EditScheduleScreen from '../screens/EditScheduleScreen';

const Stack = createStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Landing">
      <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Get Started' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Register' }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Schedules' }} />
      <Stack.Screen name="AddSchedule" component={AddScheduleScreen} options={{ title: 'Add Schedule' }} />
      <Stack.Screen name="EditSchedule" component={EditScheduleScreen} options={{ title: 'Edit Schedule' }} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;