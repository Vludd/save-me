import packageJson from "../../../package.json";
import { Save } from "lucide-react";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { useThemeStore } from "@/store/themeStore";

export const Header = () => {
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <header className="flex max-w-3xl mx-auto items-center justify-between px-4 pb-3 border-b">
      <h1 className="flex items-center gap-2 text-lg font-semibold">
        <Save className="w-5 h-5" />
        <span>save.me v{packageJson.version}</span>
      </h1>
      <ModeToggle onClick={toggleTheme} />
    </header>
  );
};
