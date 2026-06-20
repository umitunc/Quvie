import { create } from 'zustand'

export interface VisualItem {
  id: string
  name: string
  path: string
  type: 'video' | 'image'
  duration: number // 5s for image, actual duration for video
}

export interface AudioItem {
  id: string
  name: string
  path: string
  startTime: number
  duration: number
  volume: number
}

interface ProjectState {
  visualItems: VisualItem[]
  audioItems: AudioItem[]
  currentTime: number
  isPlaying: boolean
  scaleFactor: number
  selectedItemId: string | null
  selectedItemType: 'visual' | 'audio' | null
  isExporting: boolean
  exportProgress: number

  // Actions
  addVisualItem: (item: Omit<VisualItem, 'id'>) => void
  removeVisualItem: (id: string) => void
  reorderVisualItems: (startIndex: number, endIndex: number) => void
  addAudioItem: (item: Omit<AudioItem, 'id'>) => void
  updateAudioItem: (id: string, updates: Partial<Omit<AudioItem, 'id'>>) => void
  removeAudioItem: (id: string) => void
  
  setCurrentTime: (time: number) => void
  setIsPlaying: (playing: boolean) => void
  setScaleFactor: (scale: number) => void
  setSelectedItem: (id: string | null, type: 'visual' | 'audio' | null) => void
  
  setExportState: (isExporting: boolean, progress: number) => void
  resetProject: () => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  visualItems: [],
  audioItems: [],
  currentTime: 0,
  isPlaying: false,
  scaleFactor: 40,
  selectedItemId: null,
  selectedItemType: null,
  isExporting: false,
  exportProgress: 0,

  addVisualItem: (item) => set((state) => ({
    visualItems: [...state.visualItems, { ...item, id: Math.random().toString(36).substring(7) }]
  })),

  removeVisualItem: (id) => set((state) => ({
    visualItems: state.visualItems.filter((item) => item.id !== id),
    selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
    selectedItemType: state.selectedItemId === id ? null : state.selectedItemType
  })),

  reorderVisualItems: (startIndex, endIndex) => set((state) => {
    const result = Array.from(state.visualItems)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return { visualItems: result }
  }),

  addAudioItem: (item) => set((state) => ({
    audioItems: [...state.audioItems, { ...item, id: Math.random().toString(36).substring(7) }]
  })),

  updateAudioItem: (id, updates) => set((state) => ({
    audioItems: state.audioItems.map((item) => item.id === id ? { ...item, ...updates } : item)
  })),

  removeAudioItem: (id) => set((state) => ({
    audioItems: state.audioItems.filter((item) => item.id !== id),
    selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
    selectedItemType: state.selectedItemId === id ? null : state.selectedItemType
  })),

  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  setScaleFactor: (scale) => set({ scaleFactor: Math.max(10, Math.min(200, scale)) }),
  
  setSelectedItem: (id, type) => set({ selectedItemId: id, selectedItemType: type }),

  setExportState: (isExporting, progress) => set({ isExporting, exportProgress: progress }),

  resetProject: () => set({
    visualItems: [],
    audioItems: [],
    currentTime: 0,
    isPlaying: false,
    selectedItemId: null,
    selectedItemType: null,
    isExporting: false,
    exportProgress: 0
  })
}))
