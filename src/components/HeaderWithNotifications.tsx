
import React from "react";
import Header from "./Header";
import { NotificationCenter } from "./notifications/NotificationCenter";

const HeaderWithNotifications: React.FC = () => {
  return (
    <div className="relative">
      <Header />
      <div className="absolute top-4 right-20 md:right-24">
        <NotificationCenter />
      </div>
    </div>
  );
};

export default HeaderWithNotifications;
