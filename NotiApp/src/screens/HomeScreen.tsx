import React from 'react';
import { View, Text, Button } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Welcome to NotiApp!</Text>
            <Button
                title="Go to Notifications"
                onPress={() => navigation.navigate('NotificationScreen')}
            />
        </View>
    );
};

export default HomeScreen;