import React from 'react'
import { useProjectStore, ProjectFile } from '../../store'
import { GlassButton } from '../common/GlassButton'
import { Film, Music, Trash2, Plus, Image as ImageIcon } from 'lucide-react'

export const ProjectTree: React.FC = () => {
  const { 
    projectTreeFiles, 
    videoPath, 
    setVideo, 
    removeVideo,
    addProjectFile, 
    removeProjectFile,
    addAudioBlock
  } = useProjectStore()

  const handleImportMedia = async () => {
    try {
      const files = await window.electronAPI.selectFiles('all')
      if (files && files.length > 0) {
        files.forEach((file) => {
          const ext = file.split('.').pop()?.toLowerCase() || ''
          const name = file.split(/[\\/]/).pop() || file
          
          let type: 'video' | 'audio' | 'image' = 'audio'
          if (['mp4', 'mkv', 'mov', 'avi'].includes(ext)) {
            type = 'video'
            // Set first video as the active preview video
            if (!videoPath) {
              setVideo(file, 120)
            }
          } else if (['jpg', 'jpeg', 'png'].includes(ext)) {
            type = 'image'
          }

          addProjectFile({ name, path: file, type })
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDragStart = (e: React.DragEvent, file: ProjectFile) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(file))
  }

  const handleAddToTimeline = (file: ProjectFile) => {
    if (file.type === 'audio') {
      addAudioBlock({
        name: file.name,
        path: file.path,
        startTime: 0,
        duration: 30, // Default 30s
        volume: 1.0,
        pitch: 1.0,
        tempo: 1.0
      })
    }
  }

  return (
    <div className="project-tree flex flex-col h-full">
      <div className="panel-header flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Proje Dosyaları</h3>
      </div>

      {/* Single Unified Media Upload Button */}
      <div className="mb-4">
        <GlassButton variant="primary" onClick={handleImportMedia} className="w-full flex items-center justify-center gap-1.5 text-xs py-2">
          <Plus size={14} /> Medya Ekle (Video, Ses, Resim)
        </GlassButton>
      </div>

      <div className="tree-content flex-1 overflow-y-auto pr-1">
        
        {/* 1. Video & Image Area */}
        <div className="tree-section mb-6">
          <div className="section-title text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Video & Resim Alanı</div>
          <div className="flex flex-col gap-2">
            {projectTreeFiles.filter(f => f.type === 'video' || f.type === 'image').map((file) => {
              const isMainVideo = file.path === videoPath
              return (
                <div 
                  key={file.id}
                  className={`tree-node flex items-center justify-between p-2 rounded border transition ${
                    isMainVideo 
                      ? 'bg-orange-500/10 border-orange-500/30' 
                      : 'bg-white/5 border-white/10 hover:border-orange-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {file.type === 'video' ? (
                      <Film size={16} className="text-orange-400 flex-shrink-0" />
                    ) : (
                      <ImageIcon size={16} className="text-emerald-400 flex-shrink-0" />
                    )}
                    <span className="text-xs text-white truncate" title={file.path}>
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {file.type === 'video' && !isMainVideo && (
                      <button 
                        onClick={() => setVideo(file.path, 120)}
                        className="text-[10px] text-orange-400 hover:text-orange-300 px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20"
                        title="Ana Video Yap"
                      >
                        Aktif Et
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        if (isMainVideo) removeVideo()
                        removeProjectFile(file.id)
                      }}
                      className="text-gray-400 hover:text-red-400 p-1"
                      title="Kaldır"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
            {projectTreeFiles.filter(f => f.type === 'video' || f.type === 'image').length === 0 && (
              <div className="text-xs text-center text-gray-500 py-4 border border-dashed border-white/10 rounded">
                Video veya resim dosyası bulunmuyor.
              </div>
            )}
          </div>
        </div>

        {/* 2. Audio Area */}
        <div className="tree-section">
          <div className="section-title text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ses Alanı</div>
          <div className="flex flex-col gap-2">
            {projectTreeFiles.filter(f => f.type === 'audio').map((file) => (
              <div 
                key={file.id}
                draggable
                onDragStart={(e) => handleDragStart(e, file)}
                className="tree-node flex items-center justify-between p-2 rounded bg-white/5 border border-white/10 hover:border-orange-500/40 cursor-grab active:cursor-grabbing transition"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Music size={16} className="text-blue-400 flex-shrink-0" />
                  <span className="text-xs text-white truncate" title={file.path}>
                    {file.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleAddToTimeline(file)}
                    className="text-gray-400 hover:text-green-400 p-1"
                    title="Timeline'a Ekle"
                  >
                    <Plus size={14} />
                  </button>
                  <button 
                    onClick={() => removeProjectFile(file.id)}
                    className="text-gray-400 hover:text-red-400 p-1"
                    title="Kaldır"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {projectTreeFiles.filter(f => f.type === 'audio').length === 0 && (
              <div className="text-xs text-center text-gray-500 py-4 border border-dashed border-white/10 rounded">
                Ses dosyası bulunmuyor.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
