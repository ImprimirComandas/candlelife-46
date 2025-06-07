
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
import Transactions from './pages/Transactions';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import Clients from './pages/Clients';
import Social from './pages/Social';
import Settings from './pages/Settings';
import InvoicedTransactions from './pages/InvoicedTransactions';
import AppLayout from './components/layout/AppLayout';
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
                  
                  {/* Protected routes with AppLayout */}
                  <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="expenses" element={<Expenses />} />
                    <Route path="goals" element={<Goals />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="social" element={<Social />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="invoiced" element={<InvoicedTransactions />} />
                    <Route path="chat" element={<ChatPage />} />
                    <Route path="chat/:userId" element={<ChatConversationPage />} />
                  </Route>
                  
                  {/* Footer pages (standalone) */}
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
