import { RoomType } from '@/types/furniture';
import { getFurnitureByRoom } from '@/data/furniture';
import { DraggableFurniture } from './DraggableFurniture';

interface FurniturePaletteProps {
    roomType: RoomType;
    selectedStyle?: string;
}

export function FurniturePalette({ roomType, selectedStyle }: FurniturePaletteProps) {
    const furniture = getFurnitureByRoom(roomType);

    // Filter by style if provided
    const filteredFurniture = selectedStyle
        ? furniture.filter(item => item.style === selectedStyle)
        : furniture;

    const categories = Array.from(new Set(filteredFurniture.map(item => item.category)));

    return (
        <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700">
                Drag furniture onto the image
            </div>

            {categories.map(category => {
                const categoryItems = filteredFurniture.filter(item => item.category === category);

                return (
                    <div key={category} className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            {category}
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                            {categoryItems.map(furniture => (
                                <div key={furniture.id} className="flex flex-col items-center space-y-1">
                                    <DraggableFurniture furniture={furniture} />
                                    <div className="text-xs text-center text-gray-600">
                                        <div className="font-medium truncate w-16">{furniture.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {filteredFurniture.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No furniture items available</p>
                    <p className="text-xs mt-1">
                        Add furniture images to the <code>/public/furniture/{roomType}/</code> folder
                    </p>
                </div>
            )}
        </div>
    );
}
