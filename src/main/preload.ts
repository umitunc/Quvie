import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  selectFiles: (type: 'all' | 'video' | 'audio' | 'image') => ipcRenderer.invoke('select-files', type),
  exportProject: (projectData: any) => ipcRenderer.invoke('export-project', projectData),
  onExportProgress: (callback: (progress: number) => void) => {
    const listener = (_event: any, value: number) => callback(value)
    ipcRenderer.on('export-progress', listener)
    return () => ipcRenderer.removeListener('export-progress', listener)
  }
})
