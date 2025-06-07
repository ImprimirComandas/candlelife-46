
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { MessagesProvider } from "@/context/MessagesContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { RealtimeProvider } from "@/context/RealtimeContext";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Expenses from "@/pages/Expenses";
import Goals from "@/pages/Goals";
import Settings from "@/pages/Settings";
import Social from "@/pages/Social";
import ChatPage from "@/pages/ChatPage";
import ChatConversation from "@/pages/ChatConversation";
import Clients from "@/pages/Clients";
import InvoicedTransactions from "@/pages/InvoicedTransactions";
import ChangePassword from "@/pages/ChangePassword";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RealtimeProvider>
            <MessagesProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  
                  {/* Protected Routes with AppLayout */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Dashboard />} />
                  </Route>
                  
                  <Route path="/transactions" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Transactions />} />
                  </Route>
                  
                  <Route path="/expenses" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Expenses />} />
                  </Route>
                  
                  <Route path="/goals" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Goals />} />
                  </Route>
                  
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Settings />} />
                  </Route>
                  
                  <Route path="/social" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Social />} />
                  </Route>
                  
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<ChatPage />} />
                    <Route path=":userId" element={<ChatConversation />} />
                  </Route>
                  
                  <Route path="/clients" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Clients />} />
                  </Route>
                  
                  <Route path="/invoiced" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<InvoicedTransactions />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
              <Toaster />
            </MessagesProvider>
          </RealtimeProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
