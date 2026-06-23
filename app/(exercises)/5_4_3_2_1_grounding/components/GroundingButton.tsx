import { ReactNode } from "react";

interface GroundingButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary";
}

const GroundingButton = ({ onClick, children, variant = "primary" }: GroundingButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-8 py-3 rounded-full font-body text-sm tracking-wide transition-all duration-300
        ${variant === "primary"
          ? "bg-primary text-primary-foreground hover:opacity-90 "
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }
      `}
    >
      {children}
    </button>
  );
};

export default GroundingButton;
