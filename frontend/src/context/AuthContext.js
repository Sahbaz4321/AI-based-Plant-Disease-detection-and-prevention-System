import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, database } from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { ref, set, get, child } from "firebase/database";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentAuthUser) => {
      if (currentAuthUser) {
        // Fetch user info from Realtime DB
        try {
          const dbRef = ref(database);
          const snapshot = await get(child(dbRef, `users/${currentAuthUser.uid}`));
          if (snapshot.exists()) {
            const dbData = snapshot.val();
            // password is kept in DB per user request, but auth handles it natively as well
            setUser({
              id: currentAuthUser.uid,
              email: currentAuthUser.email,
              name: dbData.name || "User",
              number: dbData.number || "",
              password: dbData.password || "", // Keep as requested
              avatar: (dbData.name || currentAuthUser.email).charAt(0).toUpperCase(),
            });
          } else {
            setUser({
              id: currentAuthUser.uid,
              email: currentAuthUser.email,
              name: "User",
              number: "",
              password: "",
              avatar: currentAuthUser.email.charAt(0).toUpperCase(),
            });
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setUser({
            id: currentAuthUser.uid,
            email: currentAuthUser.email,
            name: "User",
            avatar: currentAuthUser.email.charAt(0).toUpperCase(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (!email || !password) throw new Error("Email and password required");
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, number) => {
    setLoading(true);
    try {
      if (!name || !email || !password) throw new Error("All fields required");
      if (password.length < 6) throw new Error("Password must be at least 6 characters");
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Save user details to DB
      await set(ref(database, 'users/' + newUser.uid), {
        name,
        email,
        number: number || "",
        password: password, // As requested
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user, updateUser: setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
