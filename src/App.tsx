import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

import Header from './components/Header';
import Navigation from './components/Navigation';


import Home from './pages/Home';
import LoginForm from './components/auth/LoginForm';
import ResetPassword from './components/auth/ResetPassword';
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
  const location = useLocation();

  if (location.pathname === '/reset-password') {
    return (
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    );
  }

  if (!user) {
    return <LoginForm />;
  }
  return (
    <div className="flex flex-col min-h-screen bg-cream-200 dark:bg-ink-800">
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
    <ThemeProvider>
      <UserProvider>
        <Router>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#161B33',
                color: '#FDF8F0',
                borderRadius: '12px',
                border: '1px solid rgba(246, 169, 60, 0.25)',
              },
              success: { iconTheme: { primary: '#1C9C88', secondary: '#FDF8F0' } },
              error: { iconTheme: { primary: '#E1512E', secondary: '#FDF8F0' } },
            }}
          />
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
