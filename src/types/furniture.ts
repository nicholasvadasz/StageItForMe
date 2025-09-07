export type RoomType = 'living-room' | 'bedroom' | 'kitchen' | 'dining-room' | 'bathroom' | 'office';

export interface FurnitureItem {
    id: string;
    name: string;
    category: string;
    roomType: RoomType;
    imagePath: string;
    style?: string;
    baseSize?: number; // Base size as percentage of smaller canvas dimension (default: 8)
}

export interface DroppedFurniture {
    id: string;
    furnitureId: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
}

export interface CollageData {
    originalImageUrl: string;
    droppedFurniture: DroppedFurniture[];
    canvasWidth: number;
    canvasHeight: number;
}
