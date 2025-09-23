import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image, 
  Platform 
} from 'react-native';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // navigation.replace('Home'); // Navigate to Home after login
    } catch (error) {
      let errorMessage = 'Wrong credentials. Please try again.';

      // Map Firebase error codes to user-friendly messages
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format. Please check and try again.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Try again.';
          break;
        case 'auth/missing-password':
          errorMessage = 'Please enter your password.';
          break;
        default:
          errorMessage = 'Login failed. Please try again.';
      }

      if (Platform.OS === 'web') {
        window.alert(errorMessage); // Web fallback
      } else {
        Alert.alert('Login Error', errorMessage); // Mobile Alert
      }
    }
  };

  return (
    <LinearGradient
      colors={['#87CEFA', '#E0F7FA']}
      style={styles.container}
    >
      {/* Logo */}
      <Image
        source={{
          uri: 'https://img.icons8.com/fluency/96/appointment-reminders.png',
        }}
        style={styles.logo}
      />

      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#666"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>
          Don't have an account? <Text style={{ fontWeight: 'bold' }}>Register</Text>
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#004085',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 320,
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 14,
    fontSize: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  button: {
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  link: {
    color: '#007bff',
    fontSize: 16,
    marginTop: 8,
  },
});

export default LoginScreen;
