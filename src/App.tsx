
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
import { Toaster } from "@/components/ui/toaster";
import PrivateRoute from "@/components/PrivateRoute";
import { AuthProvider } from "@/hooks/useAuth";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route 
            path="/dashboard" 
            element={<PrivateRoute element={<Dashboard />} />} 
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
  );
}

export default App;
