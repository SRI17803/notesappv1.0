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

// Add this CSS to your project (create a separate CSS file or use styled-components)
const styles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .app-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
    background-color: #f5f5f5;
  }

  .auth-container {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    margin: 2rem auto;
  }

  .auth-title {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .auth-input, .note-input {
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    transition: border 0.3s;
  }

  .auth-input:focus, .note-input:focus {
    outline: none;
    border-color: #4a90e2;
  }

  .button-group {
    display: flex;
    gap: 1rem;
  }

  .auth-button {
    flex: 1;
    padding: 0.8rem;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .signup {
    background-color: #4a90e2;
    color: white;
  }

  .login {
    background-color: #50c878;
    color: white;
  }

  .auth-button:hover {
    opacity: 0.9;
  }

  .notes-container {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .welcome-message {
    color: #333;
  }

  .logout-button {
    padding: 0.5rem 1rem;
    background-color: #ff6b6b;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .logout-button:hover {
    background-color: #ff5252;
  }

  .note-form {
    margin-bottom: 2rem;
  }

  .note-form h3 {
    margin-bottom: 1rem;
    color: #333;
  }

  .add-button {
    padding: 0.8rem 1.5rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .add-button:hover {
    background-color: #357abd;
  }

  .notes-list h3 {
    margin-bottom: 1rem;
    color: #333;
  }

  .note-item {
    background: #f9f9f9;
    padding: 1rem;
    margin-bottom: 0.5rem;
    border-radius: 5px;
    border-left: 4px solid #4a90e2;
  }

  .note-item p {
    margin-bottom: 0.5rem;
  }

  .note-item small {
    color: #777;
    font-size: 0.8rem;
  }

  .empty-notes {
    color: #777;
    text-align: center;
    padding: 1rem;
  }
`;

// Inject styles (alternative: use a CSS file)
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);