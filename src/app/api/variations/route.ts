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
    const baseOptionsJson = formData.get('baseOptions') as string;
    const variationsJson = formData.get('variations') as string;

    if (!image || !baseOptionsJson || !variationsJson) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Parse options
    const baseOptions: StagingOptions = JSON.parse(baseOptionsJson);
    const variations: Partial<StagingOptions>[] = JSON.parse(variationsJson);

    // Convert file to buffer
    const arrayBuffer = await image.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Generate variations
    const results = await virtualStagingService.generateVariations(
      imageBuffer,
      image.type,
      baseOptions,
      variations
    );

    // Upload successful results to S3
    const uploadPromises = results.map(async (result, index) => {
      if (result.success && result.imageBuffer) {
        const s3Key = generateS3Key(
          userInfo.user.id,
          `variation_${index}_${image.name}`,
          'staged'
        );
        const url = await uploadToS3(result.imageBuffer, s3Key, 'image/png');
        return {
          success: true,
          imageUrl: url,
          prompt: result.prompt,
          variation: variations[index],
        };
      }
      return {
        success: false,
        error: result.error,
        variation: variations[index],
      };
    });

    const uploadResults = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      variations: uploadResults,
      totalGenerated: results.filter(r => r.success).length,
    });

  } catch (error) {
    console.error('Variations API error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}