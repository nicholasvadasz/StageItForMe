import { NextRequest, NextResponse } from 'next/server';
import { virtualStagingService } from '@/lib/gemini';
import { uploadToS3, generateS3Key, getSignedDownloadUrl } from '@/lib/s3';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const userInfo = await withAuth();
        if (!userInfo?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();

        const furnitureContactSheetFile = formData.get('furnitureContactSheet') as File;
        const originalImageFile = formData.get('originalImage') as File;
        const collageImageFile = formData.get('collageImage') as File;
        const furnitureNamesParam = formData.get('furnitureNames') as string;

        if (!furnitureContactSheetFile || !originalImageFile || !collageImageFile || !furnitureNamesParam) {
            return NextResponse.json(
                { success: false, error: 'Furniture contact sheet, original image, collage image, and furniture names are required' },
                { status: 400 }
            );
        }

        // Parse furniture names
        const furnitureNames = JSON.parse(furnitureNamesParam);

        // Convert files to buffers
        const furnitureContactSheetBuffer = Buffer.from(await furnitureContactSheetFile.arrayBuffer());
        const originalImageBuffer = Buffer.from(await originalImageFile.arrayBuffer());
        const collageImageBuffer = Buffer.from(await collageImageFile.arrayBuffer());

        // Step 1: Identify furniture locations from the collage
        const locationResult = await virtualStagingService.identifyFurnitureLocations(
            collageImageBuffer,
            furnitureNames,
            collageImageFile.type
        );

        if (!locationResult.success || !locationResult.locations) {
            return NextResponse.json(
                { success: false, error: locationResult.error || 'Failed to identify furniture locations' },
                { status: 500 }
            );
        }

        // Step 2: Stage the room using the contact sheet, original image, and identified locations
        const stagingResult = await virtualStagingService.stageRoomWithLocations(
            furnitureContactSheetBuffer,
            originalImageBuffer,
            locationResult.locations,
            furnitureContactSheetFile.type
        );

        if (!stagingResult.success || !stagingResult.imageBuffer) {
            return NextResponse.json(
                { success: false, error: stagingResult.error || 'Staging failed' },
                { status: 500 }
            );
        }

        // Upload staged image to S3
        const filename = `staged_collage_${randomBytes(8).toString('hex')}.jpg`;
        const s3Key = generateS3Key(userInfo.user.id, filename, 'staged');
        await uploadToS3(stagingResult.imageBuffer, s3Key, 'image/jpeg');

        // Save the contact sheet for debugging/preview
        const contactSheetFilename = `contact_sheet_${randomBytes(8).toString('hex')}.jpg`;
        const contactSheetS3Key = generateS3Key(userInfo.user.id, contactSheetFilename, 'staged');
        await uploadToS3(furnitureContactSheetBuffer, contactSheetS3Key, 'image/jpeg');

        // Save the collage for debugging/preview
        const collageFilename = `collage_${randomBytes(8).toString('hex')}.jpg`;
        const collageS3Key = generateS3Key(userInfo.user.id, collageFilename, 'staged');
        await uploadToS3(collageImageBuffer, collageS3Key, 'image/jpeg');

        // Generate signed URLs for all images
        const stagedImageUrl = await getSignedDownloadUrl(s3Key);
        const contactSheetPreviewUrl = await getSignedDownloadUrl(contactSheetS3Key);
        const collagePreviewUrl = await getSignedDownloadUrl(collageS3Key);

        return NextResponse.json({
            success: true,
            stagedImageUrl,
            contactSheetPreviewUrl,
            collagePreviewUrl,
            furnitureLocations: locationResult.locations,
            prompt: stagingResult.prompt,
            s3Key,
            contactSheetS3Key,
            collageS3Key,
        });

    } catch (error) {
        console.error('Collage staging error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
