import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Platform,
  BackHandler,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Animated,
  Modal,
  Dimensions,
} from "react-native";
import { db, auth } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { signOut } from "firebase/auth";

type Schedule = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  category: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed" | "cancelled";
  createdAt?: Date;
};

const PRIORITY_COLORS: Record<Schedule["priority"], string> = {
  high: "#dc3545",
  medium: "#ffc107",
  low: "#28a745",
};

const STATUS_COLORS: Record<Schedule["status"] | "cancelled", string> = {
  pending: "#6c757d",
  "in-progress": "#007bff",
  completed: "#28a745",
  cancelled: "#dc3545",
};

const { height: screenHeight } = Dimensions.get("window");

const PRIORITY_OPTIONS = [
  { label: "All Priorities", value: "all" },
  { label: "High Priority", value: "high" },
  { label: "Medium Priority", value: "medium" },
  { label: "Low Priority", value: "low" },
];

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { currentUser } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Schedule["status"]>("all");
  const [filterPriority, setFilterPriority] = useState<"all" | Schedule["priority"]>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, title: string} | null>(null);
  const [doneConfirm, setDoneConfirm] = useState<{id: string, title: string} | null>(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);
  const fadeAnim = new Animated.Value(0);

  const fetchSchedules = async () => {
    try {
      if (!currentUser) {
        console.log("No user logged in yet.");
        return;
      }

      setLoading(true);
      const q = query(
        collection(db, "schedules"),
        where("userId", "==", currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const data: Schedule[] = [];

      querySnapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
        const rawData = docSnap.data();
        data.push({
          id: docSnap.id,
          title: rawData.title || "",
          description: rawData.description || "",
          date: rawData.date || "",
          time: rawData.time || "",
          category: rawData.category || "general",
          priority: rawData.priority || "medium",
          status: rawData.status || "pending",
          createdAt: rawData.createdAt?.toDate
            ? rawData.createdAt.toDate()
            : new Date(),
        });
      });

      data.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        return 0;
      });

      setSchedules(data);
      setFilteredSchedules(data);
    } catch (error: any) {
      console.error("Error fetching schedules:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSchedules();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchSchedules();
    }
    
    const unsubscribe = navigation.addListener("focus", () => {
      if (currentUser) {
        fetchSchedules();
      }
    });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    if (Platform.OS === "android") {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true
      );
      return () => {
        unsubscribe();
        backHandler.remove();
      };
    }

    return unsubscribe;
  }, [navigation, currentUser]);

  useEffect(() => {
    let filtered = schedules;

    if (searchText) {
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(searchText.toLowerCase()) ||
          s.description?.toLowerCase().includes(searchText.toLowerCase()) ||
          s.category?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((s) => s.status === filterStatus);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((s) => s.priority === filterPriority);
    }

    setFilteredSchedules(filtered);
  }, [schedules, searchText, filterStatus, filterPriority]);

  const handleDelete = (id: string, title: string) => {
    setDeleteConfirm({ id, title });
  };

  const handleMarkAsDone = (id: string, title: string) => {
    setDoneConfirm({ id, title });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteDoc(doc(db, "schedules", deleteConfirm.id));
      await fetchSchedules();
    } catch (error: any) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Failed to delete schedule. Please try again.");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const confirmDone = async () => {
    if (!doneConfirm) return;
    
    try {
      await updateDoc(doc(db, "schedules", doneConfirm.id), {
        status: "completed",
        updatedAt: serverTimestamp(),
      });
      await fetchSchedules();
    } catch (error: any) {
      console.error("Mark as done error:", error);
      Alert.alert("Error", "Failed to mark schedule as completed. Please try again.");
    } finally {
      setDoneConfirm(null);
    }
  };

  const handleLogout = () => {
    setLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    } finally {
      setLogoutConfirm(false);
    }
  };

  const getStatusDisplay = (status: Schedule["status"]) => {
    const map: Record<Schedule["status"] | "cancelled", string> = {
      pending: "Pending",
      "in-progress": "In Progress", 
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return map[status as keyof typeof map] || "Pending";
  };

  const getPriorityDisplay = (priority: Schedule["priority"]) => {
    const map: Record<Schedule["priority"], string> = {
      high: "High",
      medium: "Medium",
      low: "Low",
    };
    return map[priority];
  };

  const getPriorityLabel = (value: "all" | Schedule["priority"]) => {
    if (value === "all") return "All Priorities";
    return getPriorityDisplay(value);
  };

  const isOverdue = (date: string) => {
    const today = new Date().toISOString().split("T")[0];
    return date < today && date !== "";
  };

  const renderPrioritySelector = () => (
    <TouchableOpacity 
      style={styles.prioritySelectorButton}
      onPress={() => setPriorityModalVisible(true)}
    >
      <Text style={styles.prioritySelectorLabel}>Priority:</Text>
      <Text style={styles.prioritySelectorValue}>
        {getPriorityLabel(filterPriority)}
      </Text>
      <Text style={styles.prioritySelectorArrow}>▼</Text>
    </TouchableOpacity>
  );

  const renderPriorityModal = () => (
    <Modal
      visible={priorityModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setPriorityModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.priorityModalContent}>
          <Text style={styles.modalTitle}>Filter by Priority</Text>
          {PRIORITY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.modalOption,
                filterPriority === option.value && styles.modalOptionSelected,
              ]}
              onPress={() => {
                setFilterPriority(option.value as any);
                setPriorityModalVisible(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                filterPriority === option.value && styles.modalOptionTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setPriorityModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderScheduleItem = ({ item }: { item: Schedule }) => {
    const overdue = isOverdue(item.date) && item.status !== "completed";
    const isCompleted = item.status === "completed";

    return (
      <View style={[
        styles.item, 
        overdue && styles.overdueItem,
        isCompleted && styles.completedItem
      ]}>
        <View style={styles.itemHeader}>
          <Text style={[
            styles.itemTitle, 
            overdue && styles.overdueText,
            isCompleted && styles.completedText
          ]}>
            {item.title || "No Title"}
          </Text>
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: PRIORITY_COLORS[item.priority] || "#ffc107" },
              ]}
            >
              <Text style={styles.badgeText}>
                {getPriorityDisplay(item.priority)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: STATUS_COLORS[item.status] || "#6c757d" },
              ]}
            >
              <Text style={styles.badgeText}>
                {getStatusDisplay(item.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.itemContent}>
          <Text style={[
            styles.dateText,
            isCompleted && styles.completedText
          ]}>
            📅 {item.date || "No date"} {item.time && `⏰ ${item.time}`}
          </Text>
          {item.category && (
            <Text style={[
              styles.categoryText,
              isCompleted && styles.completedText
            ]}>
              🏷️ {item.category}
            </Text>
          )}
          {item.description && (
            <Text style={[
              styles.descriptionText, 
              isCompleted && styles.completedText
            ]} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          {overdue && <Text style={styles.overdueLabel}>⚠️ Overdue</Text>}
          {isCompleted && <Text style={styles.completedLabel}>✅ Completed</Text>}
        </View>

        <View style={styles.actions}>
          {!isCompleted && (
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => handleMarkAsDone(item.id, item.title)}
            >
              <Text style={styles.btnText}>✅ Done</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("EditSchedule", { schedule: item })}
          >
            <Text style={styles.btnText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id, item.title)}
          >
            <Text style={styles.btnText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={["#87CEFA", "#E0F7FA"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#004085" />
          <Text style={styles.loadingText}>Loading schedules...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#87CEFA", "#E0F7FA"]} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.scheduleCount}>
              {filteredSchedules.length} schedule
              {filteredSchedules.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>My Schedules</Text>

      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search schedules..."
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.filtersRow}>
          <View style={styles.filterContainer}>
            {(["all", "pending", "in-progress", "completed"] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterBtn,
                  filterStatus === status && styles.filterBtnActive,
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    filterStatus === status && styles.filterBtnTextActive,
                  ]}
                >
                  {status === "all" ? "All" : getStatusDisplay(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.priorityFilterContainer}>
            {renderPrioritySelector()}
          </View>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("AddSchedule")}
        >
          <Text style={styles.addBtnText}>+ Add New Schedule</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={filteredSchedules}
          keyExtractor={(item) => item.id}
          renderItem={renderScheduleItem}
          contentContainerStyle={
            filteredSchedules.length === 0 
              ? styles.emptyContentContainer
              : styles.listContentContainer
          }
          style={styles.flatList}
          showsVerticalScrollIndicator={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>No Schedules Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchText || filterStatus !== "all" || filterPriority !== "all"
                  ? "Try adjusting your search or filters"
                  : "Tap the button below to create your first schedule"}
              </Text>
            </View>
          }
        />
      </View>

      {/* Priority Filter Modal */}
      {renderPriorityModal()}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirm !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteConfirm(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Confirm Delete</Text>
            <Text style={styles.confirmationMessage}>
              Are you sure you want to delete "{deleteConfirm?.title}"?
            </Text>
            <Text style={styles.confirmationSubtext}>
              This action cannot be undone.
            </Text>
            
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmationBtn, styles.cancelBtn]}
                onPress={() => setDeleteConfirm(null)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmationBtn, styles.deleteConfirmBtn]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Done Confirmation Modal */}
      <Modal
        visible={doneConfirm !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDoneConfirm(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Mark as Completed</Text>
            <Text style={styles.confirmationMessage}>
              Are you sure you want to mark "{doneConfirm?.title}" as completed?
            </Text>
            <Text style={styles.confirmationSubtext}>
              This will update the status to "Completed" and move it to the completed section.
            </Text>
            
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmationBtn, styles.cancelBtn]}
                onPress={() => setDoneConfirm(null)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmationBtn, styles.doneConfirmBtn]}
                onPress={confirmDone}
              >
                <Text style={styles.doneBtnText}>Mark as Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={logoutConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Confirm Logout</Text>
            <Text style={styles.confirmationMessage}>
              Are you sure you want to logout?
            </Text>
            <Text style={styles.confirmationSubtext}>
              You will need to sign in again to access your schedules.
            </Text>
            
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmationBtn, styles.cancelBtn]}
                onPress={() => setLogoutConfirm(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmationBtn, styles.logoutConfirmBtn]}
                onPress={confirmLogout}
              >
                <Text style={styles.logoutBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: Platform.OS === 'web' ? 5 : 15,
    minHeight: 50,
  },
  logoContainer: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  logo: { 
    width: 45, 
    height: 45, 
    marginRight: 10 
  },
  welcomeText: { 
    fontSize: 15, 
    fontWeight: "600", 
    color: "#004085" 
  },
  scheduleCount: { 
    fontSize: 12, 
    color: "#666", 
    marginTop: 2 
  },
  logoutBtn: {
    backgroundColor: "#dc3545",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  logoutText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 13 
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#004085",
  },
  controlsContainer: {
    marginBottom: 10,
  },
  searchContainer: { 
    marginBottom: 12 
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filtersRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 10,
  },
  filterContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priorityFilterContainer: {
    flex: 1,
  },
  filterBtn: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 18,
    marginHorizontal: 2,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterBtnActive: { 
    backgroundColor: "#004085" 
  },
  filterBtnText: { 
    fontSize: 11, 
    color: "#666", 
    fontWeight: "500" 
  },
  filterBtnTextActive: { 
    color: "#fff", 
    fontWeight: "600" 
  },
  prioritySelectorButton: {
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    height: 40,
  },
  prioritySelectorLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  prioritySelectorValue: {
    fontSize: 12,
    color: "#004085",
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  prioritySelectorArrow: {
    fontSize: 10,
    color: "#666",
  },
  addBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: "center",
    marginBottom: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addBtnText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 15 
  },
  listContainer: {
    flex: 1,
    minHeight: 300,
    maxHeight: screenHeight * 0.6,
  },
  flatList: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 15,
    flexGrow: 1,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  item: {
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 10,
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 120,
  },
  overdueItem: { 
    borderLeftWidth: 4, 
    borderLeftColor: "#dc3545" 
  },
  completedItem: { 
    borderLeftWidth: 4, 
    borderLeftColor: "#28a745" 
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between", 
    alignItems: "flex-start",
    marginBottom: 6,
  },
  itemTitle: { 
    fontSize: 15, 
    fontWeight: "bold", 
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  overdueText: { 
    color: "#dc3545" 
  },
  completedText: { 
    color: "#28a745" 
  },
  badgeContainer: {  
    flexDirection: "row", 
    gap: 5,
    flexShrink: 0,
  },
  priorityBadge: {
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  statusBadge: {
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  badgeText: { 
    color: "#fff", 
    fontSize: 11, 
    fontWeight: "600" 
  },
  itemContent: { 
    marginBottom: 6 
  },
  dateText: { 
    fontSize: 13, 
    color: "#555", 
    marginBottom: 3 
  },
  categoryText: { 
    fontSize: 12, 
    color: "#666", 
    marginBottom: 3 
  },
  descriptionText: { 
    fontSize: 12, 
    color: "#444",
    lineHeight: 16,
  },
  overdueLabel: { 
    color: "#dc3545", 
    fontSize: 12, 
    marginTop: 3,
    fontWeight: "600",
  },
  completedLabel: { 
    color: "#28a745", 
    fontSize: 12, 
    marginTop: 3,
    fontWeight: "600",
  },
  actions: { 
    flexDirection: "row", 
    justifyContent: "flex-end", 
    marginTop: 6,
    gap: 6,
  },
  doneBtn: {
    backgroundColor: "#28a745",
    padding: 6,
    borderRadius: 5,
    minWidth: 60,
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: "#007bff",
    padding: 6,
    borderRadius: 5,
    minWidth: 60,
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    padding: 6,
    borderRadius: 5,
    minWidth: 60,
    alignItems: 'center',
  },
  btnText: { 
    color: "#fff", 
    fontSize: 12, 
    fontWeight: "600" 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: "#004085" 
  },
  emptyContainer: { 
    alignItems: "center", 
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: { 
    fontSize: 36 
  },
  emptyTitle: { 
    fontSize: 16, 
    fontWeight: "bold", 
    marginTop: 8 
  },
  emptySubtitle: { 
    fontSize: 13, 
    color: "#666", 
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  priorityModalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    minWidth: 250,
    maxWidth: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
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
    borderRadius: 8,
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmationModal: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    minWidth: 300,
    maxWidth: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  confirmationMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmationSubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 25,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  confirmationBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  cancelBtn: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelBtnText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteConfirmBtn: {
    backgroundColor: '#dc3545',
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  doneConfirmBtn: {
    backgroundColor: '#28a745',
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutConfirmBtn: {
    backgroundColor: '#dc3545',
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;