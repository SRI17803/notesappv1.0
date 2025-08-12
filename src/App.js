import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import './index.css';

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
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(error.message);
    }
  };

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Add note to Firestore
  const addNote = async () => {
    if (!note.trim()) return;
    try {
      await addDoc(collection(db, "notes"), {
        text: note,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      setNote("");
    } catch (error) {
      alert("Failed to add note: " + error.message);
    }
  };

  return (
    <div className="app-container">
      {!user ? (
        <div className="auth-container">
          <h2 className="auth-title">Login / Signup</h2>
          <div className="input-group">
            <input
              className="auth-input"
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
            <input
              className="auth-input"
              placeholder="Password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <div className="button-group">
            <button className="auth-button signup" onClick={signup}>Sign Up</button>
            <button className="auth-button login" onClick={login}>Login</button>
          </div>
        </div>
      ) : (
        <div className="notes-container">
          <div className="header">
            <h2 className="welcome-message">Welcome, {user.email}</h2>
            <button className="logout-button" onClick={logout}>Logout</button>
          </div>
          
          <div className="note-form">
            <h3>Add Note</h3>
            <div className="input-group">
              <input
                className="note-input"
                placeholder="Write a note..." 
                value={note} 
                onChange={e => setNote(e.target.value)} 
              />
              <button className="add-button" onClick={addNote}>Add</button>
            </div>
          </div>
          
          <div className="notes-list">
            <h3>Your Notes</h3>
            {notes.length > 0 ? (
              <ul>
                {notes.map(n => (
                  <li key={n.id} className="note-item">
                    <p>{n.text}</p>
                    <small>{new Date(n.createdAt?.toDate()).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-notes">No notes yet. Add your first note!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

