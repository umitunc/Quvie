export interface AudioBlockFilterParams {
  inputIndex: number
  startTime: number // in seconds
  volume: number
  pitch: number
  tempo: number
}

export class FilterBuilder {
  /**
   * Builds the -filter_complex argument for ffmpeg to mix and apply effects
   */
  static buildAudioFilterComplex(blocks: AudioBlockFilterParams[], includeVideoAudio: boolean = true): string {
    const filters: string[] = []
    const inputsToMix: string[] = []

    // 1. Process original video audio if included
    if (includeVideoAudio) {
      // Pass-through or slightly volume adjusted original audio
      filters.push(`[0:a]volume=0.8[orig_a]`)
      inputsToMix.push('[orig_a]')
    }

    // 2. Process each audio block input
    blocks.forEach((block) => {
      const idx = block.inputIndex
      const delayMs = Math.round(block.startTime * 1000)
      
      // We apply pitch, tempo, volume, and delay
      // To shift pitch without affecting speed, we use asetrate followed by atempo
      const sampleRate = 44100
      const pitchRate = Math.round(sampleRate * block.pitch)
      
      const pitchFilter = block.pitch !== 1.0 
        ? `asetrate=${pitchRate},atempo=${(1 / block.pitch).toFixed(2)}`
        : ''
      
      const tempoFilter = block.tempo !== 1.0 
        ? `atempo=${block.tempo.toFixed(2)}`
        : ''

      const volumeFilter = `volume=${block.volume.toFixed(2)}`
      
      // Delay filter: adelay=delay_ms|delay_ms (for stereo channels)
      const delayFilter = `adelay=${delayMs}|${delayMs}`

      // Combine all filters for this track
      const blockFilters = [pitchFilter, tempoFilter, volumeFilter, delayFilter]
        .filter(Boolean)
        .join(',')

      const outputLabel = `[aud${idx}]`
      filters.push(`[${idx}:a]${blockFilters}${outputLabel}`)
      inputsToMix.push(outputLabel)
    } // End foreach
    )

    // 3. Mix all streams together
    if (inputsToMix.length > 0) {
      const mixLabel = '[out_audio]'
      filters.push(`${inputsToMix.join('')}amix=inputs=${inputsToMix.length}:duration=longest${mixLabel}`)
    }

    return filters.join(';')
  }
}
