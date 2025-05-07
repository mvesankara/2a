
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  navigateTo?: string;
  onClick?: () => void;
}

const DashboardCard = ({
  title,
  description,
  icon,
  buttonText,
  navigateTo,
  onClick
}: DashboardCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-primary/10 p-3 rounded-full">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={handleClick}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default DashboardCard;
