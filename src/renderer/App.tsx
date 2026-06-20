import React from 'react'
import { ProjectTree } from './components/tree/ProjectTree'
import { Timeline } from './components/timeline/Timeline'
import { PreviewPanel } from './components/preview/PreviewPanel'
import { ModulationPanel } from './components/modulation/ModulationPanel'
import { GlassCard } from './components/common/GlassCard'
import { Sparkles } from 'lucide-react'

const App: React.FC = () => {
  return (
    <div className="app-container flex flex-col h-screen text-white overflow-hidden p-4 select-none">
      {/* Premium Header */}
      <header className="flex justify-between items-center mb-4 pb-2 border-b border-white/5 drag-region">
        <div className="flex items-center gap-2">
          {/* Trunçgil Brand Colors: Orange and Premium Koyu */}
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.4)]">
            <Sparkles size={14} className="text-white animate-pulse" />
          </div>
          <span className="font-extrabold text-base tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-orange-100 to-orange-400">
            QUVIE
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-widest font-semibold font-mono">
            v1.0.0
          </span>
        </div>
        <div className="text-[10px] text-gray-400 flex items-center gap-1">
          <span>Tasarım Sistemi:</span>
          <span className="text-orange-400 font-semibold font-mono">CitruSS UI (Glassque)</span>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 grid grid-rows-[3fr_2fr] gap-4 overflow-hidden">
        {/* Top Control Panels */}
        <div className="grid grid-cols-[260px_1fr_260px] gap-4 overflow-hidden">
          {/* Left panel: File Assets Tree */}
          <GlassCard className="flex flex-col overflow-hidden p-4">
            <ProjectTree />
          </GlassCard>

          {/* Center panel: Previewer */}
          <GlassCard className="flex flex-col justify-between overflow-hidden p-4">
            <PreviewPanel />
          </GlassCard>

          {/* Right panel: Modulation Panel */}
          <GlassCard className="flex flex-col overflow-hidden p-4">
            <ModulationPanel />
          </GlassCard>
        </div>

        {/* Bottom Panel: Interactive Timeline */}
        <div className="overflow-hidden">
          <Timeline />
        </div>
      </main>
    </div>
  )
}

export default App
