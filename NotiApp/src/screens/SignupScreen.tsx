import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { signup } from '../services/firebase'; // Import the signup function from firebase service
import { validateEmail, validateNotEmpty } from '../utils/validators'; // Import validation functions

const SignupScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignup = async () => {
        setError('');
        if (!validateNotEmpty(email) || !validateNotEmpty(password)) {
            setError('All fields are required.');
            return;
        }
        if (!validateEmail(email)) {
            setError('Invalid email format.');
            return;
        }

        try {
            await signup(email, password);
            navigation.navigate('Home'); // Navigate to Home screen after successful signup
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Sign Up" onPress={handleSignup} />
            <Button title="Go to Login" onPress={() => navigation.navigate('Login')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
    },
    error: {
        color: 'red',
        marginBottom: 12,
        textAlign: 'center',
    },
});

export default SignupScreen;