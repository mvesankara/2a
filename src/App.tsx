
import MySpace from "@/pages/my-space";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import ProfileCompletion from "@/pages/ProfileCompletion";
import ResetPassword from "@/pages/ResetPassword";
import Payment from "@/pages/Payment";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCanceled from "@/pages/PaymentCanceled";
import UserProfile from "@/pages/UserProfile";
import News from "@/pages/News";
import { Toaster } from "@/components/ui/toaster";
import PrivateRoute from "@/components/PrivateRoute";
import { AuthProvider } from "@/hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Création d'un nouveau client de requête pour React Query
 * Configuration des options par défaut pour les requêtes
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Composant principal de l'application
 * Définit toutes les routes et les fournisseurs globaux
 * @returns Le composant App
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/news" element={<News />} />
            {/* Route for future individual article pages */}
            <Route path="/news/:id" element={<News />} />
            <Route 
              path="/dashboard" 
              element={<PrivateRoute element={<Dashboard />} />} 
            />
            <Route 
              path="/my-space" 
              element={<PrivateRoute element={<MySpace />} />} 
            />
            <Route 
              path="/profile" 
              element={<PrivateRoute element={<UserProfile />} />} 
            />
            <Route 
              path="/profile-completion" 
              element={<PrivateRoute element={<ProfileCompletion />} />} 
            />
            <Route 
              path="/payment" 
              element={<PrivateRoute element={<Payment />} />} 
            />
            <Route 
              path="/payment-success" 
              element={<PrivateRoute element={<PaymentSuccess />} />} 
            />
            <Route 
              path="/payment-canceled" 
              element={<PrivateRoute element={<PaymentCanceled />} />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
