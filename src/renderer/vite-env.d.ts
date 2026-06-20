/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    selectFiles: (type: 'all' | 'video' | 'audio' | 'image') => Promise<string[]>
    exportProject: (projectData: any) => Promise<{ success: boolean; outputPath?: string; error?: string }>
    onExportProgress: (callback: (progress: number) => void) => () => void
  }
}
