import React from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
      <p className="text-primary/80">{description}</p>
    </div>
  );
};

export default FeatureCard;