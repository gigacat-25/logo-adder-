'use client';

import React from 'react';
import { LogoSettings as SettingsType, PositionType } from '@/hooks/useImageProcessor';
import { LayoutGrid, Move, Sparkles } from 'lucide-react';

interface LogoSettingsProps {
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
  disabled: boolean;
}

export const LogoSettings: React.FC<LogoSettingsProps> = ({
  settings,
  onSettingsChange,
  disabled
}) => {
  const updatePosition = (position: PositionType) => {
    if (disabled) return;
    onSettingsChange({ ...settings, position });
  };

  const updateSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onSettingsChange({ ...settings, size: Number(e.target.value) });
  };

  const updateMargin = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onSettingsChange({ ...settings, margin: Number(e.target.value) });
  };

  // Helper to render position button
  const renderPosBtn = (pos: PositionType, label: string) => {
    const isActive = settings.position === pos;
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => updatePosition(pos)}
        className={`w-full aspect-square rounded-lg border flex flex-col items-center justify-center gap-1 transition-all duration-200 
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isActive
            ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.15)]'
            : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/40 text-zinc-400'
          }`}
        title={label}
      >
        <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 
          ${isActive ? 'bg-emerald-500 border-emerald-400 scale-110' : 'border-zinc-500'}`} 
        />
        <span className="text-[10px] tracking-tight">{label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" /> Overlay Settings
        </h3>
        <p className="text-xs text-zinc-500 mt-1">Adjust position and size metrics</p>
      </div>

      {/* Position selector using a visually responsive 3x3 layout */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" /> Position
        </label>
        <div className="grid grid-cols-3 gap-2 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-800">
          {renderPosBtn('top-left', 'Top Left')}
          <div className="w-full aspect-square rounded-lg border border-transparent flex items-center justify-center opacity-10">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          </div>
          {renderPosBtn('top-right', 'Top Right')}

          <div className="w-full aspect-square rounded-lg border border-transparent flex items-center justify-center opacity-10">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          </div>
          {renderPosBtn('center', 'Center')}
          <div className="w-full aspect-square rounded-lg border border-transparent flex items-center justify-center opacity-10">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          </div>

          {renderPosBtn('bottom-left', 'Bottom Left')}
          <div className="w-full aspect-square rounded-lg border border-transparent flex items-center justify-center opacity-10">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          </div>
          {renderPosBtn('bottom-right', 'Bottom Right')}
        </div>
      </div>

      {/* Size Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-zinc-300">Logo Size</span>
          <span className="font-mono text-emerald-400 font-medium">{settings.size}% of Width</span>
        </div>
        <div className="relative group">
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={settings.size}
            onChange={updateSize}
            disabled={disabled}
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-700 accent-emerald-500 focus:outline-none transition-colors 
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-650'}`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
          <span>5% (Small)</span>
          <span>30% (Large)</span>
        </div>
      </div>

      {/* Margin Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-zinc-300 flex items-center gap-1">
            <Move className="w-3.5 h-3.5 text-zinc-400" /> Margin Offset
          </span>
          <span className="font-mono text-emerald-400 font-medium">{settings.margin}px</span>
        </div>
        <div className="relative group">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={settings.margin}
            onChange={updateMargin}
            disabled={disabled}
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-700 accent-emerald-500 focus:outline-none transition-colors 
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-650'}`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
          <span>0px (Edge)</span>
          <span>100px (Inward)</span>
        </div>
        <p className="text-[10px] text-zinc-500 leading-tight">
          * Margin is dynamically scaled to match the aspect ratio and resolution of each source photo.
        </p>
      </div>
    </div>
  );
};
