import { useDroppable } from '@dnd-kit/core';
import { DroppedFurniture, FurnitureItem } from '@/types/furniture';
import { getFurnitureById } from '@/data/furniture';
import { useImageAspectRatio } from '@/hooks/useImageAspectRatio';
import Image from 'next/image';
import S3Image from './S3Image';

interface DroppableCanvasProps {
    imageKey: string;
    imageAlt: string;
    droppedFurniture: DroppedFurniture[];
    onRemoveFurniture: (id: string) => void;
    canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function DroppableCanvas({
    imageKey,
    imageAlt,
    droppedFurniture,
    onRemoveFurniture,
    canvasRef
}: DroppableCanvasProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: 'canvas',
    });

    return (
        <div
            ref={(node) => {
                setNodeRef(node);
                if (canvasRef && node) {
                    canvasRef.current = node;
                }
            }}
            className={`
        relative aspect-video bg-white border-2 rounded-lg overflow-hidden
        ${isOver ? 'border-blue-400' : 'border-gray-300'}
        transition-colors duration-200
      `}
        >
            {/* Background Image */}
            <S3Image
                s3Key={imageKey}
                alt={imageAlt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 80vw"
            />

            {/* Dropped Furniture Items */}
            {droppedFurniture.map((item) => {
                const furniture = getFurnitureById(item.furnitureId);
                if (!furniture) return null;

                return (
                    <DroppedFurnitureItem
                        key={item.id}
                        furniture={furniture}
                        position={item}
                        onRemove={() => onRemoveFurniture(item.id)}
                        canvasRef={canvasRef}
                    />
                );
            })}

            {/* Drop Zone Indicator */}
            {isOver && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
                        Drop furniture here
                    </div>
                </div>
            )}
        </div>
    );
}

interface DroppedFurnitureItemProps {
    furniture: FurnitureItem;
    position: DroppedFurniture;
    onRemove: () => void;
    canvasRef: React.RefObject<HTMLDivElement | null>;
}

function DroppedFurnitureItem({ furniture, position, onRemove, canvasRef }: DroppedFurnitureItemProps) {
    const { aspectRatio, isLoading } = useImageAspectRatio(furniture.imagePath);

    // Use the furniture's custom size and aspect ratio
    const getSize = () => {
        const furnitureBaseSize = furniture.baseSize || 8; // Default to 8%

        let minDimension: number;

        if (!canvasRef.current) {
            // Fallback calculation if canvas ref not available
            const viewportSize = Math.min(window.innerWidth, window.innerHeight);
            minDimension = viewportSize * 0.4; // Approximate canvas size
        } else {
            const rect = canvasRef.current.getBoundingClientRect();
            minDimension = Math.min(rect.width, rect.height);
        }

        const baseSize = minDimension * (furnitureBaseSize / 100) * position.scale;

        // Apply aspect ratio correctly
        // aspectRatio = width / height, so if aspectRatio > 1, it's wider than tall
        let width: number, height: number;
        if (isLoading) {
            // Show square while loading
            width = baseSize;
            height = baseSize;
        } else if (aspectRatio >= 1) {
            // Wider than tall - use baseSize as width, calculate height
            width = baseSize;
            height = baseSize / aspectRatio;
        } else {
            // Taller than wide - use baseSize as height, calculate width
            height = baseSize;
            width = baseSize * aspectRatio;
        }

        return { width, height };
    };

    const { width, height } = getSize();

    return (
        <div
            className="absolute group cursor-pointer"
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: `translate(-50%, -50%) rotate(${position.rotation}deg)`,
                width: `${width}px`,
                height: `${height}px`,
            }}
            onClick={onRemove}
        >
            <Image
                src={furniture.imagePath}
                alt={furniture.name}
                fill
                className="object-contain drop-shadow-md"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/furniture/placeholder.svg';
                }}
            />

            {/* Remove button on hover */}
            <button
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200
                   flex items-center justify-center text-xs font-bold
                   hover:bg-red-600"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
            >
                ×
            </button>
        </div>
    );
}
