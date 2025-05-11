
import { useEffect, useState } from "react";
import { CommunityLayout } from "@/components/community/CommunityLayout";
import { EventsSection } from "@/components/community/EventsSection";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

/**
 * Page des événements communautaires
 */
const Events = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Vérifier l'authentification
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  return (
    <CommunityLayout loading={loading} showEventsMetrics={true}>
      <EventsSection />
    </CommunityLayout>
  );
};

export default Events;
