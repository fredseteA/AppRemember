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
import { API } from '@/config';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);         // dados do Firestore (name, role, etc)
  const [firebaseUser, setFirebaseUser] = useState(null); // objeto Firebase original (tem getIdToken)
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Salva o objeto Firebase original SEPARADO — nunca fazer spread nele
        setFirebaseUser(fbUser);

        const idToken = await fbUser.getIdToken(true);
        setToken(idToken);

        let tokenResult;
        try {
          tokenResult = await fbUser.getIdTokenResult();
          console.log('Claims:', tokenResult.claims);

          await axios.post(`${API}/auth/register`, {
            firebase_uid: fbUser.uid,
            email: fbUser.email,
            name: fbUser.displayName || fbUser.email.split('@')[0]
          });

          const userResponse = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${idToken}` }
          });

          // user contém dados do Firestore + flags — NÃO mistura com fbUser
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            ...userResponse.data,
            is_admin: tokenResult.claims.admin || false,
          });
        } catch (error) {
          console.error('Error registering user:', error);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            is_admin: tokenResult?.claims?.admin || false,
          });
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sempre retorna token fresco — use isso em vez do token estático
  const getToken = async () => {
    if (!firebaseUser) return null;
    return await firebaseUser.getIdToken();
  };

  const signIn = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    return signOut(auth);
  };

  const value = {
    user,
    firebaseUser,  // expõe o objeto Firebase original para quem precisar de getIdToken
    token,         // mantido para não quebrar quem já usa
    getToken,      // novo — sempre fresco
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};