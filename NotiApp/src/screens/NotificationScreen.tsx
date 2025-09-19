import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import NotificationList from '../components/Notification/NotificationList';
import { fetchNotifications } from '../services/firebase';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      const fetchedNotifications = await fetchNotifications();
      setNotifications(fetchedNotifications);
    };

    loadNotifications();
  }, []);

  const handleRefresh = async () => {
    const fetchedNotifications = await fetchNotifications();
    setNotifications(fetchedNotifications);
  };

  return (
    <View>
      <Text>Your Notifications</Text>
      <Button title="Refresh" onPress={handleRefresh} />
      <NotificationList notifications={notifications} />
    </View>
  );
};

export default NotificationScreen;