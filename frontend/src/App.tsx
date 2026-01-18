import "./App.css";
import { Header } from "@/components/layout/Header";
import { UrlInputForm } from "@/components/ui/UrlInputForm";
import { DownloadList } from "@/components/DownloadList";
import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";
import { useUrlProcessor } from "@/core/hooks/useUrlProcessor";

function App() {
  const theme = useThemeStore((state) => state.theme);
  const { title, formats, lastUrl, loading, thumbnailUrl, fetchInfo } = useUrlProcessor();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto">
        <UrlInputForm onSubmit={fetchInfo} loading={loading} />
        <DownloadList title={title} formats={formats} lastUrl={lastUrl} thumbnailUrl={thumbnailUrl} fetchingInfo={loading} />
      </div>
    </>
  );
}

export default App;
