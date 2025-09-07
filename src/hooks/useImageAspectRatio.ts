import { useState, useEffect } from 'react';

export function useImageAspectRatio(imagePath: string) {
    const [aspectRatio, setAspectRatio] = useState<number>(1); // Default to square
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!imagePath) {
            setAspectRatio(1);
            setIsLoading(false);
            return;
        }

        const img = new Image();

        img.onload = () => {
            const ratio = img.naturalWidth / img.naturalHeight;
            setAspectRatio(ratio);
            setIsLoading(false);
            setError(null);
        };

        img.onerror = () => {
            setError(`Failed to load image: ${imagePath}`);
            setAspectRatio(1); // Fallback to square
            setIsLoading(false);
        };

        img.src = imagePath;

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [imagePath]);

    return { aspectRatio, isLoading, error };
}

// Hook for multiple images
export function useMultipleImageAspectRatios(imagePaths: string[]) {
    const [aspectRatios, setAspectRatios] = useState<{ [path: string]: number }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState<{ [path: string]: string }>({});

    useEffect(() => {
        if (!imagePaths.length) {
            setIsLoading(false);
            return;
        }

        let loadedCount = 0;
        const totalCount = imagePaths.length;
        const newAspectRatios: { [path: string]: number } = {};
        const newErrors: { [path: string]: string } = {};

        const checkComplete = () => {
            loadedCount++;
            if (loadedCount === totalCount) {
                setAspectRatios(newAspectRatios);
                setErrors(newErrors);
                setIsLoading(false);
            }
        };

        imagePaths.forEach((imagePath) => {
            const img = new Image();

            img.onload = () => {
                const ratio = img.naturalWidth / img.naturalHeight;
                newAspectRatios[imagePath] = ratio;
                checkComplete();
            };

            img.onerror = () => {
                newErrors[imagePath] = `Failed to load image: ${imagePath}`;
                newAspectRatios[imagePath] = 1; // Fallback to square
                checkComplete();
            };

            img.src = imagePath;
        });

        return () => {
            // Cleanup is handled by individual image load handlers
        };
    }, [imagePaths]);

    return { aspectRatios, isLoading, errors };
}
