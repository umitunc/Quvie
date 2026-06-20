import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import { FfmpegService } from './services/FfmpegService'

// Configure FFmpeg binary path from ffmpeg-static
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath)
  console.log('FFmpeg Path successfully set:', ffmpegPath)
} else {
  console.error('Failed to locate ffmpeg-static binary!')
}

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1a1a24',
      symbolColor: '#ffffff',
      height: 40
    }
  })

  // In development, load from local Vite dev server. In production, load the built index.html.
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC File Open Handlers
ipcMain.handle('select-files', async (_, type: 'all' | 'video' | 'audio' | 'image') => {
  let filters: { name: string; extensions: string[] }[] = []
  if (type === 'video') {
    filters = [{ name: 'Videos', extensions: ['mp4', 'mkv', 'mov', 'avi'] }]
  } else if (type === 'audio') {
    filters = [{ name: 'Audios', extensions: ['mp3', 'wav', 'aac', 'm4a'] }]
  } else if (type === 'image') {
    filters = [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }]
  } else {
    filters = [
      { name: 'Media Files', extensions: ['mp4', 'mkv', 'mov', 'avi', 'mp3', 'wav', 'aac', 'm4a', 'jpg', 'jpeg', 'png'] },
      { name: 'Videos', extensions: ['mp4', 'mkv', 'mov', 'avi'] },
      { name: 'Audios', extensions: ['mp3', 'wav', 'aac', 'm4a'] },
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }
    ]
  }
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters
  })
  if (result.canceled || result.filePaths.length === 0) {
    return []
  }
  return result.filePaths
})

ipcMain.handle('export-project', async (event, projectData: any) => {
  return await FfmpegService.exportProject(projectData, (progress) => {
    event.sender.send('export-progress', progress)
  })
})
