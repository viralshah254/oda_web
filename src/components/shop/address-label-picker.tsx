'use client';

import { useState, useEffect } from 'react';
import { Home, Briefcase, Users, MapPin } from 'lucide-react';

export const ADDRESS_LABEL_PRESETS = ['Home', 'Work', 'Friends', 'Other'] as const;
export type AddressLabelPreset = (typeof ADDRESS_LABEL_PRESETS)[number];

const ICONS: Record<AddressLabelPreset, React.ReactNode> = {
  Home: <Home className="w-3.5 h-3.5" />,
  Work: <Briefcase className="w-3.5 h-3.5" />,
  Friends: <Users className="w-3.5 h-3.5" />,
  Other: <MapPin className="w-3.5 h-3.5" />,
};

function detectPreset(label?: string | null): { preset: AddressLabelPreset; custom: string } {
  if (!label) return { preset: 'Home', custom: '' };
  const match = ADDRESS_LABEL_PRESETS.find((p) => p.toLowerCase() === label.trim().toLowerCase());
  if (match) return { preset: match, custom: '' };
  return { preset: 'Other', custom: label.trim() };
}

interface AddressLabelPickerProps {
  value?: string;
  onChange: (label: string) => void;
}

/**
 * Renders four preset chips (Home / Work / Friends / Other) plus a free-text
 * input when "Other" is selected. `onChange` is called with the resolved label
 * string every time the user makes a selection.
 */
export function AddressLabelPicker({ value, onChange }: AddressLabelPickerProps) {
  const initial = detectPreset(value);
  const [preset, setPreset] = useState<AddressLabelPreset>(initial.preset);
  const [custom, setCustom] = useState(initial.custom);

  // Sync if controlled value changes from outside (e.g. edit form re-mount)
  useEffect(() => {
    const det = detectPreset(value);
    setPreset(det.preset);
    setCustom(det.custom);
  }, [value]);

  const fire = (nextPreset: AddressLabelPreset, nextCustom: string) => {
    if (nextPreset === 'Other') {
      onChange(nextCustom.trim() || 'Other');
    } else {
      onChange(nextPreset);
    }
  };

  const handlePreset = (p: AddressLabelPreset) => {
    setPreset(p);
    fire(p, custom);
  };

  const handleCustom = (v: string) => {
    setCustom(v);
    fire('Other', v);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {ADDRESS_LABEL_PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handlePreset(p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold font-plus-jakarta border transition-colors ${
              preset === p
                ? 'bg-oda-green text-white border-oda-green'
                : 'bg-white text-oda-charcoal/70 border-oda-charcoal/15 hover:border-oda-green/40 hover:text-oda-green'
            }`}
          >
            {ICONS[p]}
            {p}
          </button>
        ))}
      </div>
      {preset === 'Other' && (
        <input
          type="text"
          placeholder="e.g. Parent's place, Gym…"
          value={custom}
          onChange={(e) => handleCustom(e.target.value)}
          className="w-full border border-oda-charcoal/15 rounded-xl px-4 py-2.5 text-sm font-plus-jakarta focus:outline-none focus:ring-2 focus:ring-oda-green/30 placeholder:text-oda-charcoal/35"
        />
      )}
    </div>
  );
}
