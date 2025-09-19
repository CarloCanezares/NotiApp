import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AuthScreen = ({ navigation }) => {
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

      <Text style={styles.title}>Get Started</Text>

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate('Signup')}
      >
        <Text style={styles.buttonText}>Register</Text>
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
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#004085',
    textAlign: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonSecondary: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
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

export default AuthScreen;
