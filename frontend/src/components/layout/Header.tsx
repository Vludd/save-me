// import { ModeToggle } from "@/components/mode-toggle";

import { Save } from "lucide-react";

export const Header = () => (
  <header className="flex items-center justify-between px-4 py-2 border-b">
    <h1 className="text-lg flex items-end gap-1 font-semibold">
      <Save/>
      <span>save.me</span>
    </h1>
    {/* <ModeToggle /> */}
  </header>
);