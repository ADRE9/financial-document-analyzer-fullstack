import { useGreeting } from "../../hooks/useGreeting";

interface WelcomeSectionProps {
  userName?: string;
  description: string;
}

export const WelcomeSection = ({
  userName,
  description,
}: WelcomeSectionProps) => {
  const greeting = useGreeting();

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {greeting}, {userName}!
      </h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};
