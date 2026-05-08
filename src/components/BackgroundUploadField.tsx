import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ImagePlus, MoveHorizontal, MoveVertical, Search } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { PositionedCoverImage } from '@/components/PositionedCoverImage';

type Props = {
  label: string;
  buttonLabel: string;
  image: string;
  offsetX: number;
  offsetY: number;
  zoom: number;
  onOffsetXChange: (value: number) => void;
  onOffsetYChange: (value: number) => void;
  onZoomChange: (value: number) => void;
  onImageChange: (file: File) => void;
};

export const BackgroundUploadField = ({
  label,
  buttonLabel,
  image,
  offsetX,
  offsetY,
  zoom,
  onOffsetXChange,
  onOffsetYChange,
  onZoomChange,
  onImageChange,
}: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [bounds, setBounds] = useState({ maxOffsetX: 0, maxOffsetY: 0 });

  return (
    <div className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={[
          'group relative flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-2xl',
          'border border-dashed border-primary/35 bg-background/35 transition-smooth',
          'hover:border-primary/55 hover:bg-background/50',
        ].join(' ')}
      >
        {image ? (
          <>
            <PositionedCoverImage
              src={image}
              alt=""
              offsetX={offsetX}
              offsetY={offsetY}
              zoom={zoom}
              onBoundsChange={setBounds}
              className="absolute inset-0 overflow-hidden"
              imgClassName="pointer-events-none select-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary-glow backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
              <ImagePlus className="h-3.5 w-3.5" />
              {buttonLabel}
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 hex-grid opacity-20" />
            <div className="relative inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary-glow backdrop-blur-md">
              <ImagePlus className="h-4 w-4" />
              {buttonLabel}
            </div>
          </>
        )}
      </button>

      {image ? (
        <div className="mt-4 space-y-4 rounded-2xl border border-border bg-background/25 p-4">
          <ControlRow icon={<Search className="h-4 w-4 text-neon-cyan" />} label="Zoom">
            <Slider value={[zoom]} min={1} max={2.6} step={0.01} onValueChange={([value]) => onZoomChange(value)} />
          </ControlRow>
          <ControlRow icon={<MoveHorizontal className="h-4 w-4 text-neon-cyan" />} label="Horizontal">
            <Slider
              value={[clamp(offsetX, -bounds.maxOffsetX, bounds.maxOffsetX)]}
              min={-Math.max(bounds.maxOffsetX, 1)}
              max={Math.max(bounds.maxOffsetX, 1)}
              step={1}
              onValueChange={([value]) => onOffsetXChange(value)}
            />
          </ControlRow>
          <ControlRow icon={<MoveVertical className="h-4 w-4 text-neon-cyan" />} label="Vertical">
            <Slider
              value={[clamp(offsetY, -bounds.maxOffsetY, bounds.maxOffsetY)]}
              min={-Math.max(bounds.maxOffsetY, 1)}
              max={Math.max(bounds.maxOffsetY, 1)}
              step={1}
              onValueChange={([value]) => onOffsetYChange(value)}
            />
          </ControlRow>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          onImageChange(file);
          event.target.value = '';
        }}
        className="hidden"
      />
    </div>
  );
};

const ControlRow = ({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) => (
  <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
      {icon}
      {label}
    </div>
    {children}
  </div>
);

export const backgroundPreviewStyle = (image: string, offsetX: number, offsetY: number, zoom: number) => ({
  backgroundImage: `url(${image})`,
  backgroundSize: `${zoom * 100}%`,
  backgroundPosition: `calc(50% + ${offsetX}px) calc(50% + ${offsetY}px)`,
});

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
