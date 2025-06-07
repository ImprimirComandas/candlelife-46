
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ChatPage from './pages/ChatPage';
import ChatConversationPage from "./pages/ChatConversationPage";
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster";
import { MessagesProvider } from './context/MessagesContext';
import { RealtimeProvider } from './context/RealtimeContext';
import AppLayout from './components/layout/AppLayout';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MessagesProvider>
            <RealtimeProvider>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  } />
                </Routes>
                <Toaster />
              </div>
            </RealtimeProvider>
          </MessagesProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
