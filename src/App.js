import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  collection, addDoc, query, where, onSnapshot, serverTimestamp 
} from "firebase/firestore";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);

  // Track login state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load notes for this user
        const q = query(
          collection(db, "notes"), 
          where("userId", "==", currentUser.uid)
        );
        onSnapshot(q, (snapshot) => {
          const list = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setNotes(list);
        });
      } else {
        setNotes([]);
      }
    });
    return () => unsub();
  }, []);

  // Auth functions
  const signup = async () => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Add note to Firestore
  const addNote = async () => {
    if (!note) return;
    await addDoc(collection(db, "notes"), {
      text: note,
      userId: user.uid,
      createdAt: serverTimestamp()
    });
    setNote("");
  };

  return (
    <div style={{ padding: 20 }}>
      {!user ? (
        <div>
          <h2>Login / Signup</h2>
          <input 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          /><br/>
          <input 
            placeholder="Password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          /><br/>
          <button onClick={signup}>Sign Up</button>
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Welcome {user.email}</h2>
          <button onClick={logout}>Logout</button>
          <hr/>
          <h3>Add Note</h3>
          <input 
            placeholder="Write a note..." 
            value={note} 
            onChange={e => setNote(e.target.value)} 
          />
          <button onClick={addNote}>Add</button>
          <h3>Your Notes</h3>
          <ul>
            {notes.map(n => (
              <li key={n.id}>{n.text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
