import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient"; // ✅ added import

import LandingScreen from "../screens/LandingScreen";
import AuthScreen from "../screens/AuthScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import AddScheduleScreen from "../screens/AddScheduleScreen";
import EditScheduleScreen from "../screens/EditScheduleScreen";

const Stack = createStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Landing">
      <Stack.Screen
        name="Landing"
        component={LandingScreen}
        options={{ headerShown: false }}
      />

      {/* ✅ Gradient header for Auth screen */}
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{
          title: "Get Started",
          headerTintColor: "#fff", // text & icons white
          headerTitleStyle: { fontWeight: "bold" },
          headerBackground: () => (
            <LinearGradient
              colors={["#87CEFA", "#E0F7FA"]}
              style={{ flex: 1 }}
            />
          ),
        }}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Login",
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerBackground: () => (
            <LinearGradient
              colors={["#87CEFA", "#E0F7FA"]}
              style={{ flex: 1 }}
            />
          ),
        }}
      />

      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          title: "Register",
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerBackground: () => (
            <LinearGradient
              colors={["#87CEFA", "#E0F7FA"]}
              style={{ flex: 1 }}
            />
          ),
        }}
      />

      {/* ✅ Hide header on these */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddSchedule"
        component={AddScheduleScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditSchedule"
        component={EditScheduleScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
