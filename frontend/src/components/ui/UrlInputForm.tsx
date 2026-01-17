import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { SearchButton } from "@/components/ui/SearchButton";

interface Props {
  onSubmit: (url: string) => void;
  loading?: boolean;
}

export function UrlInputForm({ onSubmit, loading = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputRef.current) onSubmit(inputRef.current.value.trim());
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-2xl border p-2 my-2 shadow-sm">
      <Input
        ref={inputRef}
        placeholder="URL..."
        className="flex-1 resize-none border-none shadow-none focus-visible:ring-0"
        onKeyDown={handleKeyDown}
      />
      <SearchButton
        loading={loading}
        onClick={() =>
          inputRef.current && onSubmit(inputRef.current.value.trim())
        }
        className="w-auto"
      />
    </div>
  );
}
