import { useEffect, useRef, useState } from 'react';

type CoverBounds = {
  maxOffsetX: number;
  maxOffsetY: number;
};

type Props = {
  src: string;
  alt: string;
  offsetX?: number;
  offsetY?: number;
  zoom?: number;
  className?: string;
  imgClassName?: string;
  onBoundsChange?: (bounds: CoverBounds) => void;
};

export const PositionedCoverImage = ({
  src,
  alt,
  offsetX = 0,
  offsetY = 0,
  zoom = 1,
  className = '',
  imgClassName = '',
  onBoundsChange,
}: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (!containerRef.current) return;
      setContainerSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const bounds = getCoverImageBounds(
    containerSize.width,
    containerSize.height,
    naturalSize.width,
    naturalSize.height,
    zoom,
  );

  useEffect(() => {
    onBoundsChange?.(bounds);
  }, [bounds.maxOffsetX, bounds.maxOffsetY, onBoundsChange]);

  const safeOffsetX = clamp(offsetX, -bounds.maxOffsetX, bounds.maxOffsetX);
  const safeOffsetY = clamp(offsetY, -bounds.maxOffsetY, bounds.maxOffsetY);

  return (
    <div ref={containerRef} className={className}>
      <img
        src={src}
        alt={alt}
        draggable={false}
        onLoad={(event) =>
          setNaturalSize({
            width: event.currentTarget.naturalWidth || 1,
            height: event.currentTarget.naturalHeight || 1,
          })
        }
        className={imgClassName}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: `${bounds.width}px`,
          height: `${bounds.height}px`,
          maxWidth: 'none',
          transform: `translate(calc(-50% + ${safeOffsetX}px), calc(-50% + ${safeOffsetY}px))`,
        }}
      />
    </div>
  );
};

export const getCoverImageBounds = (
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
  zoom: number,
) => {
  if (!containerWidth || !containerHeight || !imageWidth || !imageHeight) {
    return {
      width: containerWidth,
      height: containerHeight,
      maxOffsetX: 0,
      maxOffsetY: 0,
    };
  }

  const baseScale = Math.max(containerWidth / imageWidth, containerHeight / imageHeight);
  const width = imageWidth * baseScale * zoom;
  const height = imageHeight * baseScale * zoom;

  return {
    width,
    height,
    maxOffsetX: Math.max(0, (width - containerWidth) / 2),
    maxOffsetY: Math.max(0, (height - containerHeight) / 2),
  };
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
