import ffmpeg from 'fluent-ffmpeg'
import { FilterBuilder, AudioBlockFilterParams } from '../core/FilterBuilder'
import { FileService } from './FileService'
import { SrtService, SrtSegment } from './SrtService'

export interface AudioBlockExportData {
  name: string
  path: string
  startTime: number
  duration: number
  volume: number
  pitch: number
  tempo: number
}

export interface ExportProjectParams {
  videoPath: string
  audioBlocks: AudioBlockExportData[]
}

export class FfmpegService {
  /**
   * Run the export render pipeline using FFmpeg and generate subtitle SRT file
   */
  static exportProject(
    params: ExportProjectParams,
    onProgress: (percent: number) => void
  ): Promise<{ success: boolean; outputPath?: string; error?: string }> {
    return new Promise((resolve) => {
      const { videoPath, audioBlocks } = params

      // Determine output path
      const videoOutputPath = FileService.getOutputPath(videoPath, '_quvie_output', '.mp4')

      // 1. Initialize ffmpeg command starting with primary video input (index 0)
      let command = ffmpeg().input(videoPath)

      // 2. Map blocks to input paths and input indices
      const filterParams: AudioBlockFilterParams[] = []
      audioBlocks.forEach((block, index) => {
        const inputIdx = index + 1 // video is 0
        command = command.input(block.path)
        filterParams.push({
          inputIndex: inputIdx,
          startTime: block.startTime,
          volume: block.volume,
          pitch: block.pitch,
          tempo: block.tempo
        })
      })

      // 3. Build filter complex
      const filterComplex = FilterBuilder.buildAudioFilterComplex(filterParams, true)

      // 4. Configure output and options
      command
        .complexFilter(filterComplex)
        // Map video stream from input 0 and the mixed audio stream from filter complex
        .map('0:v')
        .map('[out_audio]')
        // Standard H.264/AAC output configuration
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions('-shortest') // ends when video ends
        .output(videoOutputPath)

      // 5. Track progress
      command.on('progress', (progressInfo) => {
        if (progressInfo.percent) {
          onProgress(Math.min(99, Math.round(progressInfo.percent)))
        }
      })

      command.on('end', () => {
        // Render completed. Now generate the SRT file!
        try {
          const srtSegments: SrtSegment[] = audioBlocks.map((block, idx) => ({
            id: idx + 1,
            startTime: block.startTime,
            endTime: block.startTime + block.duration,
            text: block.name
          }))

          const srtContent = SrtService.generateSrt(srtSegments)
          FileService.writeSrtFile(videoOutputPath, srtContent)

          onProgress(100)
          resolve({ success: true, outputPath: videoOutputPath })
        } catch (err: any) {
          resolve({ success: false, error: 'SRT generated error: ' + err.message })
        }
      })

      command.on('error', (err) => {
        console.error('FFmpeg export execution failed:', err)
        resolve({ success: false, error: err.message })
      })

      // Start processing
      command.run()
    })
  }
}
