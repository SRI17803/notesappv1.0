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
import "./App.css"; // Create this CSS file

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
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

  const handleAuth = async (authFunction) => {
    setAuthError("");
    try {
      await authFunction(auth, email, password);
    } catch (error) {
      setAuthError(error.message);
    }
  };

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
      setAuthError("Failed to add note: " + error.message);
    }
  };

  return (
    <div className="app">
      {!user ? (
        <div className="auth-wrapper">
          <div className="auth-card">
            <h2 className="auth-title">Notes App</h2>
            <div className="auth-form">
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
              {authError && <div className="error-message">{authError}</div>}
              <div className="auth-actions">
                <button 
                  className="auth-button primary" 
                  onClick={() => handleAuth(signInWithEmailAndPassword)}
                >
                  Login
                </button>
                <button 
                  className="auth-button secondary" 
                  onClick={() => handleAuth(createUserWithEmailAndPassword)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="notes-app">
          <header className="app-header">
            <div className="user-info">
              <span className="welcome">Welcome,</span>
              <span className="user-email">{user.email}</span>
            </div>
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </header>

          <main className="notes-container">
            <div className="note-editor">
              <h3 className="section-title">New Note</h3>
              <div className="input-group">
                <input
                  className="note-input"
                  placeholder="What's on your mind?" 
                  value={note} 
                  onChange={e => setNote(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNote()}
                />
                <button className="add-button" onClick={addNote}>
                  Add Note
                </button>
              </div>
            </div>

            <div className="notes-list">
              <h3 className="section-title">Your Notes</h3>
              {notes.length > 0 ? (
                <ul>
                  {notes.map(n => (
                    <li key={n.id} className="note-item">
                      <p className="note-text">{n.text}</p>
                      <div className="note-meta">
                        <span className="note-date">
                          {n.createdAt?.toDate().toLocaleString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <p>No notes yet. Add your first note!</p>
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;