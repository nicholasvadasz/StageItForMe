"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import S3Image from "@/components/S3Image";

export default function Dashboard() {
  const { data: session, status } = useSession();
  
  // Use Convex to get user's photos in real-time
  const photos = useQuery(
    api.photos.getByUserId,
    session?.user?.id ? { userId: session.user.id } : "skip"
  );

  const projects = useQuery(
    api.projects.getByUserId,
    session?.user?.id ? { userId: session.user.id } : "skip"
  );

  if (status === "loading" || photos === undefined) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="mb-4">Please sign in to access your dashboard</p>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {session.user?.name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-gray-600 mt-2">
            {photos && photos.length > 0 
              ? `You have ${photos.length} photos ready for virtual staging`
              : "Upload your first room photos to get started with AI-powered staging"
            }
          </p>
        </div>
        <Button asChild>
          <Link href="/project/1">View All Photos</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{photos?.length || 0}</CardTitle>
            <CardDescription>Total Photos</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">0</CardTitle>
            <CardDescription>Staged Images</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">1</CardTitle>
            <CardDescription>Active Projects</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Pro</CardTitle>
            <CardDescription>Current Plan</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Photos */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Recent Photos</h2>
          {photos && photos.length > 0 && (
            <Button variant="outline" asChild>
              <Link href="/project/1">View All</Link>
            </Button>
          )}
        </div>

        {!photos || photos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-4xl">📸</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
              <p className="text-gray-600 text-center mb-4 max-w-md">
                Upload your first room photos to start creating stunning virtual staged images with AI
              </p>
              <Button asChild>
                <Link href="/project/1">Upload Photos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {photos.slice(0, 8).map((photo) => (
              <Link key={photo._id} href={`/editor/${photo._id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-3">
                    <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                      <S3Image
                        s3Key={photo.s3Key}
                        alt={photo.filename}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    </div>
                    <p className="text-sm font-medium truncate" title={photo.filename}>
                      {photo.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(photo.uploadedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-2xl">📸</span>
            </div>
            <h3 className="font-semibold mb-2">Upload Photos</h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Add new room photos to stage
            </p>
            <Button asChild>
              <Link href="/project/1">Upload</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="font-semibold mb-2">AI Staging</h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Transform empty rooms with AI
            </p>
            <Button asChild disabled={!photos || photos.length === 0}>
              <Link href={photos && photos.length > 0 ? `/editor/${photos[0]._id}` : "#"}>
                Stage Now
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-gray-300 hover:border-purple-500 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-2xl">⚙️</span>
            </div>
            <h3 className="font-semibold mb-2">Account Settings</h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Manage subscription and profile
            </p>
            <Button variant="outline" asChild>
              <Link href="/settings">Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}