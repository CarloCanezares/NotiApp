import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NotificationItemProps {
  title: string;
  message: string;
  timestamp: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ title, message, timestamp }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    fontSize: 14,
    color: '#555',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
});

export default NotificationItem;