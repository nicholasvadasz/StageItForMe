import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic environment check
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const deployKey = process.env.CONVEX_DEPLOY_KEY;

    if (!convexUrl) {
      return NextResponse.json({
        success: false,
        error: 'NEXT_PUBLIC_CONVEX_URL not set',
        convex_configured: false
      });
    }

    // For now, just return connection status
    // In a real implementation, you'd import and test Convex client
    return NextResponse.json({
      success: true,
      convex_configured: true,
      url: convexUrl,
      deploy_key_set: !!deployKey,
      schema_tables: ['users', 'projects', 'photos', 'stagingEdits'],
      note: 'Full Convex integration requires running `npx convex dev`'
    });

  } catch (error) {
    console.error('Convex test error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Convex test failed',
      success: false
    }, { status: 500 });
  }
}