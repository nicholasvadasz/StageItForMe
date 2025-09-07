import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToS3, generateS3Key } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ 
        error: 'No images provided' 
      }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      // Generate S3 key for this user
      const s3Key = generateS3Key(session.user.id, file.name, 'original');
      
      // Upload to S3
      const imageUrl = await uploadToS3(imageBuffer, s3Key, file.type);

      return {
        filename: file.name,
        s3Key,
        imageUrl,
        size: file.size,
        type: file.type,
        id: s3Key.replace(/[^a-zA-Z0-9]/g, '_'),
      };
    });

    const uploadResults = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      uploads: uploadResults,
      count: uploadResults.length,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, { status: 500 });
  }
}