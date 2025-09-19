import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../services/firebase';
import { updateDoc, doc } from 'firebase/firestore';

const EditScheduleScreen = ({ route, navigation }) => {
  const { schedule } = route.params;
  const [title, setTitle] = useState(schedule.title);
  const [date, setDate] = useState(schedule.date);

  const handleUpdate = async () => {
    if (!title || !date) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      await updateDoc(doc(db, 'schedules', schedule.id), {
        title,
        date,
      });
      Alert.alert('Success', 'Schedule updated!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Update Error', error.message);
    }
  };

  return (
    <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.container}>
      <Text style={styles.title}>Edit Schedule</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        placeholderTextColor="#666"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        placeholderTextColor="#666"
        value={date}
        onChangeText={setDate}
      />

      <TouchableOpacity style={[styles.button, styles.updateBtn]} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.cancelBtn]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, color: '#fff', textAlign: 'center' },
  input: {
    width: '100%',
    maxWidth: 320,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    elevation: 2,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 16,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    elevation: 3,
  },
  updateBtn: { backgroundColor: '#007bff' },
  cancelBtn: { backgroundColor: '#6c757d' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default EditScheduleScreen;
