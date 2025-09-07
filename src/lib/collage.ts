import { DroppedFurniture, CollageData } from '@/types/furniture';
import { getFurnitureById } from '@/data/furniture';

// Helper function to get image aspect ratio
async function getImageAspectRatio(imagePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const ratio = img.naturalWidth / img.naturalHeight;
            resolve(ratio);
        };

        img.onerror = () => {
            // Fallback to square aspect ratio
            resolve(1);
        };

        img.src = imagePath;
    });
}

export async function createCollageCanvas(
    originalImageUrl: string,
    droppedFurniture: DroppedFurniture[]
): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    // Load the original image first to get its natural dimensions
    const originalImage = new Image();
    originalImage.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
        originalImage.onload = resolve;
        originalImage.onerror = reject;
        originalImage.src = originalImageUrl;
    });

    // Set canvas to match the original image dimensions exactly
    canvas.width = originalImage.naturalWidth;
    canvas.height = originalImage.naturalHeight;

    // Draw the original image at full size (no scaling or letterboxing)
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    // Load and draw each furniture item
    for (const item of droppedFurniture) {
        const furniture = getFurnitureById(item.furnitureId);
        if (!furniture) continue;

        const furnitureImage = new Image();
        furnitureImage.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
            furnitureImage.onload = resolve;
            furnitureImage.onerror = () => {
                // Skip if furniture image fails to load
                resolve(null);
            };
            furnitureImage.src = furniture.imagePath;
        });

        if (furnitureImage.complete && furnitureImage.naturalWidth > 0) {
            const furnitureX = (item.x / 100) * canvas.width;
            const furnitureY = (item.y / 100) * canvas.height;

            // Use furniture's custom size or default to 8%
            const furnitureBaseSize = furniture.baseSize || 8;

            // Get aspect ratio from the actual image
            const aspectRatio = await getImageAspectRatio(furniture.imagePath);

            // Calculate size based on canvas dimensions and furniture's base size
            const minDimension = Math.min(canvas.width, canvas.height);
            const baseSize = minDimension * (furnitureBaseSize / 100) * item.scale;

            // Apply aspect ratio correctly
            // aspectRatio = width / height, so if aspectRatio > 1, it's wider than tall
            let width: number, height: number;
            if (aspectRatio >= 1) {
                // Wider than tall - use baseSize as width, calculate height
                width = baseSize;
                height = baseSize / aspectRatio;
            } else {
                // Taller than wide - use baseSize as height, calculate width  
                height = baseSize;
                width = baseSize * aspectRatio;
            }

            ctx.save();
            ctx.translate(furnitureX, furnitureY);
            ctx.rotate((item.rotation * Math.PI) / 180);
            ctx.drawImage(
                furnitureImage,
                -width / 2,
                -height / 2,
                width,
                height
            );
            ctx.restore();
        }
    }

    return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.9): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob from canvas'));
                }
            },
            'image/jpeg',
            quality
        );
    });
}

export async function createCollageBlob(
    originalImageUrl: string,
    droppedFurniture: DroppedFurniture[]
): Promise<Blob> {
    const canvas = await createCollageCanvas(originalImageUrl, droppedFurniture);
    return canvasToBlob(canvas);
}
