import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSignedDownloadUrl } from '@/lib/s3';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const s3Key = searchParams.get('key');

    if (!s3Key) {
      return NextResponse.json({ error: 'Missing S3 key' }, { status: 400 });
    }

    // Verify the user owns this image (basic security check)
    if (!s3Key.includes(`/${session.user.id}/`)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const signedUrl = await getSignedDownloadUrl(s3Key, 3600); // 1 hour expiry
    
    return NextResponse.json({ signedUrl });

  } catch (error) {
    console.error('Signed URL error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate signed URL' 
    }, { status: 500 });
  }
}