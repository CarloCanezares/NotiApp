import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Platform 
} from 'react-native';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Cross-platform alert: Alert (native) & window.alert (web fallback)
const showAlert = (title: string, message: string, onConfirm?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    if (onConfirm) onConfirm();
  } else {
    import('react-native').then(({ Alert }) => {
      Alert.alert(title, message, [{ text: 'OK', onPress: onConfirm }]);
    });
  }
};

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);

      // ✅ Success message → redirect to Login
      showAlert('Success', 'Account Created Successfully!, Logging In', () => {
        // navigation.replace('Login');
      });
    } catch (error: any) {
      // console.error('Signup Error:', error.message);

      let errorMessage = 'Invalid credentials, please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }

      showAlert('Signup Error', errorMessage);
    }
  };

  return (
    <LinearGradient
      colors={['#87CEFA', '#E0F7FA']}
      style={styles.container}
    >
      {/* ✅ Local Logo (works for Web + Android) */}
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Register</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>
          Already have an account? <Text style={{ fontWeight: 'bold' }}>Login</Text>
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
    textAlign: 'center',
  },
  link: {
    color: '#007bff',
    fontSize: 16,
    marginTop: 8,
  },
});

export default SignupScreen;
