import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../services/firebase';
import { addDoc, collection } from 'firebase/firestore';

const AddScheduleScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const handleAdd = async () => {
    if (!title || !date) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      await addDoc(collection(db, 'schedules'), {
        title,
        date,
        userId: auth.currentUser?.uid,
      });
      Alert.alert('Success', 'Schedule added!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Add Error', error.message);
    }
  };

  return (
    <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.container}>
      <Text style={styles.title}>Add Schedule</Text>
      
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

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#6c757d' }]}
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
  input: { width: '100%', maxWidth: 320, height: 50, backgroundColor: '#fff', borderRadius: 10, marginBottom: 16, paddingHorizontal: 12, fontSize: 16, elevation: 2 },
  button: { backgroundColor: '#28a745', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10, marginBottom: 16, width: '100%', maxWidth: 320, alignItems: 'center', elevation: 3 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AddScheduleScreen;
