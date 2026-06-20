import React, { useRef, useState } from 'react'
import { useProjectStore, AudioItem } from '../../store'
import { Film, Music, Trash2, Move } from 'lucide-react'

export const MediaTimeline: React.FC = () => {
  const {
    visualItems,
    audioItems,
    scaleFactor,
    currentTime,
    selectedItemId,
    selectedItemType,
    setCurrentTime,
    setScaleFactor,
    reorderVisualItems,
    removeVisualItem,
    removeAudioItem,
    updateAudioItem,
    setSelectedItem
  } = useProjectStore()

  const timelineRef = useRef<HTMLDivElement>(null)
  const [draggedVisualIndex, setDraggedVisualIndex] = useState<number | null>(null)
  const [draggedAudioId, setDraggedAudioId] = useState<string | null>(null)
  const [dragStartOffset, setDragStartOffset] = useState<number>(0)

  // Calculate total timeline duration
  const totalVisualDuration = visualItems.reduce((acc, item) => acc + item.duration, 0)

  // Set timeline playhead position on click
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return
    // Prevent triggering playhead change when clicking interactive items
    const target = e.target as HTMLElement
    if (target.closest('.interactive-item') || target.closest('button') || target.closest('input')) return

    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left - 128 + timelineRef.current.scrollLeft
    const clickTime = Math.max(0, clickX / scaleFactor)
    setCurrentTime(clickTime)
  }

  // Visual Item Drag & Drop handlers (Reorder)
  const handleVisualDragStart = (index: number) => {
    setDraggedVisualIndex(index)
  }

  const handleVisualDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedVisualIndex === null || draggedVisualIndex === index) return
  }

  const handleVisualDrop = (index: number) => {
    if (draggedVisualIndex === null) return
    reorderVisualItems(draggedVisualIndex, index)
    setDraggedVisualIndex(null)
  }

  // Audio Item Drag & Drop handlers (Move horizontally)
  const handleAudioDragStart = (e: React.DragEvent, item: AudioItem) => {
    setDraggedAudioId(item.id)
    const blockX = item.startTime * scaleFactor
    const clickX = e.clientX - (timelineRef.current?.getBoundingClientRect().left || 0) - 128 + (timelineRef.current?.scrollLeft || 0)
    setDragStartOffset(clickX - blockX)
    
    // Set transparent image to avoid default drag ghosting
    const img = new Image()
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    e.dataTransfer.setDragImage(img, 0, 0)
  }

  const handleAudioDrag = (e: React.DragEvent) => {
    if (!draggedAudioId || e.clientX === 0 || !timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const currentX = e.clientX - rect.left - 128 + timelineRef.current.scrollLeft
    const newBlockX = currentX - dragStartOffset
    const newStartTime = Math.max(0, newBlockX / scaleFactor)
    updateAudioItem(draggedAudioId, { startTime: newStartTime })
  }

  const handleAudioDragEnd = () => {
    setDraggedAudioId(null)
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0d14]/70 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Timeline Controls */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-white/5 bg-[#14141f]/80">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wider text-orange-400 font-mono">TIMELINE</span>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            {currentTime.toFixed(2)}s / {totalVisualDuration.toFixed(2)}s
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-500 font-mono">Scale:</span>
          <input
            type="range"
            min="20"
            max="120"
            value={scaleFactor}
            onChange={(e) => setScaleFactor(Number(e.target.value))}
            className="w-28 h-1 accent-orange-500 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Tracks Container */}
      <div
        ref={timelineRef}
        onClick={handleTimelineClick}
        className="flex-1 overflow-x-auto overflow-y-hidden relative p-6 min-h-[180px] select-none scrollbar-thin"
        style={{ contentVisibility: 'auto' }}
      >
        {/* Playhead line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-orange-500 to-amber-500 z-30 pointer-events-none"
          style={{ left: `${currentTime * scaleFactor + 128 + 24}px` }}
        >
          <div className="w-3.5 h-3.5 bg-orange-500 rounded-full -translate-x-[6px] -translate-y-[2px] shadow-[0_0_12px_rgba(249,115,22,0.8)] border-2 border-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Visual Track */}
        <div className="flex items-center h-20 mb-6 relative border border-white/5 rounded-xl bg-[#14141f]/40 overflow-hidden">
          <div className="w-32 bg-[#171724]/90 h-full flex items-center gap-3 px-4 border-r border-white/10 flex-shrink-0 z-10">
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
              <Film size={16} />
            </div>
            <span className="text-xs font-bold tracking-wide text-white">Görsel</span>
          </div>
          <div className="flex-1 h-full flex items-center gap-2 px-4 overflow-x-auto scrollbar-none">
            {visualItems.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleVisualDragStart(idx)}
                onDragOver={(e) => handleVisualDragOver(e, idx)}
                onDrop={() => handleVisualDrop(idx)}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedItem(item.id, 'visual')
                }}
                className={`interactive-item h-[64px] rounded-lg border flex flex-col justify-between p-2 flex-shrink-0 cursor-grab active:cursor-grabbing transition-all ${
                  selectedItemId === item.id && selectedItemType === 'visual'
                    ? 'bg-orange-500/20 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                style={{ width: `${item.duration * scaleFactor}px` }}
              >
                <div className="flex justify-between items-start gap-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[10px] bg-white/10 px-1 py-0.2 rounded text-gray-300 font-mono">#{idx+1}</span>
                    <span className="text-[11px] font-medium truncate text-white">{item.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeVisualItem(item.id)
                    }}
                    className="text-gray-400 hover:text-orange-500 p-0.5 rounded transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono">
                  <span className="capitalize text-orange-400/80">{item.type}</span>
                  <span>{item.duration.toFixed(1)}s</span>
                </div>
              </div>
            ))}
            {visualItems.length === 0 && (
              <div className="text-xs text-gray-500 italic pl-2">
                Görsel veya video sürükleyin (Yukarıdaki dropzone veya bu alan)
              </div>
            )}
          </div>
        </div>

        {/* Audio Track */}
        <div className="flex items-center h-20 relative border border-white/5 rounded-xl bg-[#14141f]/40 overflow-hidden">
          <div className="w-32 bg-[#171724]/90 h-full flex items-center gap-3 px-4 border-r border-white/10 flex-shrink-0 z-10">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Music size={16} />
            </div>
            <span className="text-xs font-bold tracking-wide text-white">Ses / Müzik</span>
          </div>
          <div className="flex-1 h-full relative px-4">
            {audioItems.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleAudioDragStart(e, item)}
                onDrag={(e) => handleAudioDrag(e)}
                onDragEnd={handleAudioDragEnd}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedItem(item.id, 'audio')
                }}
                className={`interactive-item absolute top-3 bottom-3 rounded-lg border flex flex-col justify-between p-2 cursor-grab active:cursor-grabbing transition-all ${
                  selectedItemId === item.id && selectedItemType === 'audio'
                    ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                style={{
                  left: `${item.startTime * scaleFactor + 16}px`,
                  width: `${item.duration * scaleFactor}px`
                }}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1 truncate text-white">
                    <Move size={10} className="text-blue-400 flex-shrink-0" />
                    <span className="text-[11px] font-medium truncate">{item.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeAudioItem(item.id)
                    }}
                    className="text-gray-400 hover:text-blue-500 p-0.5 rounded transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono">
                  <span>Başlangıç: {item.startTime.toFixed(1)}s</span>
                  <span>Vol: {Math.round(item.volume * 100)}%</span>
                </div>
              </div>
            ))}
            {audioItems.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 italic">
                Müzik veya ses dosyası sürükleyin (.MP3, .WAV)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
