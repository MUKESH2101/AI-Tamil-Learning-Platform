import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { Toaster } from 'react-hot-toast';

import Header from './components/Header';
import Navigation from './components/Navigation';


import Home from './pages/Home';
import LoginForm from './components/auth/LoginForm';
import { useUser } from './contexts/UserContext';
import Chat from './pages/Chat';
import Lessons from './pages/Lessons';
import Speech from './pages/Speech';
import Audio from './pages/Audio';
import Daily from './pages/Task';
import Profile from './pages/Profile';
import Games from './pages/Games';




function AppContent() {
  const { user } = useUser();
  if (!user) {
    return <LoginForm />;
  }
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/speech" element={<Speech />} />
          <Route path="/audio" element={<Audio />} />
          <Route path="/games" element={<Games />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </Router>
    </UserProvider>
  );
}

export default App;