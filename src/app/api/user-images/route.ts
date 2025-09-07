import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedDownloadUrl } from '@/lib/s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: NextRequest) {
  try {
    const userInfo = await withAuth();
    if (!userInfo?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = userInfo.user.id;
    const bucketName = process.env.AWS_S3_BUCKET_NAME!;

    // List objects in user's directory
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `original/${userId}/`,
      MaxKeys: 100,
    });

    const listResult = await s3Client.send(listCommand);

    if (!listResult.Contents) {
      return NextResponse.json({ images: [] });
    }

    // Generate signed URLs for each image
    const images = await Promise.all(
      listResult.Contents
        .filter(obj => obj.Key && obj.Key.match(/\.(jpg|jpeg|png|gif|webp)$/i))
        .map(async (obj) => {
          const signedUrl = await getSignedDownloadUrl(obj.Key!);

          return {
            key: obj.Key,
            filename: obj.Key!.split('/').pop(),
            uploadedAt: obj.LastModified,
            size: obj.Size,
            url: signedUrl,
            id: obj.Key!.replace(/[^a-zA-Z0-9]/g, '_'),
          };
        })
    );

    return NextResponse.json({
      images,
      count: images.length,
      userId
    });

  } catch (error) {
    console.error('Error fetching user images:', error);
    return NextResponse.json({
      error: 'Failed to fetch images'
    }, { status: 500 });
  }
}