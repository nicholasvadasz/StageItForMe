import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { getSignedDownloadUrl } from '@/lib/s3';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const photoId = resolvedParams.id as Id<"photos">;

    // Get the photo from Convex
    const photo = await convex.query(api.photos.getById, { id: photoId });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Verify user owns this photo
    if (photo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate signed URL for the S3 object
    const signedUrl = await getSignedDownloadUrl(photo.s3Key);

    // Return photo data in the format expected by the editor
    const image = {
      id: photo._id,
      filename: photo.filename,
      url: signedUrl,
      size: photo.fileSize,
      uploadedAt: photo.uploadedAt,
      key: photo.s3Key,
    };

    return NextResponse.json({ image });

  } catch (error) {
    console.error('Get photo error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch photo' 
    }, { status: 500 });
  }
}