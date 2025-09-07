"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, use } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import S3Image from "@/components/S3Image";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface UserImage {
  id: string;
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
  key: string;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { data: session, status } = useSession();
  const resolvedParams = use(params);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use Convex to get photos and manage data
  const photos = useQuery(
    api.photos.getByUserId,
    session?.user?.id ? { userId: session.user.id } : "skip"
  );

  const createUser = useMutation(api.users.create);
  const createProject = useMutation(api.projects.create);
  const createPhoto = useMutation(api.photos.create);
  const getProjects = useQuery(
    api.projects.getByUserId,
    session?.user?.id ? { userId: session.user.id } : "skip"
  );

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !session?.user?.id) return;

    setUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      // Ensure user exists
      await createUser({
        userId: session.user.id,
        email: session.user.email!,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
      });

      // Get or create default project
      let projectId;
      if (!getProjects || getProjects.length === 0) {
        projectId = await createProject({
          name: "My Photos",
          description: "Default project for uploaded photos",
          userId: session.user.id,
        });
      } else {
        projectId = getProjects[0]._id;
      }

      // Upload to S3
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        // Store each uploaded image metadata in Convex
        for (const upload of data.uploads) {
          await createPhoto({
            projectId,
            userId: session.user.id,
            filename: upload.filename,
            originalUrl: upload.imageUrl,
            s3Key: upload.s3Key,
            fileSize: upload.size,
          });
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (status === "loading" || photos === undefined) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="mb-4">Please sign in to view your projects</p>
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
          <h1 className="text-3xl font-bold">Your Photos</h1>
          <p className="text-gray-600 mt-2">
            {photos && photos.length > 0 
              ? `${photos.length} photos • Click any photo to start staging`
              : "Upload photos to get started with virtual staging"
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Photos'}
          </Button>
        </div>
      </div>

      {!photos || photos.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-4xl">📸</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
            <p className="text-gray-600 mb-4">
              Upload your first room photos to start creating stunning virtual staged images
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Your First Photo'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <Link key={photo._id} href={`/editor/${photo._id}`}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
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
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(photo.fileSize)} • {formatDate(photo.uploadedAt)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard">← Back to Dashboard</Link>
        </Button>
        {photos && photos.length > 0 && (
          <Button asChild>
            <Link href={`/editor/${photos[0]._id}`}>Start Staging First Photo</Link>
          </Button>
        )}
      </div>
    </div>
  );
}