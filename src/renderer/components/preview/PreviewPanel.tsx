import React, { useState, useEffect, useRef } from 'react'
import { useProjectStore } from '../../store'
import { GlassButton } from '../common/GlassButton'
import { Play, Pause, Download, CheckCircle2, Loader2 } from 'lucide-react'

export const PreviewPanel: React.FC = () => {
  const { 
    videoPath, 
    videoDuration, 
    audioBlocks,
    isPlaying, 
    currentTime, 
    setIsPlaying, 
    setCurrentTime 
  } = useProjectStore()

  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportPath, setExportPath] = useState('')
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // Simulation/Playback loop
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now()
      const updateLoop = () => {
        const now = performance.now()
        const delta = (now - lastTimeRef.current) / 1000
        lastTimeRef.current = now

        setCurrentTime(Math.min(videoDuration || 120, currentTime + delta))

        if (currentTime >= (videoDuration || 120)) {
          setIsPlaying(false)
          setCurrentTime(0)
        } else {
          animationRef.current = requestAnimationFrame(updateLoop)
        }
      }
      animationRef.current = requestAnimationFrame(updateLoop)
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying, currentTime, videoDuration])

  // Listen to export progress
  useEffect(() => {
    const unsubscribe = window.electronAPI.onExportProgress((val: number) => {
      setProgress(val)
    })
    return () => unsubscribe()
  }, [])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleExport = async () => {
    if (!videoPath) {
      alert('Lütfen önce bir ana video yükleyin!')
      return
    }
    setExporting(true)
    setProgress(0)
    setExportSuccess(false)

    try {
      const result = await window.electronAPI.exportProject({
        videoPath,
        audioBlocks
      })

      if (result.success && result.outputPath) {
        setExportSuccess(true)
        setExportPath(result.outputPath)
      } else {
        alert('Export hatası: ' + result.error)
      }
    } catch (err: any) {
      alert('Hata: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="preview-panel flex flex-col h-full justify-between gap-4">
      <div className="panel-header">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Önizleme & Çıktı Al
        </h3>
      </div>

      {/* Simulated High-Fidelity Video/Audio Waveform Preview Canvas */}
      <div className="flex-1 min-h-[160px] bg-black/40 border border-white/5 rounded-lg overflow-hidden flex flex-col items-center justify-center relative group">
        {videoPath ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 relative">
            {/* Visualizer bars acting as dynamic waveform simulation */}
            <div className="flex items-center gap-1.5 h-16 w-3/4 justify-center">
              {Array.from({ length: 24 }).map((_, i) => {
                const height = isPlaying 
                  ? Math.sin(currentTime * 5 + i) * 24 + 32 
                  : Math.sin(i) * 12 + 20
                return (
                  <div 
                    key={i}
                    className="w-1 rounded-full bg-gradient-to-t from-orange-600 via-orange-400 to-amber-300 transition-all duration-75"
                    style={{ height: `${Math.max(4, height)}px` }}
                  />
                )
              })}
            </div>
            <span className="text-[11px] text-gray-400 absolute bottom-2 left-3 truncate w-11/12">
              {videoPath.split(/[\\/]/).pop()}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-500">Medyayı oynatmak için video ekleyin</span>
        )}

        {/* Play/Pause hover overlay */}
        {videoPath && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <button 
              onClick={handlePlayPause}
              className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white transition shadow-lg"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="translate-x-[1px]" />}
            </button>
          </div>
        )}
      </div>

      {/* Player Control Bar */}
      <div className="flex items-center gap-4">
        <GlassButton 
          disabled={!videoPath}
          onClick={handlePlayPause}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </GlassButton>

        <div className="flex-1">
          {exporting ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin text-orange-400" /> Video Render Ediliyor...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : exportSuccess ? (
            <div className="flex items-center gap-2 p-2 rounded bg-green-500/10 border border-green-500/20 text-green-300">
              <CheckCircle2 size={16} className="flex-shrink-0" />
              <div className="text-[10px] truncate flex-1">
                Video Başarıyla Kaydedildi! <br/>
                <span className="text-gray-400 select-all">{exportPath}</span>
              </div>
            </div>
          ) : (
            <GlassButton 
              variant="primary" 
              disabled={!videoPath}
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold"
            >
              <Download size={14} /> Videoyu Dışa Aktar (.MP4 & .SRT)
            </GlassButton>
          )}
        </div>
      </div>
    </div>
  )
}
