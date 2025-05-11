
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path: string;
  active?: boolean;
}

export const CommunityBreadcrumb = () => {
  const location = useLocation();
  const path = location.pathname;
  
  let breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Communauté", path: "/community" }
  ];
  
  // Add member detail breadcrumb if we're on that page
  if (path.includes("/community/members/")) {
    const memberId = path.split("/").pop();
    breadcrumbs.push({ 
      label: "Détails du membre", 
      path: `/community/members/${memberId}`,
      active: true 
    });
  }
  
  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-6">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center">
          {index > 0 && <ChevronRight className="mx-2 h-4 w-4" />}
          
          {crumb.active ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link 
              to={crumb.path}
              className="hover:text-primary transition-colors"
            >
              {index === 0 ? (
                <span className="flex items-center">
                  <Home className="h-3 w-3 mr-1" /> {crumb.label}
                </span>
              ) : (
                crumb.label
              )}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};
