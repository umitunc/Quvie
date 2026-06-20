export interface SrtSegment {
  id: number
  startTime: number // in seconds
  endTime: number // in seconds
  text: string
}

export class SrtService {
  /**
   * Helper function to format seconds into HH:MM:SS,MS
   */
  private static formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)

    const pad = (num: number, size: number) => num.toString().padStart(size, '0')

    return `${pad(hrs, 2)}:${pad(mins, 2)}:${pad(secs, 2)},${pad(ms, 3)}`
  }

  /**
   * Generates SRT content from segments
   */
  static generateSrt(segments: SrtSegment[]): string {
    return segments
      .sort((a, b) => a.startTime - b.startTime)
      .map((seg, index) => {
        const start = this.formatTime(seg.startTime)
        const end = this.formatTime(seg.endTime)
        return `${index + 1}\n${start} --> ${end}\n${seg.text}\n`
      })
      .join('\n')
  }
}
