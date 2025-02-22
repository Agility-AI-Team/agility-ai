import { LucideIcon } from "lucide-react";

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  color: string; 
  children: React.ReactNode;
}

export default function AppButton({color, onClick, disabled = false, icon: Icon, children}: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`bg-accent text-white px-8 py-3 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 hover:bg-secondary transition-colors duration-200`}
      disabled={disabled} 
    >
      {Icon && <Icon size={24} />}
      {children}
    </button>
    
  );
}