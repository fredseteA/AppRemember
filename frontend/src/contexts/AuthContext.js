import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import axios from 'axios';

const AuthContext = createContext({});

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const idToken = await firebaseUser.getIdToken(true);
      setToken(idToken);

      let tokenResult;

      try {
        tokenResult = await firebaseUser.getIdTokenResult();
        console.log('Claims:', tokenResult.claims);

        await axios.post(`${API}/auth/register`, {
          firebase_uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0]
        });

        const userResponse = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${idToken}` }
        });

        setUser({
          ...firebaseUser,
          ...userResponse.data,
          is_admin: tokenResult.claims.admin || false
        });
      } catch (error) {
        console.error('Error registering user:', error);
        setUser({
          ...firebaseUser,
          is_admin: tokenResult?.claims?.admin || false
        });
      }
    } else {
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  });

  return unsubscribe;
}, []);

  const signIn = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  };

  const signInWithGoogle = async () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    return signOut(auth);
  };

  const value = {
    user,
    token,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};