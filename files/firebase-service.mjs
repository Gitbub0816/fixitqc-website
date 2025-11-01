// Firebase Service Module
// Handles all Firebase operations for FixIt QC Admin Console

import { firebaseConfig } from './firebase-config.mjs';

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  deleteUser as deleteAuthUser
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth Functions
export const authService = {
  // Sign in
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  // Create new auth user
  createAuthUser: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete auth user (requires re-authentication in production)
  deleteAuthUser: async (user) => {
    try {
      await deleteAuthUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// User Management Functions
export const userService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
      }
      return { success: false, error: 'User not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user by auth UID
  getUserByAuthId: async (authId) => {
    try {
      console.log('🔍 Searching Firestore for user with authId:', authId);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('authId', '==', authId));
      const snapshot = await getDocs(q);
      
      console.log('📊 Query complete. Found documents:', snapshot.size);
      
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = { id: userDoc.id, ...userDoc.data() };
        console.log('✅ User found:', userData);
        return { success: true, data: userData };
      }
      console.error('❌ No user document found with authId:', authId);
      return { success: false, error: 'User not found with authId: ' + authId };
    } catch (error) {
      console.error('❌ Error querying Firestore:', error);
      return { success: false, error: error.message };
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const userDoc = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: true
      };
      const docRef = await addDoc(collection(db, 'users'), userDoc);
      return { success: true, id: docRef.id, data: userDoc };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get users by organization
  getUsersByOrganization: async (organizationId) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('organizationId', '==', organizationId));
      const snapshot = await getDocs(q);
      const users = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Organization Management Functions
export const organizationService = {
  // Get all organizations
  getAllOrganizations: async () => {
    try {
      const orgsRef = collection(db, 'organizations');
      const snapshot = await getDocs(orgsRef);
      const organizations = [];
      snapshot.forEach(doc => {
        organizations.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: organizations };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get organization by ID
  getOrganizationById: async (orgId) => {
    try {
      const orgDoc = await getDoc(doc(db, 'organizations', orgId));
      if (orgDoc.exists()) {
        return { success: true, data: { id: orgDoc.id, ...orgDoc.data() } };
      }
      return { success: false, error: 'Organization not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Create organization
  createOrganization: async (orgData) => {
    try {
      const orgDoc = {
        ...orgData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: true
      };
      const docRef = await addDoc(collection(db, 'organizations'), orgDoc);
      return { success: true, id: docRef.id, data: orgDoc };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update organization
  updateOrganization: async (orgId, orgData) => {
    try {
      const orgRef = doc(db, 'organizations', orgId);
      await updateDoc(orgRef, {
        ...orgData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete organization
  deleteOrganization: async (orgId) => {
    try {
      await deleteDoc(doc(db, 'organizations', orgId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Station Management Functions
export const stationService = {
  // Get all stations
  getAllStations: async () => {
    try {
      const stationsRef = collection(db, 'stations');
      const snapshot = await getDocs(stationsRef);
      const stations = [];
      snapshot.forEach(doc => {
        stations.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: stations };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get stations by organization
  getStationsByOrganization: async (organizationId) => {
    try {
      const stationsRef = collection(db, 'stations');
      const q = query(stationsRef, where('organizationId', '==', organizationId));
      const snapshot = await getDocs(q);
      const stations = [];
      snapshot.forEach(doc => {
        stations.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: stations };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get station by ID
  getStationById: async (stationId) => {
    try {
      const stationDoc = await getDoc(doc(db, 'stations', stationId));
      if (stationDoc.exists()) {
        return { success: true, data: { id: stationDoc.id, ...stationDoc.data() } };
      }
      return { success: false, error: 'Station not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Create station
  createStation: async (stationData) => {
    try {
      const stationDoc = {
        ...stationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: true
      };
      const docRef = await addDoc(collection(db, 'stations'), stationDoc);
      return { success: true, id: docRef.id, data: stationDoc };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update station
  updateStation: async (stationId, stationData) => {
    try {
      const stationRef = doc(db, 'stations', stationId);
      await updateDoc(stationRef, {
        ...stationData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete station
  deleteStation: async (stationId) => {
    try {
      await deleteDoc(doc(db, 'stations', stationId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Equipment Management Functions
export const equipmentService = {
  // Get all equipment
  getAllEquipment: async () => {
    try {
      const equipmentRef = collection(db, 'equipment');
      const snapshot = await getDocs(equipmentRef);
      const equipment = [];
      snapshot.forEach(doc => {
        equipment.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: equipment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get equipment by station
  getEquipmentByStation: async (stationId) => {
    try {
      const equipmentRef = collection(db, 'equipment');
      const q = query(equipmentRef, where('stationId', '==', stationId));
      const snapshot = await getDocs(q);
      const equipment = [];
      snapshot.forEach(doc => {
        equipment.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: equipment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get equipment by organization
  getEquipmentByOrganization: async (organizationId) => {
    try {
      const equipmentRef = collection(db, 'equipment');
      const q = query(equipmentRef, where('organizationId', '==', organizationId));
      const snapshot = await getDocs(q);
      const equipment = [];
      snapshot.forEach(doc => {
        equipment.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: equipment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get equipment by ID
  getEquipmentById: async (equipmentId) => {
    try {
      const equipmentDoc = await getDoc(doc(db, 'equipment', equipmentId));
      if (equipmentDoc.exists()) {
        return { success: true, data: { id: equipmentDoc.id, ...equipmentDoc.data() } };
      }
      return { success: false, error: 'Equipment not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Create equipment
  createEquipment: async (equipmentData) => {
    try {
      const equipmentDoc = {
        ...equipmentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: true
      };
      const docRef = await addDoc(collection(db, 'equipment'), equipmentDoc);
      return { success: true, id: docRef.id, data: equipmentDoc };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update equipment
  updateEquipment: async (equipmentId, equipmentData) => {
    try {
      const equipmentRef = doc(db, 'equipment', equipmentId);
      await updateDoc(equipmentRef, {
        ...equipmentData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete equipment
  deleteEquipment: async (equipmentId) => {
    try {
      await deleteDoc(doc(db, 'equipment', equipmentId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Export database instance for advanced queries
export { db, auth };
