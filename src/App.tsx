
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ChatPage from './pages/ChatPage';
import ChatConversationPage from "./pages/ChatConversationPage";
import About from './pages/About';
import Contact from './pages/Contact';
import Support from './pages/Support';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster";
import { MessagesProvider } from './context/MessagesContext';
import { RealtimeProvider } from './context/RealtimeContext';

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
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                  <Route path="/chat/:userId" element={<ProtectedRoute><ChatConversationPage /></ProtectedRoute>} />
                  
                  {/* Footer pages */}
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
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
