import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // for gradient bg

const LandingScreen = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#87CEFA', '#E0F7FA']} // light sky blue gradient
      style={styles.container}
    >
      {/* Logo */}
      <Image
  source={require('../../assets/images/logo.png')} // ✅ correct relative path
  style={styles.logo}
  resizeMode="contain"
        />


      <Text style={styles.title}>Welcome to NotiApp</Text>
      <Text style={styles.subtitle}>Never miss your schedule again!</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Auth')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#004085',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 28,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    elevation: 4, // adds shadow on Android
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LandingScreen;
