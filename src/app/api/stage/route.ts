import { NextRequest, NextResponse } from 'next/server';
import { virtualStagingService, StagingOptions } from '@/lib/gemini';
import { uploadToS3, generateS3Key } from '@/lib/s3';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function POST(request: NextRequest) {
  try {
    const userInfo = await withAuth();
    if (!userInfo?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const optionsJson = formData.get('options') as string;

    if (!image || !optionsJson) {
      return NextResponse.json({
        error: 'Missing required fields: image and options'
      }, { status: 400 });
    }

    // Parse staging options
    const options: StagingOptions = JSON.parse(optionsJson);

    // Convert file to buffer
    const arrayBuffer = await image.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Stage the image with Gemini
    const result = await virtualStagingService.stageRoom(
      imageBuffer,
      image.type,
      options
    );

    if (!result.success || !result.imageBuffer) {
      return NextResponse.json({
        error: result.error || 'Failed to stage image'
      }, { status: 500 });
    }

    // Upload staged image to S3
    const s3Key = generateS3Key(userInfo.user.id, `staged_${image.name}`, 'staged');
    await uploadToS3(result.imageBuffer, s3Key, 'image/png');

    // Generate a signed URL for the staged image
    const { getSignedDownloadUrl } = await import('@/lib/s3');
    const stagedImageUrl = await getSignedDownloadUrl(s3Key);

    return NextResponse.json({
      success: true,
      stagedImageUrl,
      originalPrompt: result.prompt,
      s3Key,
    });

  } catch (error) {
    console.error('Staging API error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userInfo = await withAuth();
    if (!userInfo?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const originalImage = formData.get('originalImage') as File;
    const stagedImage = formData.get('stagedImage') as File;
    const refinements = formData.get('refinements') as string;

    if (!originalImage || !stagedImage || !refinements) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Convert files to buffers
    const originalBuffer = Buffer.from(await originalImage.arrayBuffer());
    const stagedBuffer = Buffer.from(await stagedImage.arrayBuffer());

    // Refine the staged image
    const result = await virtualStagingService.refineStaging(
      originalBuffer,
      stagedBuffer,
      stagedImage.type,
      refinements
    );

    if (!result.success || !result.imageBuffer) {
      return NextResponse.json({
        error: result.error || 'Failed to refine staging'
      }, { status: 500 });
    }

    // Upload refined image to S3
    const s3Key = generateS3Key(userInfo.user.id, `refined_${stagedImage.name}`, 'staged');
    const refinedImageUrl = await uploadToS3(result.imageBuffer, s3Key, 'image/png');

    return NextResponse.json({
      success: true,
      refinedImageUrl,
      refinementPrompt: result.prompt,
    });

  } catch (error) {
    console.error('Refinement API error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}