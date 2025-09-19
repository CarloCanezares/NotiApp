import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { db, auth } from '../services/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = ({ navigation }) => {
  const [schedules, setSchedules] = useState([]);

  const fetchSchedules = async () => {
    try {
      const q = query(collection(db, 'schedules'), where('userId', '==', auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setSchedules(data);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    fetchSchedules();
    const unsubscribe = navigation.addListener('focus', fetchSchedules);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'schedules', id));
      fetchSchedules();
    } catch (error) {
      Alert.alert('Delete Error', error.message);
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

      <Text style={styles.title}>My Schedules</Text>

      {/* Add Button at the Top */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('AddSchedule')}
      >
        <Text style={styles.btnText}>+ Add Schedule</Text>
      </TouchableOpacity>

      {/* List of schedules */}
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              {item.title} - {item.date}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('EditSchedule', { schedule: item })}
              >
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#004085',
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  itemText: {
    fontSize: 18,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  editBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    elevation: 2,
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20, // spacing before list
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});

export default HomeScreen;
