
interface AuthHeaderProps {
  title: string;
  description: string;
}

const AuthHeader = ({ title, description }: AuthHeaderProps) => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-primary">{title}</h2>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
};

export default AuthHeader;
