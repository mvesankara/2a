import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MySpace = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">My Space</h1>
        <p className="mb-4">Welcome, {user.email}!</p>
        <p>This is your personal space. More features will be added soon.</p>
      </main>
      <Footer />
    </div>
  );
};

export default MySpace;
