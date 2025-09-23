import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const signup = async (email: string, password: string) => {
    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const login = async (email: string, password: string) => {
    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const logout = async () => {
    try {
        await firebase.auth().signOut();
    } catch (error) {
        throw new Error(error.message);
    }
};

export const addNotification = async (notification: any) => {
    try {
        const notificationRef = firebase.database().ref('notifications');
        const newNotificationRef = notificationRef.push();
        await newNotificationRef.set(notification);
        return newNotificationRef.key;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const getNotifications = async () => {
    try {
        const notificationRef = firebase.database().ref('notifications');
        const snapshot = await notificationRef.once('value');
        const notifications = snapshot.val();
        return notifications ? Object.values(notifications) : [];
    } catch (error) {
        throw new Error(error.message);
    }
};

export const updateNotification = async (id: string, updatedNotification: any) => {
    try {
        const notificationRef = firebase.database().ref(`notifications/${id}`);
        await notificationRef.update(updatedNotification);
    } catch (error) {
        throw new Error(error.message);
    }
};

export const deleteNotification = async (id: string) => {
    try {
        const notificationRef = firebase.database().ref(`notifications/${id}`);
        await notificationRef.remove();
    } catch (error) {
        throw new Error(error.message);
    }
};