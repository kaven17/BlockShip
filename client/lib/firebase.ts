import {
  initializeApp,
  getApp,
  getApps,
} from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ""}.firebaseapp.com`,
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ""}.appspot.com`,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Initialize Firebase (prevent double initialization)
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Initialize services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// Authentication Functions
const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

// User Profile Management
const updateUserProfile = async (
  displayName?: string,
  photoURL?: string,
) => {
  const currentUser = auth.currentUser;
  if (!currentUser)
    throw new Error("No user is currently signed in");

  return updateProfile(currentUser, {
    displayName: displayName || currentUser.displayName,
    photoURL: photoURL || currentUser.photoURL,
  });
};

// Password Management
const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

const changePassword = async (newPassword: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser)
    throw new Error("No user is currently signed in");

  return updatePassword(currentUser, newPassword);
};

// Reauthentication for sensitive operations
const reauthenticateUser = async (password: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email)
    throw new Error("No user is currently signed in");

  const credential = EmailAuthProvider.credential(
    currentUser.email,
    password,
  );
  return reauthenticateWithCredential(
    currentUser,
    credential,
  );
};

// Firestore User Operations
const createUserDocument = async (
  user: User,
  additionalData?: any,
) => {
  if (!user) return;

  const userRef = doc(firestore, "users", user.uid);

  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: new Date(),
    ...additionalData,
  };

  return updateDoc(userRef, userData);
};

// Storage Operations
const uploadProfileImage = async (file: File) => {
  const currentUser = auth.currentUser;
  if (!currentUser)
    throw new Error("No user is currently signed in");

  const storageRef = ref(
    storage,
    `profileImages/${currentUser.uid}`,
  );
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);

  // Update user profile with new photo URL
  await updateUserProfile(undefined, downloadURL);

  return downloadURL;
};

// User Shipment Tracking
const getUserShipments = async (userId: string) => {
  const shipmentsRef = collection(firestore, "shipments");
  const q = query(
    shipmentsRef,
    where("userId", "==", userId),
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export {
  // Firebase App and Services
  app,
  auth,
  firestore,
  storage,

  // Authentication Methods
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithGoogle,
  signOut,
  onAuthStateChanged,

  // User Management
  updateUserProfile,
  resetPassword,
  changePassword,
  reauthenticateUser,
  createUserDocument,
  uploadProfileImage,
  getUserShipments,

  // Types
  type User,
};