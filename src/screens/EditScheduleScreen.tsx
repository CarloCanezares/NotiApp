import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Modal,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../services/firebase';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const { height: screenHeight } = Dimensions.get('window');

const PRIORITY_OPTIONS = [
  { label: 'Low Priority', value: 'low', color: '#28a745' },
  { label: 'Medium Priority', value: 'medium', color: '#ffc107' },
  { label: 'High Priority', value: 'high', color: '#dc3545' }
];

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending', color: '#6c757d' },
  { label: 'In Progress', value: 'in-progress', color: '#007bff' },
  { label: 'Completed', value: 'completed', color: '#28a745' },
  { label: 'Cancelled', value: 'cancelled', color: '#dc3545' }
];

const CATEGORY_OPTIONS = [
  { label: 'General', value: 'general' },
  { label: 'Work', value: 'work' },
  { label: 'Personal', value: 'personal' },
  { label: 'Health', value: 'health' },
  { label: 'Education', value: 'education' },
  { label: 'Family', value: 'family' },
  { label: 'Travel', value: 'travel' },
  { label: 'Shopping', value: 'shopping' }
];

const EditScheduleScreen = ({ route, navigation }) => {
  const { schedule } = route.params;
  
  // Initialize state with existing schedule data or defaults
  const [title, setTitle] = useState(schedule.title || '');
  const [date, setDate] = useState(schedule.date || '');
  const [time, setTime] = useState(schedule.time || '');
  const [description, setDescription] = useState(schedule.description || '');
  const [priority, setPriority] = useState(schedule.priority || 'medium');
  const [status, setStatus] = useState(schedule.status || 'pending');
  const [category, setCategory] = useState(schedule.category || 'general');
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleUpdate = async () => {
  if (!title.trim()) {
    Alert.alert('Error', 'Please enter a title');
    return;
  }
  if (!date.trim()) {
    Alert.alert('Error', 'Please enter a date');
    return;
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    Alert.alert('Error', 'Please enter date in YYYY-MM-DD format');
    return;
  }

  // Validate time format if provided
  if (time && !/^\d{2}:\d{2}$/.test(time)) {
    Alert.alert('Error', 'Please enter time in HH:MM format');
    return;
  }

  try {
    setLoading(true);
    await updateDoc(doc(db, 'schedules', schedule.id), {
      title: title.trim(),
      date: date.trim(),
      time: time.trim(),
      description: description.trim(),
      priority,
      status,
      category,
      updatedAt: serverTimestamp(),
    });
    
    // Show success modal instead of Alert.alert
    setSuccessModalVisible(true);
  } catch (error) {
    Alert.alert('Update Error', error.message);
  } finally {
    setLoading(false);
  }
};

  const renderSelector = (title, value, options, onPress, getDisplayValue) => (
    <TouchableOpacity style={styles.selectorButton} onPress={onPress}>
      <Text style={styles.selectorLabel}>{title}</Text>
      <Text style={styles.selectorValue}>{getDisplayValue(value)}</Text>
      <Text style={styles.selectorArrow}>▼</Text>
    </TouchableOpacity>
  );

  const renderModal = (visible, setVisible, options, selectedValue, onSelect, title) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select {title}</Text>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.modalOption,
                selectedValue === option.value && styles.modalOptionSelected,
                option.color && { borderLeftColor: option.color, borderLeftWidth: 4 }
              ]}
              onPress={() => {
                onSelect(option.value);
                setVisible(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                selectedValue === option.value && styles.modalOptionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const getPriorityLabel = (value) => 
    PRIORITY_OPTIONS.find(option => option.value === value)?.label || 'Medium Priority';

  const getStatusLabel = (value) => 
    STATUS_OPTIONS.find(option => option.value === value)?.label || 'Pending';

  const getCategoryLabel = (value) => 
    CATEGORY_OPTIONS.find(option => option.value === value)?.label || 'General';

  return (
    <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.container}>
      <View style={styles.scrollContainer}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.title}>Edit Schedule</Text>
          
          <View style={styles.form}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter schedule title"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            {/* Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (e.g., 2025-09-20)"
                placeholderTextColor="#999"
                value={date}
                onChangeText={setDate}
                maxLength={10}
              />
            </View>

            {/* Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM (e.g., 14:30)"
                placeholderTextColor="#999"
                value={time}
                onChangeText={setTime}
                maxLength={5}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter schedule description..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            {/* Priority Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priority</Text>
              {renderSelector(
                'Priority',
                priority,
                PRIORITY_OPTIONS,
                () => setPriorityModalVisible(true),
                getPriorityLabel
              )}
            </View>

            {/* Status Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              {renderSelector(
                'Status',
                status,
                STATUS_OPTIONS,
                () => setStatusModalVisible(true),
                getStatusLabel
              )}
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              {renderSelector(
                'Category',
                category,
                CATEGORY_OPTIONS,
                () => setCategoryModalVisible(true),
                getCategoryLabel
              )}
            </View>

            {/* Schedule Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Created: {
                  schedule.createdAt?.toDate 
                    ? schedule.createdAt.toDate().toLocaleDateString() 
                    : schedule.createdAt 
                      ? new Date(schedule.createdAt).toLocaleDateString()
                      : 'Unknown'
                }
              </Text>
              {schedule.updatedAt && (
                <Text style={styles.infoText}>
                  Updated: {
                    schedule.updatedAt?.toDate 
                      ? schedule.updatedAt.toDate().toLocaleDateString() 
                      : schedule.updatedAt 
                        ? new Date(schedule.updatedAt).toLocaleDateString()
                        : 'Unknown'
                  }
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.updateButton]} 
                onPress={handleUpdate}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Updating...' : '✓ Update Schedule'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <Text style={styles.buttonText}>✗ Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Modals */}
      {renderModal(
        priorityModalVisible,
        setPriorityModalVisible,
        PRIORITY_OPTIONS,
        priority,
        setPriority,
        'Priority'
      )}

      {renderModal(
        statusModalVisible,
        setStatusModalVisible,
        STATUS_OPTIONS,
        status,
        setStatus,
        'Status'
      )}

      {renderModal(
        categoryModalVisible,
        setCategoryModalVisible,
        CATEGORY_OPTIONS,
        category,
        setCategory,
        'Category'
      )}

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setSuccessModalVisible(false);
          navigation.goBack();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>
              Schedule updated successfully!
            </Text>
            
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.successButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    minHeight: 300,
    maxHeight: screenHeight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#fff',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    minHeight: 500,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#333',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  selectorButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectorLabel: {
    fontSize: 16,
    color: '#6c757d',
  },
  selectorValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  selectorArrow: {
    fontSize: 12,
    color: '#6c757d',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  buttonContainer: {
    marginTop: 10,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  updateButton: {
    backgroundColor: '#007bff',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxWidth: 300,
    width: '100%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modalOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: '#1976d2',
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  successModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    minWidth: 280,
    maxWidth: '80%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
  },
  successIcon: {
    fontSize: 48,
    color: '#28a745',
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  successButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditScheduleScreen;