import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, generateS3Key } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ 
        error: 'No image provided' 
      }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await image.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Generate S3 key
    const s3Key = generateS3Key('test-user', image.name, 'original');
    
    // Upload to S3
    const imageUrl = await uploadToS3(imageBuffer, s3Key, image.type);

    return NextResponse.json({
      success: true,
      imageUrl,
      s3Key,
      fileSize: image.size,
      fileName: image.name,
      contentType: image.type,
    });

  } catch (error) {
    console.error('S3 test error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'S3 upload failed',
      details: 'Check AWS credentials and bucket configuration'
    }, { status: 500 });
  }
}