import fs from 'fs'
import path from 'path'

export class FileService {
  /**
   * Generates a unique output file path based on the input path
   */
  static getOutputPath(inputPath: string, suffix: string = '_edited', ext: string = '.mp4'): string {
    const dir = path.dirname(inputPath)
    const extname = path.extname(inputPath)
    const basename = path.basename(inputPath, extname)
    return path.join(dir, `${basename}${suffix}${ext}`)
  }

  /**
   * Writes the subtitle content to a .srt file in the same directory
   */
  static writeSrtFile(videoOutputPath: string, srtContent: string): string {
    const srtPath = videoOutputPath.replace(/\.[^/.]+$/, '.srt')
    fs.writeFileSync(srtPath, srtContent, 'utf-8')
    return srtPath
  }
}
