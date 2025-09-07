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

export async function createFurnitureContactSheet(
    originalImageUrl: string,
    droppedFurniture: DroppedFurniture[]
): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    // Load the original image first to get its dimensions for aspect ratio
    const originalImage = new Image();
    originalImage.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
        originalImage.onload = resolve;
        originalImage.onerror = reject;
        originalImage.src = originalImageUrl;
    });

    // Set canvas to match the original image aspect ratio
    const originalAspectRatio = originalImage.naturalWidth / originalImage.naturalHeight;
    const baseHeight = 800; // Fixed height
    canvas.width = baseHeight * originalAspectRatio;
    canvas.height = baseHeight;

    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate grid layout for furniture pieces
    const furnitureCount = droppedFurniture.length;
    const cols = Math.ceil(Math.sqrt(furnitureCount));
    const rows = Math.ceil(furnitureCount / cols);

    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;
    const padding = Math.min(cellWidth, cellHeight) * 0.1; // 10% padding

    // Draw each furniture item in grid layout with names
    for (let i = 0; i < droppedFurniture.length; i++) {
        const item = droppedFurniture[i];
        const furniture = getFurnitureById(item.furnitureId);
        if (!furniture) continue;

        const col = i % cols;
        const row = Math.floor(i / cols);

        const cellX = col * cellWidth;
        const cellY = row * cellHeight;
        const centerX = cellX + cellWidth / 2;
        const centerY = cellY + cellHeight / 2;

        try {
            // Load furniture image
            const furnitureImage = new Image();
            furnitureImage.crossOrigin = 'anonymous';

            await new Promise((resolve, reject) => {
                furnitureImage.onload = resolve;
                furnitureImage.onerror = () => resolve(null); // Skip if fails to load
                furnitureImage.src = furniture.imagePath;
            });

            if (furnitureImage.complete && furnitureImage.naturalWidth > 0) {
                // Calculate furniture size to fit in cell with padding, leaving space for text
                const availableWidth = cellWidth - padding * 2;
                const availableHeight = cellHeight - padding * 3; // Extra space for text

                const furnitureAspectRatio = furnitureImage.naturalWidth / furnitureImage.naturalHeight;

                let furnitureWidth, furnitureHeight;
                if (furnitureAspectRatio > availableWidth / availableHeight) {
                    // Width-constrained
                    furnitureWidth = availableWidth;
                    furnitureHeight = availableWidth / furnitureAspectRatio;
                } else {
                    // Height-constrained
                    furnitureHeight = availableHeight;
                    furnitureWidth = availableHeight * furnitureAspectRatio;
                }

                // Draw furniture image
                const furnitureY = cellY + padding;
                ctx.drawImage(
                    furnitureImage,
                    centerX - furnitureWidth / 2,
                    furnitureY,
                    furnitureWidth,
                    furnitureHeight
                );

                // Draw furniture name below the image
                const textSize = Math.min(cellWidth, cellHeight) * 0.08;
                const textY = furnitureY + furnitureHeight + padding;

                ctx.fillStyle = 'black';
                ctx.font = `${textSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';

                // Wrap text if needed
                const maxTextWidth = cellWidth - padding * 2;
                const words = furniture.name.split(' ');
                let line = '';
                let lineY = textY;

                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;

                    if (testWidth > maxTextWidth && n > 0) {
                        ctx.fillText(line, centerX, lineY);
                        line = words[n] + ' ';
                        lineY += textSize * 1.2;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, centerX, lineY);
            }

        } catch (error) {
            console.error(`Failed to process furniture ${i + 1}:`, error);
        }
    }

    return canvas;
}

export async function createAnnotatedRoomImage(
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

    // Draw the original image at full size
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    // Add furniture name annotations at placement positions
    droppedFurniture.forEach((item, index) => {
        const furniture = getFurnitureById(item.furnitureId);
        if (!furniture) return;

        const annotationX = (item.x / 100) * canvas.width;
        const annotationY = (item.y / 100) * canvas.height;

        // Calculate text size based on canvas dimensions
        const textSize = Math.min(canvas.width, canvas.height) * 0.025;

        // Draw text background rectangle
        ctx.font = `bold ${textSize}px Arial`;
        const textMetrics = ctx.measureText(furniture.name);
        const textWidth = textMetrics.width;
        const textHeight = textSize;
        const padding = textSize * 0.3;

        // Background rectangle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(
            annotationX - textWidth / 2 - padding,
            annotationY - textHeight / 2 - padding,
            textWidth + padding * 2,
            textHeight + padding * 2
        );

        // Border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            annotationX - textWidth / 2 - padding,
            annotationY - textHeight / 2 - padding,
            textWidth + padding * 2,
            textHeight + padding * 2
        );

        // Text
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(furniture.name, annotationX, annotationY);
    });

    return canvas;
}

export async function createFurnitureContactSheetBlob(
    originalImageUrl: string,
    droppedFurniture: DroppedFurniture[]
): Promise<Blob> {
    const canvas = await createFurnitureContactSheet(originalImageUrl, droppedFurniture);
    return canvasToBlob(canvas);
}

export async function createAnnotatedRoomBlob(
    originalImageUrl: string,
    droppedFurniture: DroppedFurniture[]
): Promise<Blob> {
    const canvas = await createAnnotatedRoomImage(originalImageUrl, droppedFurniture);
    return canvasToBlob(canvas);
}

export async function createCollageBlob(
    originalImageUrl: string,
    droppedFurniture: DroppedFurniture[]
): Promise<Blob> {
    const canvas = await createCollageCanvas(originalImageUrl, droppedFurniture);
    return canvasToBlob(canvas);
}
