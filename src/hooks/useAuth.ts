import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

export type Role = 'guest' | 'pending' | 'student' | 'admin' | 'staff' | 'management' | 'other_staff';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>('guest');
  const [loading, setLoading] = useState(true);
  const [customUser, setCustomUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('plc_custom_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const checkIsAdmin = async (authUser: User): Promise<boolean> => {
    const cleanEmail = (authUser.email || '').trim().toLowerCase();
    if (cleanEmail === 'spcomputerinfo123@gmail.com' || cleanEmail === 'plccomputerinfo123@gmail.com') {
      return true;
    }
    try {
      const adminDoc = await getDoc(doc(db, 'admins', authUser.uid));
      if (adminDoc.exists()) return true;

      const userDoc = await getDoc(doc(db, 'users', authUser.uid));
      if (userDoc.exists() && ['admin', 'management'].includes(userDoc.data().role)) {
        return true;
      }

      if (cleanEmail) {
        const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          if (['admin', 'management'].includes(data.role)) {
            return true;
          }
        }
      }
    } catch (e) {
      console.error("Error verifying admin role:", e);
    }
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.removeItem('plc_custom_user');
        setCustomUser(null);

        let cleanEmail = (currentUser.email || '').trim().toLowerCase();
        let currentRole: Role = 'pending';

        if (cleanEmail === 'spcomputerinfo123@gmail.com' || cleanEmail === 'plccomputerinfo123@gmail.com') {
          currentRole = 'admin';
        } else {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            if (adminDoc.exists()) {
              currentRole = 'admin';
            }
          } catch (e) { /* ignore */ }
        }
        
        try {
          // Sync with users collection
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            // Check if there is an existing user document by email (e.g. pre-created by Admin)
            const usersQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
            const usersSnapshot = await getDocs(usersQuery);
            
            if (!usersSnapshot.empty) {
              const existingDoc = usersSnapshot.docs[0];
              const existingData = existingDoc.data();
              
              if (currentRole !== 'admin') {
                currentRole = (existingData.role as Role) || 'pending';
              }

              // Copy/merge data to new UID doc
              await setDoc(userRef, {
                 ...existingData,
                 email: cleanEmail,
                 name: currentUser.displayName || existingData.name || '',
                 role: currentRole,
                 status: existingData.status || 'active',
                 lastLogin: new Date().toISOString()
              });
              
              // Delete old dummy doc if ID differs from real Auth UID
              if (existingDoc.id !== currentUser.uid) {
                await deleteDoc(existingDoc.ref);
              }
            } else {
              await setDoc(userRef, {
                email: cleanEmail,
                name: currentUser.displayName || '',
                role: currentRole,
                status: 'active',
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString()
              });
            }
          } else {
            // Document already exists for this UID
            const userData = userDoc.data();
            await updateDoc(userRef, { lastLogin: new Date().toISOString() });
            
            if (currentRole !== 'admin') {
               currentRole = (userData.role as Role) || 'pending';
            }
          }
        } catch(e: any) {
           if (e.code === 'permission-denied' && !auth.currentUser) {
             // Ignore permission denied if the user was just signed out
           } else {
             console.error("Error syncing user data", e.code, e.message, e);
           }
        }
        
        setRole(currentRole);
      } else {
        const saved = localStorage.getItem('plc_custom_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setUser({ uid: parsed.uid, email: parsed.email, displayName: parsed.displayName } as any);
            setRole((parsed.role as Role) || 'pending');
          } catch {
            setUser(null);
            setRole('guest');
          }
        } else {
          setUser(null);
          setRole('guest');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const registerWithEmail = async (name: string, email: string, password: string) => {
    try {
      let cleanEmail = email.trim().toLowerCase();
      if (cleanEmail && !cleanEmail.includes('@')) {
        cleanEmail += '@plc.edu.kh';
      }
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        email: cleanEmail,
        name: name,
        role: 'pending',
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (error: any) {
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string, expectedRole?: 'admin' | 'student') => {
    const inputRaw = email.trim();
    let cleanEmail = inputRaw.toLowerCase();
    if (cleanEmail && !cleanEmail.includes('@')) {
      cleanEmail += '@plc.edu.kh';
    } else if (cleanEmail && !cleanEmail.includes('.')) {
      cleanEmail += '.com';
    }

    let userDocData: any = null;
    let userDocId: string = '';

    try {
      const usersRef = collection(db, 'users');
      const q1 = query(usersRef, where('email', '==', cleanEmail));
      const s1 = await getDocs(q1);
      if (!s1.empty) {
        userDocId = s1.docs[0].id;
        userDocData = s1.docs[0].data();
      } else {
        const q2 = query(usersRef, where('email', '==', inputRaw.toLowerCase()));
        const s2 = await getDocs(q2);
        if (!s2.empty) {
          userDocId = s2.docs[0].id;
          userDocData = s2.docs[0].data();
        } else {
          const sAll = await getDocs(usersRef);
          const foundDoc = sAll.docs.find(d => {
            const data = d.data();
            const e = (data.email || '').toLowerCase();
            const u = (data.username || '').toLowerCase();
            const n = (data.name || '').toLowerCase();
            const target = inputRaw.toLowerCase();
            return e === target || e === cleanEmail || u === target || n === target;
          });
          if (foundDoc) {
            userDocId = foundDoc.id;
            userDocData = foundDoc.data();
          }
        }
      }
    } catch (e) {
      console.error("Error querying users collection during login:", e);
    }

    const isSuperAdminEmail = ['spcomputerinfo123@gmail.com', 'plccomputerinfo123@gmail.com'].includes(cleanEmail) || 
                              ['spcomputerinfo123@gmail.com', 'plccomputerinfo123@gmail.com'].includes(inputRaw.toLowerCase()) || 
                              inputRaw.toLowerCase() === 'admin' || inputRaw.toLowerCase() === 'admin@123';

    if (!userDocData && isSuperAdminEmail) {
      userDocData = {
        name: 'System Admin',
        email: cleanEmail.includes('@') ? cleanEmail : 'spcomputerinfo123@gmail.com',
        role: 'admin',
        status: 'active'
      };
      userDocId = 'admin-fallback-' + Date.now();
    }

    if (userDocData) {
      if (userDocData.status === 'suspended') {
        throw new Error('SUSPENDED');
      }

      // Check if Admin defined a password for this user
      if (userDocData.password !== undefined && userDocData.password !== null && userDocData.password !== '') {
        if (userDocData.password !== password) {
          throw new Error('INVALID_CREDENTIALS');
        }

        let assignedRole: Role = userDocData.role || 'pending';
        if (isSuperAdminEmail || ['spcomputerinfo123@gmail.com', 'plccomputerinfo123@gmail.com'].includes(userDocData.email)) {
          assignedRole = 'admin';
        }

        if (expectedRole === 'admin' && !['admin', 'management'].includes(assignedRole)) {
          throw new Error('NOT_ADMIN');
        }

        const cUser = {
          uid: userDocId || 'custom-' + Date.now(),
          email: userDocData.email || cleanEmail,
          displayName: userDocData.name || inputRaw,
          role: assignedRole
        };

        localStorage.setItem('plc_custom_user', JSON.stringify(cUser));
        setCustomUser(cUser);
        setUser({ uid: cUser.uid, email: cUser.email, displayName: cUser.displayName } as any);
        setRole(assignedRole);
        return;
      }
    }

    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const isAdmin = await checkIsAdmin(result.user);
      if (expectedRole === 'admin' && !isAdmin) {
        await signOut(auth);
        throw new Error('NOT_ADMIN');
      }
      localStorage.removeItem('plc_custom_user');
      setCustomUser(null);
      setUser(result.user);
      if (isAdmin) {
        setRole('admin');
      } else {
        try {
          const userDoc = await getDoc(doc(db, 'users', result.user.uid));
          if (userDoc.exists()) {
            setRole((userDoc.data().role as Role) || 'student');
          } else {
            setRole('student');
          }
        } catch {
          setRole('student');
        }
      }
      return;
    } catch (error: any) {
      throw error;
    }
  };

  const loginWithGoogle = async (expectedRole?: 'admin' | 'student') => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const isAdmin = await checkIsAdmin(result.user);
      
      // If they are trying to login as admin, verify they are admin
      if (expectedRole === 'admin' && !isAdmin) {
        await signOut(auth);
        throw new Error('NOT_ADMIN');
      }

      localStorage.removeItem('plc_custom_user');
      setCustomUser(null);
      setUser(result.user);
      if (isAdmin) {
        setRole('admin');
      } else {
        try {
          const userDoc = await getDoc(doc(db, 'users', result.user.uid));
          if (userDoc.exists()) {
            setRole((userDoc.data().role as Role) || 'student');
          } else {
            setRole('student');
          }
        } catch {
          setRole('student');
        }
      }
    } catch (error: any) {
      if (error?.code === 'auth/cancelled-popup-request' || error?.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (error?.code && error.code.startsWith('auth/')) {
        console.warn("Auth warning signing in with Google:", error.message);
      } else {
        console.error("Error signing in with Google", error);
      }
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      if (error?.code && error.code.startsWith('auth/')) {
        console.warn("Auth warning sending reset email:", error.message);
      } else {
        console.error("Error sending reset email", error);
      }
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('plc_custom_user');
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
    setUser(null);
    setRole('guest');
  };

  return { user, role, loading, loginWithGoogle, loginWithEmail, logout, resetPassword, registerWithEmail };
}

