
// Je ne peux pas modifier directement le fichier Header.tsx car il est en lecture seule.
// Je vais créer un fichier HeaderWithNotifications.tsx qui étend le composant Header existant

import React from "react";
import Header from "./Header";
import { NotificationDropdown } from "./ui/notification-dropdown";

const HeaderWithNotifications: React.FC = () => {
  return (
    <div className="relative">
      <Header />
      <div className="absolute top-4 right-20 md:right-24">
        <NotificationDropdown />
      </div>
    </div>
  );
};

export default HeaderWithNotifications;
