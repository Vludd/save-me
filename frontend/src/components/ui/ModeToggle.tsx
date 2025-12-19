import { Sun, Moon } from "lucide-react";
import * as React from "react";

interface Props {
  onClick?: () => void;
}

export const ModeToggle: React.FC<Props> = ({ onClick }) => {
  const [dark, setDark] = React.useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const handleClick = () => {
    document.documentElement.classList.toggle("dark", !dark);
    setDark(!dark);
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-md border hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-900 transition"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};
