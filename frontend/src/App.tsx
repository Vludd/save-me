import { DownloadIcon, Search } from 'lucide-react'
import './App.css'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Header } from './components/layout/Header'
import { useRef, useState } from 'react'
import { downloadFile, processUrl } from './api/urlProcessor'
import { Spinner } from "@/components/ui/spinner"
import type { FormatItemModel } from "./core/models"
import { DownloadList } from './components/DownloadList'

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState<string>("");
  const [formats, setFormats] = useState<FormatItemModel[]>([]);
  const [fetchingInfo, setFetchingInfo] = useState<boolean>(false);
  const [downloadingIds, setDownloadingIds] = useState<string[]>([]);
  const [lastUrl, setLastUrl] = useState<string>("");

  const handleInput = () => {
    const textarea = inputRef.current;
    if (!textarea) return;

    setText(textarea.value);
  };

  const handleFetchInfo = async () => {
    if (fetchingInfo || downloadingIds.length > 0) return;

    const trimmed = text.trim();
    if (!trimmed) return;
    setLastUrl(trimmed);
    
    setFetchingInfo(true);

    try {
      const res = await processUrl(trimmed);
      setFormats(Array.isArray(res.formats) ? (res.formats.reverse() as FormatItemModel[]) : []);
    } catch (err) {
      console.error("Fetching info error:", err);
    } finally {
      // setText("");
      setFetchingInfo(false);
      // if (inputRef.current) inputRef.current.value = "";

    }
  };

  return (
    <>
      <Header></Header>
      <div className='max-w-3xl mx-auto'>
        <div className="flex items-end gap-2 rounded-2xl border p-2 my-2 shadow-sm">
          <Input
            ref={inputRef}
            placeholder="URL..."
            className="flex-1 resize-none border-none shadow-none min-h-[10px] max-h-[200px] !bg-transparent p-2 focus-visible:ring-0"
            onInput={handleInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleFetchInfo();
              }
            }}
          />

          <Button 
            variant="default" 
            onClick={handleFetchInfo}
            size="icon"
            className={`w-auto p-3 ${!fetchingInfo ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
            disabled={fetchingInfo}
          >
            {fetchingInfo ? <Spinner /> : <Search />}<span>{!fetchingInfo ? "Find" : "Processing..."}</span>
          </Button>
        </div>
        <DownloadList formats={formats} lastUrl={lastUrl} fetchingInfo={fetchingInfo}/>
      </div>
    </>
  )
}

export default App
