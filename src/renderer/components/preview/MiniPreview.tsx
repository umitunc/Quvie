import React, { useEffect, useRef } from 'react'
import { useProjectStore } from '../../store'
import { Play, Pause, Square, UploadCloud, Film, Music, Image as ImageIcon, Sliders } from 'lucide-react'

export const MiniPreview: React.FC = () => {
  const {
    visualItems,
    audioItems,
    currentTime,
    isPlaying,
    selectedItemId,
    selectedItemType,
    addVisualItem,
    addAudioItem,
    updateAudioItem,
    setCurrentTime,
    setIsPlaying,
    resetProject
  } = useProjectStore()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Calculate total visual duration
  const totalDuration = visualItems.reduce((acc, item) => acc + item.duration, 0)

  // Simulated playback
  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now() - currentTime * 1000
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000
        if (elapsed >= totalDuration && totalDuration > 0) {
          setCurrentTime(0)
          setIsPlaying(false)
        } else {
          setCurrentTime(elapsed)
        }
      }, 30)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, totalDuration])

  // Drag over dropzone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Handle Drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    for (const file of files) {
      const path = (file as any).path
      if (!path) continue
      const name = file.name
      const ext = name.split('.').pop()?.toLowerCase() || ''

      if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) {
        // Retrieve video duration using electron API if available, else default to 10s
        let dur = 10
        try {
          // We can query the main process for file metadata
          const meta = await (window as any).electronAPI.probeFile(path)
          if (meta && meta.duration) dur = Number(meta.duration)
        } catch (e) {
          console.warn("Could not probe file, using default 10s duration", e)
        }
        addVisualItem({
          name,
          path,
          type: 'video',
          duration: dur
        })
      } else if (['png', 'jpg', 'jpeg'].includes(ext)) {
        addVisualItem({
          name,
          path,
          type: 'image',
          duration: 5.0 // Default 5 seconds for images
        })
      } else if (['mp3', 'wav', 'm4a', 'ogg'].includes(ext)) {
        addAudioItem({
          name,
          path,
          startTime: currentTime,
          duration: 15.0, // Default duration, or probe
          volume: 1.0
        })
      }
    }
  }

  // File browser picker
  const handleSelectFiles = async (type: 'visual' | 'audio') => {
    try {
      const filePaths: string[] = await (window as any).electronAPI.selectFiles(type === 'visual' ? 'all' : 'audio')
      for (const filePath of filePaths) {
        const name = filePath.split(/[\\/]/).pop() || 'Dosya'
        const ext = name.split('.').pop()?.toLowerCase() || ''
        
        if (['mp3', 'wav', 'm4a', 'ogg'].includes(ext)) {
          addAudioItem({
            name,
            path: filePath,
            startTime: currentTime,
            duration: 15.0,
            volume: 1.0
          })
        } else if (['png', 'jpg', 'jpeg'].includes(ext)) {
          addVisualItem({
            name,
            path: filePath,
            type: 'image',
            duration: 5.0
          })
        } else {
          addVisualItem({
            name,
            path: filePath,
            type: 'video',
            duration: 10.0
          })
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Find selected item
  const selectedVisual = selectedItemType === 'visual' ? visualItems.find(v => v.id === selectedItemId) : null
  const selectedAudio = selectedItemType === 'audio' ? audioItems.find(a => a.id === selectedItemId) : null

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Visual Player & Dropzone Container */}
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex-1 min-h-[220px] rounded-2xl border border-white/10 bg-[#0d0d14]/40 backdrop-blur-xl flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all hover:border-white/20 group"
      >
        {visualItems.length > 0 ? (
          <div className="w-full h-full flex flex-col justify-between">
            {/* Mock Player Screen */}
            <div className="flex-1 w-full bg-black/40 rounded-xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group/player">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-between p-3 pointer-events-none">
                <span className="text-[10px] text-gray-400 font-mono">PREVIEW SCREEN</span>
                <span className="text-[11px] text-white truncate max-w-full">
                  {isPlaying ? 'Oynatılıyor...' : 'Duraklatıldı'}
                </span>
              </div>
              
              {/* Playback Preview Mock Content */}
              <div className="flex flex-col items-center gap-2 z-0">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover/player:scale-110 transition-transform duration-300">
                  {isPlaying ? (
                    <div className="w-6 h-6 bg-orange-500 rounded animate-pulse" />
                  ) : (
                    <Play size={28} className="text-orange-400 ml-1" />
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-300">
                  {visualItems.length} Görsel Materyal • {totalDuration.toFixed(1)}s Toplam Süre
                </span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex justify-between items-center mt-3 px-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)]"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false)
                    setCurrentTime(0)
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition"
                >
                  <Square size={14} />
                </button>
              </div>

              <button
                onClick={resetProject}
                className="text-xs text-gray-400 hover:text-red-400 font-medium transition"
              >
                Temizle
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center cursor-pointer" onClick={() => handleSelectFiles('visual')}>
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
              <UploadCloud size={32} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Medya Dosyalarını Sürükleyin</h3>
              <p className="text-xs text-gray-400 max-w-[240px]">
                Video (.mp4, .mov), resim (.png, .jpg) veya ses (.mp3, .wav) dosyalarını sürükleyin veya tıklayıp seçin.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Block properties / Modulation Panel */}
      <div className="h-[140px] rounded-2xl border border-white/10 bg-[#0d0d14]/40 backdrop-blur-xl p-4 flex flex-col justify-between">
        {selectedAudio ? (
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-blue-400">
                <Music size={14} />
                <span className="text-xs font-bold truncate max-w-[160px]">{selectedAudio.name}</span>
              </div>
              <span className="text-[10px] text-gray-400 uppercase font-mono">Ses Özellikleri</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 my-2">
              {/* Volume Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Ses Seviyesi</span>
                  <span className="text-blue-400 font-mono">{Math.round(selectedAudio.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selectedAudio.volume}
                  onChange={(e) => updateAudioItem(selectedAudio.id, { volume: Number(e.target.value) })}
                  className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Start Time control */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Başlangıç Zamanı</span>
                  <span className="text-blue-400 font-mono">{selectedAudio.startTime.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(10, totalDuration)}
                  step="0.5"
                  value={selectedAudio.startTime}
                  onChange={(e) => updateAudioItem(selectedAudio.id, { startTime: Number(e.target.value) })}
                  className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        ) : selectedVisual ? (
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-orange-400">
                {selectedVisual.type === 'video' ? <Film size={14} /> : <ImageIcon size={14} />}
                <span className="text-xs font-bold truncate max-w-[160px]">{selectedVisual.name}</span>
              </div>
              <span className="text-[10px] text-gray-400 uppercase font-mono">Görsel Özellikleri</span>
            </div>
            <div className="text-xs text-gray-400 py-3">
              Dosya Türü: <span className="text-white capitalize">{selectedVisual.type}</span><br />
              Süre: <span className="text-white font-mono">{selectedVisual.duration.toFixed(1)} saniye</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
            <Sliders size={20} className="mb-2 text-gray-600" />
            <span className="text-xs font-medium">Özelliklerini ayarlamak için timeline'dan bir öğe seçin</span>
          </div>
        )}
      </div>
    </div>
  )
}
