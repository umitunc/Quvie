import React, { useEffect } from 'react'
import { MediaTimeline } from './components/timeline/MediaTimeline'
import { MiniPreview } from './components/preview/MiniPreview'
import { useProjectStore } from './store'
import { Sparkles, Download, Film } from 'lucide-react'

const App: React.FC = () => {
  const {
    visualItems,
    audioItems,
    isExporting,
    exportProgress,
    setExportState
  } = useProjectStore()

  useEffect(() => {
    // Listen to export progress from main process
    const unsubscribe = (window as any).electronAPI.onExportProgress((progress: number) => {
      setExportState(true, progress)
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const handleExport = async () => {
    if (visualItems.length === 0) {
      alert("Lütfen önce en az bir video veya resim ekleyin!")
      return
    }
    setExportState(true, 0)
    try {
      const result = await (window as any).electronAPI.exportProject({
        visualItems,
        audioItems
      })
      if (result.success) {
        alert(`Video başarıyla kaydedildi:\n${result.outputPath}`)
      } else {
        alert(`Hata oluştu:\n${result.error}`)
      }
    } catch (err: any) {
      alert(`Beklenmeyen hata: ${err.message}`)
    } finally {
      setExportState(false, 0)
    }
  }

  return (
    <div className="app-container flex flex-col h-screen text-white overflow-hidden p-6 select-none relative bg-[#09090e]">
      
      {/* Background ambient glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none"></div>

      {/* Premium Header */}
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-white/5 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <Sparkles size={18} className="text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-orange-100 to-orange-400 m-0 leading-none">
              QUVIE
            </h1>
            <span className="text-[9px] text-orange-400 font-mono tracking-widest font-bold">SMART VIDEO ENGINE</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              isExporting
                ? 'bg-orange-500/20 text-orange-400 cursor-not-allowed border border-orange-500/20'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/10 hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Download size={14} className={isExporting ? 'animate-spin' : ''} />
            <span>{isExporting ? 'Aktarılıyor...' : 'Videoyu Aktar'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 grid grid-cols-[380px_1fr] gap-6 overflow-hidden z-10 mb-2">
        {/* Left Column: Preview, Dropzone, Selected item properties */}
        <div className="overflow-hidden">
          <MiniPreview />
        </div>

        {/* Right Column: Timeline area */}
        <div className="flex flex-col overflow-hidden gap-4">
          {/* Quick Info card */}
          <div className="rounded-2xl border border-white/5 bg-[#14141f]/30 p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                <Film size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">CitruSS UI Glassque Engine</p>
                <p className="text-[10px] text-gray-400">Görselleri sürükleyip sıralayın, arkasına müzik ekleyip anında export edin.</p>
              </div>
            </div>
            <div className="text-[10px] bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-gray-400 font-mono">
              FFmpeg Mode: <span className="text-emerald-400">Active</span>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <MediaTimeline />
          </div>
        </div>
      </main>

      {/* Export progress modal/overlay */}
      {isExporting && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-[#141420]/90 border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-5">
            {/* Glowing progress outer circle */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-white/5 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-orange-500 fill-none transition-all duration-300"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * exportProgress) / 100}
                />
              </svg>
              <span className="absolute text-lg font-black text-white font-mono">{exportProgress}%</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Video Oluşturuluyor</h3>
              <p className="text-xs text-gray-400">Görsel ve ses dosyaları FFmpeg motoru ile birleştiriliyor. Lütfen bekleyin...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
