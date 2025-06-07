import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster"
import { QueryClient } from '@tanstack/react-query';
import ChatPage from './pages/ChatPage';
import { MessagesProvider } from './context/MessagesContext';
import { RealtimeProvider } from './context/RealtimeContext';
import ChatConversationPage from "@/pages/ChatConversationPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <MessagesProvider>
          <RealtimeProvider>
            <QueryClient>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                  <Route path="/chat/:userId" element={<ProtectedRoute><ChatConversationPage /></ProtectedRoute>} />
                </Routes>
                <Toaster />
              </div>
            </QueryClient>
          </RealtimeProvider>
        </MessagesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
