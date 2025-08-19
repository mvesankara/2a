import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link to="/" className="text-xl font-bold">
        Project
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/my-space">
              <Button variant="ghost">My Space</Button>
            </Link>
            <Button onClick={signOut}>Logout</Button>
          </>
        ) : (
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
