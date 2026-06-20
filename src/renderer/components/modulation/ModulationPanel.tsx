import React from 'react'
import { useProjectStore } from '../../store'
import { Volume2, Sliders, Activity } from 'lucide-react'

export const ModulationPanel: React.FC = () => {
  const { selectedBlockId, audioBlocks, updateAudioBlock } = useProjectStore()

  const selectedBlock = audioBlocks.find((b) => b.id === selectedBlockId)

  if (!selectedBlock) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
        <Sliders size={28} className="mb-2 opacity-50" />
        <span className="text-xs">Modülasyon panelini görmek için timeline'dan bir ses bloğu seçin.</span>
      </div>
    )
  }

  return (
    <div className="modulation-panel flex flex-col gap-4 h-full">
      <div className="panel-header mb-2">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Activity size={16} className="text-orange-400" /> Ses Modülasyonu
        </h3>
        <p className="text-[11px] text-gray-400 truncate">{selectedBlock.name}</p>
      </div>

      {/* Volume Slider */}
      <div className="control-group flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-300 flex items-center gap-1">
            <Volume2 size={14} /> Ses Düzeyi
          </span>
          <span className="text-orange-400 font-semibold">{(selectedBlock.volume * 100).toFixed(0)}%</span>
        </div>
        <input 
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={selectedBlock.volume}
          onChange={(e) => updateAudioBlock(selectedBlock.id, { volume: Number(e.target.value) })}
          className="w-full accent-orange-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Pitch Slider */}
      <div className="control-group flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-300">Ses Tonu (Pitch)</span>
          <span className="text-orange-400 font-semibold">{selectedBlock.pitch.toFixed(2)}x</span>
        </div>
        <input 
          type="range"
          min="0.5"
          max="2.0"
          step="0.05"
          value={selectedBlock.pitch}
          onChange={(e) => updateAudioBlock(selectedBlock.id, { pitch: Number(e.target.value) })}
          className="w-full accent-orange-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Kalın (0.5x)</span>
          <span>Normal (1.0x)</span>
          <span>İnce (2.0x)</span>
        </div>
      </div>

      {/* Tempo Slider */}
      <div className="control-group flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-300">Tempo / Hız</span>
          <span className="text-orange-400 font-semibold">{selectedBlock.tempo.toFixed(2)}x</span>
        </div>
        <input 
          type="range"
          min="0.5"
          max="2.0"
          step="0.05"
          value={selectedBlock.tempo}
          onChange={(e) => updateAudioBlock(selectedBlock.id, { tempo: Number(e.target.value) })}
          className="w-full accent-orange-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Yavaş (0.5x)</span>
          <span>Normal (1.0x)</span>
          <span>Hızlı (2.0x)</span>
        </div>
      </div>
    </div>
  )
}
