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
} from "react-native";
import { db, auth } from "../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
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
  status: "pending" | "in-progress" | "completed" | "cancelled"; // Add cancelled
  createdAt?: Date;
};

const PRIORITY_COLORS: Record<Schedule["priority"], string> = {
  high: "#dc3545",
  medium: "#ffc107",
  low: "#28a745",
};



const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<"all" | Schedule["status"]>("all");
  const fadeAnim = new Animated.Value(0);


  // Fetch schedules



  const fetchSchedules = async () => {
  try {
    if (!auth.currentUser) {
      console.log("No user logged in yet.");
      return;
    }

    console.log("Fetching schedules for user:", auth.currentUser.uid);
    setLoading(true);

    // Try without orderBy first to see if schedules exist
    const q = query(
      collection(db, "schedules"),
      where("userId", "==", auth.currentUser.uid)
      // Temporarily remove orderBy to test
    );

    const querySnapshot = await getDocs(q);
    console.log("Found", querySnapshot.size, "schedules");
    
    const data: Schedule[] = [];

    querySnapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const rawData = docSnap.data();
      console.log("Raw schedule data:", rawData);

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

    console.log("Processed schedules:", data);

    // Sort by date in JavaScript instead of Firestore
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

// Here 
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSchedules();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchSchedules();
    const unsubscribe = navigation.addListener("focus", fetchSchedules);

    // Animate in
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
  }, [navigation]);

  // Filter schedules
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

    setFilteredSchedules(filtered);
  }, [schedules, searchText, filterStatus]);


          ///
  // Fixed Delete function
const handleDelete = async (id: string, title: string) => {
  console.log("Delete button pressed for:", title, id); // Debug log
  
  Alert.alert(
    "Confirm Delete", 
    `Delete "${title}"?`, 
    [
      { 
        text: "Cancel", 
        style: "cancel",
        onPress: () => console.log("Delete cancelled")
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          console.log("Delete confirmed, deleting:", id);
          try {
            await deleteDoc(doc(db, "schedules", id));
            console.log("Document deleted successfully");
            await fetchSchedules(); // Refresh the list
            Alert.alert("Success", "Schedule deleted successfully");
          } catch (error: any) {
            console.error("Delete error:", error);
            Alert.alert("Delete Error", error.message);
          }
        },
      },
    ],
    { cancelable: false } // Add this option
  );
};

// Fixed Logout function  
const handleLogout = async () => {
  console.log("Logout button pressed"); // Debug log
  
  Alert.alert(
    "Logout", 
    "Are you sure you want to logout?", 
    [
      { 
        text: "Cancel", 
        style: "cancel",
        onPress: () => console.log("Logout cancelled")
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          console.log("Logout confirmed");
          try {
            await signOut(auth);
            console.log("User signed out successfully");
            navigation.replace("Auth");
          } catch (error: any) {
            console.error("Logout error:", error);
            Alert.alert("Logout Error", error.message);
          }
        },
      },
    ],
    { cancelable: false } // Add this option
  );
};
    // HERE
 // Update this function to handle all status types
const getStatusDisplay = (status: Schedule["status"]) => {
  const map: Record<Schedule["status"] | "cancelled", string> = {
    pending: "Pending",
    "in-progress": "In Progress", 
    completed: "Completed",
    cancelled: "Cancelled", // Add this missing status
  };
  return map[status as keyof typeof map] || "Pending";
};

// Also update your STATUS_COLORS to match
const STATUS_COLORS: Record<Schedule["status"] | "cancelled", string> = {
  pending: "#6c757d",
  "in-progress": "#007bff",
  completed: "#28a745",
  cancelled: "#dc3545", // Make sure this matches
};

  const getPriorityDisplay = (priority: Schedule["priority"]) => {
    const map: Record<Schedule["priority"], string> = {
      high: "High",
      medium: "Medium",
      low: "Low",
    };
    return map[priority];
  };

  const isOverdue = (date: string) => {
    const today = new Date().toISOString().split("T")[0];
    return date < today;
  };

// HERE
const renderScheduleItem = ({ item }: { item: Schedule }) => {
  console.log("Rendering item:", item.title, item.id); // Better debug log
  
  const overdue = isOverdue(item.date) && item.status !== "completed";

  return (
    <View
      style={[
        styles.item,
        overdue && styles.overdueItem,
      ]}
    >
      <View style={styles.itemHeader}>
        <Text style={[styles.itemTitle, overdue && styles.overdueText]}>
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
        <Text style={styles.dateText}>
          📅 {item.date || "No date"} {item.time && `⏰ ${item.time}`}
        </Text>
        {item.category && (
          <Text style={styles.categoryText}>🏷️ {item.category}</Text>
        )}
        {item.description && (
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {overdue && <Text style={styles.overdueLabel}>⚠️ Overdue</Text>}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() =>
            navigation.navigate("EditSchedule", { schedule: item })
          }
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
// HERE 

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

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search schedules..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
        


      
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

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("AddSchedule")}
      >
        <Text style={styles.addBtnText}>+ Add New Schedule</Text>
      </TouchableOpacity>

      <FlatList
  data={filteredSchedules}
  keyExtractor={(item) => item.id}
  renderItem={renderScheduleItem}
  contentContainerStyle={styles.listContainer}
  showsVerticalScrollIndicator={false}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
  onLayout={() => console.log("FlatList mounted")}
  ListHeaderComponent={() => {
    console.log("FlatList header - data length:", filteredSchedules.length);
    return null;
  }}
  ListEmptyComponent={
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📅</Text>
      <Text style={styles.emptyTitle}>No Schedules Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchText || filterStatus !== "all"
          ? "Try adjusting your search or filters"
          : "Tap the button below to create your first schedule"}
      </Text>
      <Text style={{marginTop: 10, fontSize: 12, color: '#666'}}>
        Debug: Total schedules: {schedules.length}, Filtered: {filteredSchedules.length}
      </Text>
    </View>
  }
/>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#004085" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logo: { width: 50, height: 50, marginRight: 12 },
  welcomeText: { fontSize: 16, fontWeight: "600", color: "#004085" },
  scheduleCount: { fontSize: 12, color: "#666", marginTop: 2 },
  logoutBtn: {
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  logoutText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#004085",
  },
  searchContainer: { marginBottom: 16 },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  filterBtn: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 2,
    alignItems: "center",
  },
  filterBtnActive: { backgroundColor: "#004085" },
  filterBtnText: { fontSize: 12, color: "#666", fontWeight: "500" },
  filterBtnTextActive: { color: "#fff", fontWeight: "600" },
  addBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  listContainer: { paddingBottom: 80 },
  item: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
  },
  overdueItem: { borderLeftWidth: 4, borderLeftColor: "#dc3545" },
  itemHeader: {
  flexDirection: "row",
  justifyContent: "space-between", 
  alignItems: "flex-start", // Add this
  marginBottom: 8,
  },
  itemTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  overdueText: { color: "#dc3545" },
  badgeContainer: {  
  flexDirection: "row", 
  gap: 6,
  flexShrink: 0,
},
  priorityBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  itemContent: { marginBottom: 8 },
  dateText: { fontSize: 14, color: "#555", marginBottom: 4 },
  categoryText: { fontSize: 13, color: "#666", marginBottom: 4 },
  descriptionText: { fontSize: 13, color: "#444" },
  overdueLabel: { color: "#dc3545", fontSize: 13, marginTop: 4 },
  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  editBtn: {
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    padding: 8,
    borderRadius: 6,
  },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", marginTop: 8 },
  emptySubtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  // Add this to your styles object in HomeScreen:
titleContainer: {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
},
});

export default HomeScreen;
