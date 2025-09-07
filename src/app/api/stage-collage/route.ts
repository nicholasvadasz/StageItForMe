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

        const originalImageFile = formData.get('originalImage') as File;
        const collageImageFile = formData.get('collageImage') as File;

        if (!originalImageFile || !collageImageFile) {
            return NextResponse.json(
                { success: false, error: 'Both original and collage images are required' },
                { status: 400 }
            );
        }

        // Convert files to buffers
        const originalImageBuffer = Buffer.from(await originalImageFile.arrayBuffer());
        const collageImageBuffer = Buffer.from(await collageImageFile.arrayBuffer());

        // Stage the room using collage
        const result = await virtualStagingService.stageRoomWithCollage(
            originalImageBuffer,
            collageImageBuffer,
            originalImageFile.type
        );

        if (!result.success || !result.imageBuffer) {
            return NextResponse.json(
                { success: false, error: result.error || 'Staging failed' },
                { status: 500 }
            );
        }

        // Upload staged image to S3
        const filename = `staged_collage_${randomBytes(8).toString('hex')}.jpg`;
        const s3Key = generateS3Key(userInfo.user.id, filename, 'staged');
        await uploadToS3(result.imageBuffer, s3Key, 'image/jpeg');

        // Also save the collage image for debugging/preview
        const collageFilename = `collage_preview_${randomBytes(8).toString('hex')}.jpg`;
        const collageS3Key = generateS3Key(userInfo.user.id, collageFilename, 'staged');
        await uploadToS3(collageImageBuffer, collageS3Key, 'image/jpeg');

        // Generate signed URLs for both images
        const stagedImageUrl = await getSignedDownloadUrl(s3Key);
        const collagePreviewUrl = await getSignedDownloadUrl(collageS3Key);

        return NextResponse.json({
            success: true,
            stagedImageUrl,
            collagePreviewUrl, // Include the collage preview URL
            prompt: result.prompt,
            s3Key,
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
