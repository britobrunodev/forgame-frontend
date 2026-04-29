import { useState } from 'react';

type DragOption = {
  id: string;
  label: string;
};

type Props = {
  label: string;
  hint: string;
  availableTitle: string;
  selectedTitle: string;
  availableItems: DragOption[];
  selectedItems: DragOption[];
  onMove: (id: string, nextState: 'selected' | 'available') => void;
};

export const DragSelectField = ({
  label,
  hint,
  availableTitle,
  selectedTitle,
  availableItems,
  selectedItems,
  onMove,
}: Props) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDrop = (nextState: 'selected' | 'available') => {
    if (!draggedId) return;
    onMove(draggedId, nextState);
    setDraggedId(null);
  };

  return (
    <div className="flex h-full flex-col">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex flex-1 flex-col space-y-3">
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        <div className="grid flex-1 items-stretch gap-3 md:grid-cols-2">
          <DropZone
            title={availableTitle}
            onDropCategory={() => handleDrop('available')}
            onDragOver={(event) => event.preventDefault()}
          >
            {availableItems.map((item) => (
              <DraggableTag
                key={item.id}
                label={item.label}
                onDragStart={() => setDraggedId(item.id)}
                onClick={() => onMove(item.id, 'selected')}
              />
            ))}
          </DropZone>

          <DropZone
            title={selectedTitle}
            highlight
            onDropCategory={() => handleDrop('selected')}
            onDragOver={(event) => event.preventDefault()}
          >
            {selectedItems.map((item) => (
              <DraggableTag
                key={item.id}
                label={item.label}
                selected
                onDragStart={() => setDraggedId(item.id)}
                onClick={() => onMove(item.id, 'available')}
              />
            ))}
          </DropZone>
        </div>
      </div>
    </div>
  );
};

const DropZone = ({
  title,
  children,
  highlight = false,
  onDragOver,
  onDropCategory,
}: {
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDropCategory: () => void;
}) => (
  <div
    onDragOver={onDragOver}
    onDrop={(event) => {
      event.preventDefault();
      onDropCategory();
    }}
    className={`flex min-h-[136px] flex-col rounded-2xl border p-4 transition-smooth ${
      highlight ? 'border-primary/30 bg-primary/10' : 'border-border bg-background/40'
    }`}
  >
    <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{title}</div>
    <div className="flex min-h-[64px] flex-1 flex-wrap content-start gap-2">
      {children}
    </div>
  </div>
);

const DraggableTag = ({
  label,
  selected = false,
  onDragStart,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onDragStart: () => void;
  onClick: () => void;
}) => (
  <button
    type="button"
    draggable
    onDragStart={onDragStart}
    onClick={onClick}
    className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] leading-none transition-smooth ${
      selected
        ? 'border border-primary/20 bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.22)]'
        : 'border border-border bg-secondary text-foreground hover:border-primary/30'
    }`}
  >
    {label}
  </button>
);
