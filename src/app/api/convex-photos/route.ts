import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, ...data } = await request.json();

    switch (action) {
      case 'createUser':
        const user = await convex.mutation(api.users.create, {
          userId: session.user.id,
          email: session.user.email!,
          name: session.user.name || undefined,
          image: session.user.image || undefined,
        });
        return NextResponse.json({ success: true, user });

      case 'getProjects':
        const projects = await convex.query(api.projects.getByUserId, {
          userId: session.user.id
        });
        return NextResponse.json({ success: true, projects });

      case 'createProject':
        const project = await convex.mutation(api.projects.create, {
          name: data.name || "My Photos",
          description: data.description || "Default project for uploaded photos",
          userId: session.user.id,
        });
        return NextResponse.json({ success: true, project });

      case 'createPhoto':
        const photo = await convex.mutation(api.photos.create, data);
        return NextResponse.json({ success: true, photo });

      case 'getPhotos':
        const photos = await convex.query(api.photos.getByUserId, {
          userId: session.user.id
        });
        return NextResponse.json({ success: true, photos });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Convex API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}