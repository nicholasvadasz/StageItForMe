import { useDraggable } from '@dnd-kit/core';
import { FurnitureItem } from '@/types/furniture';
import { useImageAspectRatio } from '@/hooks/useImageAspectRatio';
import Image from 'next/image';

interface DraggableFurnitureProps {
    furniture: FurnitureItem;
}

export function DraggableFurniture({ furniture }: DraggableFurnitureProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: furniture.id,
        data: {
            type: 'furniture',
            furniture,
        },
    });

    const { aspectRatio, isLoading } = useImageAspectRatio(furniture.imagePath);

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    // Calculate dimensions based on aspect ratio for palette display
    const baseSize = 64; // 64px base size for palette

    let width: number, height: number;
    if (isLoading) {
        // Show square placeholder while loading
        width = baseSize;
        height = baseSize;
    } else if (aspectRatio >= 1) {
        // Wider than tall
        width = baseSize;
        height = baseSize / aspectRatio;
    } else {
        // Taller than wide
        width = baseSize * aspectRatio;
        height = baseSize;
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
        cursor-grab active:cursor-grabbing
        transition-all duration-200
        ${isDragging ? 'opacity-50 z-50' : ''}
      `}
        >
            <div
                className="relative"
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    maxWidth: '80px',
                    maxHeight: '80px'
                }}
            >
                <Image
                    src={furniture.imagePath}
                    alt={furniture.name}
                    fill
                    className="object-contain"
                    onError={(e) => {
                        // Fallback to a placeholder if image doesn't exist
                        const target = e.target as HTMLImageElement;
                        target.src = '/furniture/placeholder.svg';
                    }}
                />
            </div>
        </div>
    );
}
