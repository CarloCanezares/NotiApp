import React from 'react';
import { View, Text, Button } from 'react-native';
import Login from '../components/Auth/Login';

const LoginScreen = ({ navigation }) => {
    const handleLoginSuccess = () => {
        navigation.navigate('Home');
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Login Screen</Text>
            <Login onLoginSuccess={handleLoginSuccess} />
        </View>
    );
};

export default LoginScreen;