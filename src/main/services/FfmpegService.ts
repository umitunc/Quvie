import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'
import os from 'os'

export interface VisualItemExportData {
  id: string
  name: string
  path: string
  type: 'video' | 'image'
  duration: number
}

export interface AudioItemExportData {
  id: string
  name: string
  path: string
  startTime: number
  duration: number
  volume: number
}

export interface ExportProjectParams {
  visualItems: VisualItemExportData[]
  audioItems: AudioItemExportData[]
}

export class FfmpegService {
  /**
   * Run the export render pipeline:
   * 1. Transcode all images/videos to standardized 1280x720 clips in a temp directory.
   * 2. Concat the standardized clips together.
   * 3. Apply background audio tracks with start delays and mix them.
   * 4. Save output and clean up temp files.
   */
  static exportProject(
    params: ExportProjectParams,
    onProgress: (percent: number) => void
  ): Promise<{ success: boolean; outputPath?: string; error?: string }> {
    return new Promise(async (resolve) => {
      const { visualItems, audioItems } = params
      
      if (visualItems.length === 0) {
        resolve({ success: false, error: 'Hiç görsel öğe eklenmemiş!' })
        return
      }

      // Create a temp directory for normalized clips
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quvie-'))
      const normClips: string[] = []

      try {
        onProgress(5)
        
        // Step 1: Normalize all visual items to 1280x720, H.264, AAC (silent audio if image)
        for (let i = 0; i < visualItems.length; i++) {
          const item = visualItems[i]
          const outClipPath = path.join(tempDir, `norm_${i}.mp4`)
          
          await new Promise<void>((clipResolve, clipReject) => {
            let cmd = ffmpeg()

            if (item.type === 'image') {
              cmd
                .input(item.path)
                .loop(item.duration)
                .input('anullsrc=r=44100:c=2')
                .inputFormat('lavfi')
                .outputOptions('-shortest')
            } else {
              cmd.input(item.path)
            }

            cmd
              .videoFilters([
                'scale=1280:720:force_original_aspect_ratio=decrease',
                'pad=1280:720:(ow-iw)/2:(oh-ih)/2',
                'format=yuv420p'
              ])
              .videoCodec('libx264')
              .audioCodec('aac')
              .audioFrequency(44100)
              .audioChannels(2)
              .outputOptions('-t', item.duration.toString())
              .output(outClipPath)
              .on('end', () => {
                normClips.push(outClipPath)
                clipResolve()
              })
              .on('error', (err) => {
                clipReject(err)
              })
              .run()
          })

          const progressPercent = Math.round(5 + (i + 1) / visualItems.length * 45)
          onProgress(progressPercent)
        }

        // Step 2: Build final concatenation & audio overlay command
        onProgress(55)
        
        // Final Output Path: Desktop or alongside first visual file
        const firstFileDir = path.dirname(visualItems[0].path)
        const videoOutputPath = path.join(firstFileDir, `quvie_render_${Date.now()}.mp4`)

        let finalCmd = ffmpeg()
        
        // Add all normalized visual inputs
        normClips.forEach(clip => {
          finalCmd = finalCmd.input(clip)
        })

        // Add all audio track inputs
        audioItems.forEach(audio => {
          finalCmd = finalCmd.input(audio.path)
        })

        // Build filter complex
        // We will concat N inputs first:
        // [0:v][0:a][1:v][1:a]...concat=n=N:v=1:a=1[vconcat][aconcat]
        const N = normClips.length
        let concatFilter = ''
        for (let i = 0; i < N; i++) {
          concatFilter += `[${i}:v][${i}:a]`
        }
        concatFilter += `concat=n=${N}:v=1:a=1[vconcat][aconcat];`

        // Now mix background audios
        // Each background audio is at index N + j
        // Filter format: [in:a]volume=x,adelay=delay_ms|delay_ms[aud_j]
        let mixFilterInputs = '[aconcat]'
        let audioFilters = ''
        audioItems.forEach((audio, idx) => {
          const inIdx = N + idx
          const delayMs = Math.round(audio.startTime * 1000)
          const outLabel = `[aud_${idx}]`
          audioFilters += `[${inIdx}:a]volume=${audio.volume.toFixed(2)},adelay=${delayMs}|${delayMs}${outLabel};`
          mixFilterInputs += outLabel
        })

        const mixFilter = `${audioFilters}${mixFilterInputs}amix=inputs=${audioItems.length + 1}:duration=first[out_audio]`
        const fullFilterComplex = `${concatFilter}${mixFilter}`

        finalCmd
          .complexFilter(fullFilterComplex)
          .map('[vconcat]')
          .map('[out_audio]')
          .videoCodec('libx264')
          .audioCodec('aac')
          .output(videoOutputPath)
          .on('progress', (info) => {
            if (info.percent) {
              const exportPercent = Math.min(99, 55 + Math.round((info.percent / 100) * 40))
              onProgress(exportPercent)
            }
          })
          .on('end', () => {
            // Clean up temporary directory
            try {
              fs.rmSync(tempDir, { recursive: true, force: true })
            } catch (err) {
              console.error('Temp cleanup failed:', err)
            }
            onProgress(100)
            resolve({ success: true, outputPath: videoOutputPath })
          })
          .on('error', (err) => {
            console.error('Final render failed:', err)
            resolve({ success: false, error: err.message })
          })
          .run()

      } catch (err: any) {
        console.error('Render error:', err)
        // Cleanup temp on failure
        try {
          fs.rmSync(tempDir, { recursive: true, force: true })
        } catch (cleanupErr) {
          console.error('Temp cleanup failed:', cleanupErr)
        }
        resolve({ success: false, error: err.message })
      }
    })
  }
}
