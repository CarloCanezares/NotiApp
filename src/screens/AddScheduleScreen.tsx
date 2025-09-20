// I love this new UI perfect

import { Button } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { db, auth } from "../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const PRIORITY_OPTIONS = [
  { label: "Low Priority", value: "low", color: "#28a745" },
  { label: "Medium Priority", value: "medium", color: "#ffc107" },
  { label: "High Priority", value: "high", color: "#dc3545" },
];

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending", color: "#6c757d" },
  { label: "In Progress", value: "in-progress", color: "#007bff" },
  { label: "Completed", value: "completed", color: "#28a745" },
];

const CATEGORY_OPTIONS = [
  { label: "General", value: "general" },
  { label: "Work", value: "work" },
  { label: "Personal", value: "personal" },
  { label: "Health", value: "health" },
  { label: "Education", value: "education" },
  { label: "Family", value: "family" },
  { label: "Travel", value: "travel" },
  { label: "Shopping", value: "shopping" },
];

const AddScheduleScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("pending");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Handle Date change
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  // Handle Time change
  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    setTime(currentTime);
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Title is required.");
      return;
    }

    try {
      setLoading(true);

      const newSchedule = {
        title: title.trim(),
        description: description.trim(),
        date: date.toISOString().split("T")[0], // YYYY-MM-DD
        time: time.toTimeString().slice(0, 5), // HH:mm
        priority,
        status,
        category,
        userId: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log("Saving schedule:", newSchedule);

      await addDoc(collection(db, "schedules"), newSchedule);

      Alert.alert("Success", "Schedule added!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Add Error", error.message);
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

  const renderModal = (
    visible,
    setVisible,
    options,
    selectedValue,
    onSelect,
    title
  ) => (
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
                option.color && {
                  borderLeftColor: option.color,
                  borderLeftWidth: 4,
                },
              ]}
              onPress={() => {
                onSelect(option.value);
                setVisible(false);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  selectedValue === option.value &&
                    styles.modalOptionTextSelected,
                ]}
              >
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
    PRIORITY_OPTIONS.find((option) => option.value === value)?.label ||
    "Medium Priority";

  const getStatusLabel = (value) =>
    STATUS_OPTIONS.find((option) => option.value === value)?.label || "Pending";

  const getCategoryLabel = (value) =>
    CATEGORY_OPTIONS.find((option) => option.value === value)?.label ||
    "General";

  return (
    <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Add New Schedule</Text>

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
            {Platform.OS === "web" ? (
              <input
                type="date"
                value={date.toISOString().split("T")[0]}
                onChange={(e) => setDate(new Date(e.target.value))}
                style={{ padding: 12, borderRadius: 8, borderWidth: 1 }}
              />
            ) : (
              <>
                <Button
                  title="Pick a Date"
                  onPress={() => setShowDatePicker(true)}
                />
                <Text style={{ marginTop: 8 }}>
                  {date.toISOString().split("T")[0]}
                </Text>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                  />
                )}
              </>
            )}
          </View>

          {/* Time */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time *</Text>
            {Platform.OS === "web" ? (
              <input
                type="time"
                value={time.toTimeString().slice(0, 5)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":");
                  const newTime = new Date();
                  newTime.setHours(hours);
                  newTime.setMinutes(minutes);
                  setTime(newTime);
                }}
                style={{ padding: 12, borderRadius: 8, borderWidth: 1 }}
              />
            ) : (
              <>
                <Button
                  title="Pick a Time"
                  onPress={() => setShowTimePicker(true)}
                />
                <Text style={{ marginTop: 8 }}>
                  {time.toTimeString().slice(0, 5)}
                </Text>
                {showTimePicker && (
                  <DateTimePicker
                    value={time}
                    mode="time"
                    display="default"
                    onChange={onChangeTime}
                  />
                )}
              </>
            )}
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
              "Priority",
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
              "Status",
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
              "Category",
              category,
              CATEGORY_OPTIONS,
              () => setCategoryModalVisible(true),
              getCategoryLabel
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAdd}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Adding..." : "✓ Add Schedule"}
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

      {/* Modals */}
      {renderModal(
        priorityModalVisible,
        setPriorityModalVisible,
        PRIORITY_OPTIONS,
        priority,
        setPriority,
        "Priority"
      )}

      {renderModal(
        statusModalVisible,
        setStatusModalVisible,
        STATUS_OPTIONS,
        status,
        setStatus,
        "Status"
      )}

      {renderModal(
        categoryModalVisible,
        setCategoryModalVisible,
        CATEGORY_OPTIONS,
        category,
        setCategory,
        "Category"
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
  },
  form: { backgroundColor: "#fff", padding: 20, borderRadius: 12 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 6, color: "#333" },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
  },
  textArea: { height: 100 },
  selectorButton: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectorLabel: { fontWeight: "600", fontSize: 14 },
  selectorValue: { color: "#333", fontSize: 14 },
  selectorArrow: { color: "#888" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between" },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  addButton: { backgroundColor: "#28a745" },
  cancelButton: { backgroundColor: "#dc3545" },
  buttonText: { color: "#fff", fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  modalOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOptionSelected: { backgroundColor: "#e0f7fa" },
  modalOptionText: { fontSize: 16, color: "#333" },
  modalOptionTextSelected: { fontWeight: "bold", color: "#007bff" },
  modalCloseButton: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseButtonText: { color: "#333", fontWeight: "600" },
});

export default AddScheduleScreen;
