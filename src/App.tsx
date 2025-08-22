 import MySpace from "@/pages/my-space";
 import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
 import Index from "@/pages/Index";
 import Login from "@/pages/Login";
 import NotFound from "@/pages/NotFound";
 import ResetPassword from "@/pages/ResetPassword";
 import VerifyEmail from "@/pages/VerifyEmail";
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
             <Route path="/verify-email" element={<VerifyEmail />} />
             <Route
               path="/my-space"
               element={<PrivateRoute element={<MySpace />} />}
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
