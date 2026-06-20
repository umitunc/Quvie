import React, { useRef } from 'react'
import { useProjectStore, AudioBlock as IAudioBlock } from '../../store'
import { ZoomIn, ZoomOut, Film, Music, Trash2 } from 'lucide-react'

export const Timeline: React.FC = () => {
  const {
    videoPath,
    videoDuration,
    audioBlocks,
    scaleFactor,
    currentTime,
    selectedBlockId,
    addAudioBlock,
    updateAudioBlock,
    removeAudioBlock,
    setSelectedBlockId,
    setCurrentTime,
    setScaleFactor
  } = useProjectStore()

  const timelineRef = useRef<HTMLDivElement>(null)

  // Handle Drag Over timeline
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Handle Drop onto audio track
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!timelineRef.current) return

    const rawData = e.dataTransfer.getData('application/quvie-file')
    if (!rawData) return

    const file = JSON.parse(rawData)
    if (file.type !== 'audio') return

    // Calculate start time based on drop position relative to timeline container
    const rect = timelineRef.current.getBoundingClientRect()
    const dropX = e.clientX - rect.left + timelineRef.current.scrollLeft
    const dropTime = Math.max(0, dropX / scaleFactor)

    addAudioBlock({
      name: file.name,
      path: file.path,
      startTime: dropTime,
      duration: 30, // default duration
      volume: 1.0,
      pitch: 1.0,
      tempo: 1.0
    })
  }

  // Handle click on timeline to set playhead
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left + timelineRef.current.scrollLeft
    const clickTime = Math.max(0, clickX / scaleFactor)
    setCurrentTime(clickTime)
  }

  // Block dragging handler
  const handleBlockDragStart = (e: React.DragEvent, block: IAudioBlock) => {
    e.stopPropagation()
    e.dataTransfer.setData('application/quvie-block-drag', JSON.stringify({ id: block.id, startX: e.clientX, originalStartTime: block.startTime }))
  }

  const handleBlockDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleBlockDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const rawData = e.dataTransfer.getData('application/quvie-block-drag')
    if (!rawData) return

    const data = JSON.parse(rawData)
    const deltaX = e.clientX - data.startX
    const deltaTime = deltaX / scaleFactor
    const newStartTime = Math.max(0, data.originalStartTime + deltaTime)

    updateAudioBlock(data.id, { startTime: newStartTime })
  }

  return (
    <div className="flex flex-col h-full bg-[#13131a] rounded-lg border border-white/5 overflow-hidden">
      {/* Timeline Controls */}
      <div className="flex justify-between items-center p-3 border-b border-white/5 bg-[#181824]/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-orange-400">
            Zaman: {currentTime.toFixed(2)}s / {(videoDuration || 0).toFixed(2)}s
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setScaleFactor(scaleFactor - 5)}
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <ZoomOut size={16} />
          </button>
          <input 
            type="range"
            min="10"
            max="150"
            value={scaleFactor}
            onChange={(e) => setScaleFactor(Number(e.target.value))}
            className="w-24 accent-orange-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
          <button 
            onClick={() => setScaleFactor(scaleFactor + 5)}
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* Tracks Container */}
      <div 
        ref={timelineRef}
        onClick={handleTimelineClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex-1 overflow-x-auto overflow-y-hidden relative select-none p-4 min-h-[200px] cursor-pointer"
      >
        {/* Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-orange-500 z-30 pointer-events-none"
          style={{ left: `${currentTime * scaleFactor + 16}px` }}
        >
          <div className="w-3 h-3 bg-orange-500 rounded-full -translate-x-[5px] shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
        </div>

        {/* Video Track */}
        <div className="flex items-center h-16 bg-white/[0.02] border border-white/5 rounded-lg mb-4 relative overflow-hidden">
          <div className="w-32 bg-[#1b1b28] h-full flex items-center gap-2 px-3 border-r border-white/5 flex-shrink-0 z-10">
            <Film size={14} className="text-orange-400" />
            <span className="text-xs font-semibold text-white">Video</span>
          </div>
          <div className="flex-1 h-full relative">
            {videoPath ? (
              <div 
                className="absolute top-1 bottom-1 bg-orange-500/20 border border-orange-500/30 rounded px-2 flex items-center text-xs text-orange-200"
                style={{ width: `${(videoDuration || 120) * scaleFactor}px` }}
              >
                {videoPath.split(/[\\/]/).pop()}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                Ana videoyu soldaki panelden yükleyin.
              </div>
            )}
          </div>
        </div>

        {/* Audio Track */}
        <div 
          onDragOver={handleBlockDragOver}
          onDrop={handleBlockDrop}
          className="flex items-center h-20 bg-white/[0.02] border border-white/5 rounded-lg relative overflow-hidden"
        >
          <div className="w-32 bg-[#1b1b28] h-full flex items-center gap-2 px-3 border-r border-white/5 flex-shrink-0 z-10">
            <Music size={14} className="text-blue-400" />
            <span className="text-xs font-semibold text-white">Ses / Müzik</span>
          </div>
          <div className="flex-1 h-full relative">
            {audioBlocks.map((block) => (
              <div
                key={block.id}
                draggable
                onDragStart={(e) => handleBlockDragStart(e, block)}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedBlockId(block.id)
                }}
                className={`absolute top-2 bottom-2 rounded border p-2 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none transition-shadow ${
                  selectedBlockId === block.id 
                    ? 'bg-blue-600/30 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)] text-blue-100' 
                    : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
                }`}
                style={{ 
                  left: `${block.startTime * scaleFactor}px`,
                  width: `${block.duration * scaleFactor}px` 
                }}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="text-xs font-medium truncate pointer-events-none">{block.name}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      removeAudioBlock(block.id)
                    }}
                    className="text-gray-400 hover:text-red-400 p-0.5"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-400 pointer-events-none">
                  <span>Start: {block.startTime.toFixed(1)}s</span>
                  <span>Vol: {(block.volume * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
            {audioBlocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                Sürükle-bırak yöntemiyle buraya müzik/ses blokları yerleştirin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
