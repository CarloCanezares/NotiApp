import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";

import LandingScreen from "../screens/LandingScreen";
import AuthScreen from "../screens/AuthScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import AddScheduleScreen from "../screens/AddScheduleScreen";
import EditScheduleScreen from "../screens/EditScheduleScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#004085" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={currentUser ? "Home" : "Landing"}>
        {currentUser ? (
          // Authenticated screens
          <>
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
          </>
        ) : (
          // Unauthenticated screens
          <>
            <Stack.Screen
              name="Landing"
              component={LandingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Auth"
              component={AuthScreen}
              options={{
                title: "Get Started",
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;