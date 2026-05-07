import { useRef, useState } from 'react';
import { ImagePlus, MoveVertical } from 'lucide-react';

type Props = {
  label: string;
  buttonLabel: string;
  image: string;
  offsetY: number;
  onOffsetYChange: (value: number) => void;
  onImageChange: (file: File) => void;
};

export const BackgroundUploadField = ({
  label,
  buttonLabel,
  image,
  offsetY,
  onOffsetYChange,
  onImageChange,
}: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLButtonElement | null>(null);
  const dragStartRef = useRef<{ pointerY: number; offsetY: number } | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const didMoveRef = useRef(false);
  const [imgNaturalSize, setImgNaturalSize] = useState<{ w: number; h: number } | null>(null);

  const computeMaxOffset = (): number => {
    if (!imgNaturalSize || !containerRef.current) return 5000;
    const cW = containerRef.current.clientWidth;
    const cH = containerRef.current.clientHeight;
    const scale = Math.max(cW / imgNaturalSize.w, cH / imgNaturalSize.h);
    return Math.max(0, (imgNaturalSize.h * scale - cH) / 2);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!image) return;
    didMoveRef.current = false;
    activePointerIdRef.current = event.pointerId;
    dragStartRef.current = { pointerY: event.clientY, offsetY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStartRef.current || activePointerIdRef.current !== event.pointerId) return;
    if (event.buttons === 0) {
      dragStartRef.current = null;
      activePointerIdRef.current = null;
      return;
    }

    const deltaY = event.clientY - dragStartRef.current.pointerY;
    if (Math.abs(deltaY) > 3) didMoveRef.current = true;
    const maxOffset = computeMaxOffset();
    onOffsetYChange(clamp(dragStartRef.current.offsetY + deltaY, -maxOffset, maxOffset));
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragStartRef.current = null;
    activePointerIdRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleClick = () => {
    if (didMoveRef.current) {
      didMoveRef.current = false;
      return;
    }
    inputRef.current?.click();
  };

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <button
        ref={containerRef}
        type="button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={(event) => {
          if (event.buttons === 0) {
            handlePointerEnd(event);
          }
        }}
        className={[
          'group relative flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-2xl',
          'border border-dashed border-primary/35 bg-background/35 transition-smooth',
          'hover:border-primary/55 hover:bg-background/50',
          image ? 'cursor-grab active:cursor-grabbing select-none' : '',
        ].join(' ')}
        style={{ touchAction: 'none' }}
      >
        {image ? (
          <>
            <img
              src={image}
              alt=""
              draggable={false}
              onLoad={(e) => setImgNaturalSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              className="absolute inset-0 h-full w-full object-cover pointer-events-none"
              style={{ objectPosition: `center calc(50% + ${clampedOffsetY(offsetY, imgNaturalSize, containerRef.current)}px)` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary-glow backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
              <MoveVertical className="h-3.5 w-3.5" />
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
    </label>
  );
};

export const backgroundObjectPosition = (offsetY: number) => ({
  objectPosition: `center calc(50% + ${offsetY}px)`,
});

export const backgroundPreviewStyle = (image: string, offsetY: number) => ({
  backgroundImage: `url(${image})`,
  backgroundSize: 'cover',
  backgroundPosition: `center calc(50% + ${offsetY}px)`,
});

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function clampedOffsetY(
  offsetY: number,
  naturalSize: { w: number; h: number } | null,
  container: HTMLElement | null,
): number {
  if (!naturalSize || !container) return offsetY;
  const cW = container.clientWidth;
  const cH = container.clientHeight;
  if (!cW || !cH) return offsetY;
  const scale = Math.max(cW / naturalSize.w, cH / naturalSize.h);
  const maxOff = Math.max(0, (naturalSize.h * scale - cH) / 2);
  return clamp(offsetY, -maxOff, maxOff);
}
