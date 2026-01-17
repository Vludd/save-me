import * as React from "react";
import { Search } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface SearchButtonProps {
  loading?: boolean;
  onClick: () => void;
  className?: string;
}

export const SearchButton: React.FC<SearchButtonProps> = ({
  loading = false,
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border bg-white dark:bg-neutral-950 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors duration-200 ${
        loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${className ?? ""}`}
    >
      {loading ? (
        <Spinner className="w-4 h-4" />
      ) : (
        <Search className="w-4 h-4" />
      )}
      <span>{loading ? "Processing..." : "Find"}</span>
    </button>
  );
};
