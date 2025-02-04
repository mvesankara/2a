import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import ProfileCompletion from "@/pages/ProfileCompletion";
import { Toaster } from "@/components/ui/toaster";
import PrivateRoute from "@/components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={<PrivateRoute element={<Dashboard />} />} 
        />
        <Route 
          path="/profile-completion" 
          element={<PrivateRoute element={<ProfileCompletion />} />} 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;