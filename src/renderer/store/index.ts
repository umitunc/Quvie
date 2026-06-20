import { create } from 'zustand'

export interface AudioBlock {
  id: string
  name: string
  path: string
  startTime: number // in seconds
  duration: number // in seconds
  volume: number // 0.0 - 1.0
  pitch: number // 0.5 - 2.0
  tempo: number // 0.5 - 2.0
}

export interface ProjectFile {
  id: string
  name: string
  path: string
  type: 'video' | 'audio' | 'image'
}

interface ProjectState {
  videoPath: string | null
  videoDuration: number
  audioBlocks: AudioBlock[]
  projectTreeFiles: ProjectFile[]
  scaleFactor: number
  currentTime: number
  isPlaying: boolean
  selectedBlockId: string | null
  
  // Actions
  setVideo: (path: string, duration: number) => void
  removeVideo: () => void
  addAudioBlock: (block: Omit<AudioBlock, 'id'>) => void
  updateAudioBlock: (id: string, updates: Partial<Omit<AudioBlock, 'id'>>) => void
  removeAudioBlock: (id: string) => void
  addProjectFile: (file: Omit<ProjectFile, 'id'>) => void
  removeProjectFile: (id: string) => void
  setScaleFactor: (scale: number) => void
  setCurrentTime: (time: number) => void
  setIsPlaying: (playing: boolean) => void
  setSelectedBlockId: (id: string | null) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  videoPath: null,
  videoDuration: 0,
  audioBlocks: [],
  projectTreeFiles: [],
  scaleFactor: 40,
  currentTime: 0,
  isPlaying: false,
  selectedBlockId: null,

  setVideo: (path, duration) => set({ 
    videoPath: path, 
    videoDuration: duration 
  }),
  
  removeVideo: () => set({ 
    videoPath: null, 
    videoDuration: 0 
  }),

  addAudioBlock: (block) => set((state) => ({
    audioBlocks: [...state.audioBlocks, { ...block, id: Math.random().toString(36).substring(7) }]
  })),

  updateAudioBlock: (id, updates) => set((state) => ({
    audioBlocks: state.audioBlocks.map((b) => b.id === id ? { ...b, ...updates } : b)
  })),

  removeAudioBlock: (id) => set((state) => ({
    audioBlocks: state.audioBlocks.filter((b) => b.id !== id),
    selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId
  })),

  addProjectFile: (file) => set((state) => {
    // Avoid duplicates
    if (state.projectTreeFiles.some(f => f.path === file.path)) return {}
    return {
      projectTreeFiles: [...state.projectTreeFiles, { ...file, id: Math.random().toString(36).substring(7) }]
    }
  }),

  removeProjectFile: (id) => set((state) => ({
    projectTreeFiles: state.projectTreeFiles.filter((f) => f.id !== id)
  })),

  setScaleFactor: (scale) => set({ scaleFactor: Math.max(10, Math.min(200, scale)) }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  setSelectedBlockId: (id) => set({ selectedBlockId: id })
}))
