import { onAuthStateChanged } from "firebase/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext } from "./authContext.js";
import { logout as logoutUser } from "../services/authService.js";
import { auth } from "../services/firebase.js";
import { getUserProfile } from "../services/userService.js";

const initialAuthState = {
  firebaseUser: null,
  userProfile: null,
  loading: true,
  authError: null,
};

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(initialAuthState);

  const refreshUserProfile = useCallback(async () => {
    if (!auth.currentUser) {
      setAuthState({
        firebaseUser: null,
        userProfile: null,
        loading: false,
        authError: null,
      });
      return null;
    }

    const userProfile = await getUserProfile(auth.currentUser.uid);

    setAuthState((currentState) => ({
      ...currentState,
      firebaseUser: auth.currentUser,
      userProfile,
      loading: false,
      authError: null,
    }));

    return userProfile;
  }, []);

  useEffect(() => {
    let isCurrent = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isCurrent) {
        return;
      }

      setAuthState((currentState) => ({
        ...currentState,
        loading: true,
        authError: null,
      }));

      if (!firebaseUser) {
        setAuthState({
          firebaseUser: null,
          userProfile: null,
          loading: false,
          authError: null,
        });
        return;
      }

      try {
        const userProfile = await getUserProfile(firebaseUser.uid);

        if (!isCurrent) {
          return;
        }

        setAuthState({
          firebaseUser,
          userProfile,
          loading: false,
          authError: null,
        });
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setAuthState({
          firebaseUser,
          userProfile: null,
          loading: false,
          authError: error,
        });
      }
    });

    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      ...authState,
      isAuthenticated: Boolean(authState.firebaseUser),
      role: authState.userProfile?.role ?? null,
      refreshUserProfile,
      logout: logoutUser,
    }),
    [authState, refreshUserProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
