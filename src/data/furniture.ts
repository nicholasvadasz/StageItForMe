import { FurnitureItem, RoomType } from '@/types/furniture';

// In a real application, this would come from a database or API
export const furnitureDatabase: FurnitureItem[] = [
    // Living Room
    {
        id: 'eames',
        name: 'Eames Lounge Chair',
        category: 'Seating',
        roomType: 'bedroom',
        imagePath: '/furniture/bedroom/eames.png',
        style: 'modern',
        baseSize: 50, // 6% of smaller dimension - compact chair
    },
    {
        id: 'lamp',
        name: 'Tiffany Floor Lamp',
        category: 'Lighting',
        roomType: 'bedroom',
        imagePath: '/furniture/bedroom/lamp.png',
        style: 'modern',
        baseSize: 30, // 3% of smaller dimension - tall but narrow
    },
    {
        id: 'glasstable',
        name: 'Glass Coffee Table',
        category: 'Tables',
        roomType: 'bedroom',
        imagePath: '/furniture/bedroom/glasstable.png',
        style: 'modern',
        baseSize: 20, // 10% of smaller dimension - larger table
    }
];

export const getFurnitureByRoom = (roomType: RoomType): FurnitureItem[] => {
    return furnitureDatabase.filter(item => item.roomType === roomType);
};

export const getFurnitureByRoomAndStyle = (roomType: RoomType, style?: string): FurnitureItem[] => {
    let items = getFurnitureByRoom(roomType);

    if (style) {
        items = items.filter(item => item.style === style);
    }

    return items;
};

export const getFurnitureById = (id: string): FurnitureItem | undefined => {
    return furnitureDatabase.find(item => item.id === id);
};
