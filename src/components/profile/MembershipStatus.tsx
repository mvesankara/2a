
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * Composant affichant le statut d'adhésion de l'utilisateur
 * et offrant la possibilité de devenir adhérent
 * @returns Le composant MembershipStatus
 */
export const MembershipStatus = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-muted-foreground">
          Adhésion non active
        </p>
      </div>
      <Button
        variant="outline"
        onClick={() => navigate("/payment")}
      >
        Devenir adhérent(e)
      </Button>
    </div>
  );
};
