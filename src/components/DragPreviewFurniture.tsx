import { FurnitureItem } from '@/types/furniture';
import { useImageAspectRatio } from '@/hooks/useImageAspectRatio';
import Image from 'next/image';

interface DragPreviewFurnitureProps {
    furniture: FurnitureItem;
    canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function DragPreviewFurniture({ furniture, canvasRef }: DragPreviewFurnitureProps) {
    const { aspectRatio, isLoading } = useImageAspectRatio(furniture.imagePath);

    // Calculate the size that the furniture will have when dropped (same logic as DroppedFurnitureItem)
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

        const baseSize = minDimension * (furnitureBaseSize / 100); // scale = 1 for drag preview

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
            className="relative drop-shadow-lg"
            style={{
                width: `${width}px`,
                height: `${height}px`
            }}
        >
            <Image
                src={furniture.imagePath}
                alt={furniture.name}
                fill
                className="object-contain"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/furniture/placeholder.svg';
                }}
            />
        </div>
    );
}
