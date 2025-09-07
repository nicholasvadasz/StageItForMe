"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import S3Image from "@/components/S3Image";

interface EditorPageProps {
  params: Promise<{
    photoId: string;
  }>;
}

interface ImageData {
  id: string;
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
  key: string;
}

type RoomType = 'living-room' | 'bedroom' | 'kitchen' | 'dining-room' | 'bathroom' | 'office';
type FurnitureStyle = 'modern' | 'traditional' | 'minimalist' | 'rustic' | 'industrial' | 'scandinavian';
type Lighting = 'bright' | 'warm' | 'natural' | 'dramatic';

export default function EditorPage({ params }: EditorPageProps) {
  const { data: session, status } = useSession();
  const resolvedParams = use(params);
  const [image, setImage] = useState<ImageData | null>(null);
  const [stagedImage, setStagedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [staging, setStaging] = useState(false);

  // Staging options
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType>('living-room');
  const [selectedStyle, setSelectedStyle] = useState<FurnitureStyle>('modern');
  const [selectedLighting, setSelectedLighting] = useState<Lighting>('bright');

  useEffect(() => {
    if (session) {
      fetchImage();
    }
  }, [session, resolvedParams.photoId]);

  const fetchImage = async () => {
    try {
      const response = await fetch(`/api/image/${resolvedParams.photoId}`);
      const data = await response.json();
      
      if (data.image) {
        setImage(data.image);
      }
    } catch (error) {
      console.error('Failed to fetch image:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyStaging = async () => {
    if (!image) return;

    setStaging(true);
    
    try {
      // Fetch the image as a blob
      const imageResponse = await fetch(image.url);
      const imageBlob = await imageResponse.blob();

      // Create FormData
      const formData = new FormData();
      formData.append('image', imageBlob, image.filename);
      formData.append('options', JSON.stringify({
        roomType: selectedRoomType,
        furnitureStyle: selectedStyle,
        lighting: selectedLighting
      }));

      // Call staging API
      const response = await fetch('/api/stage', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.stagedImageUrl) {
        setStagedImage(result.stagedImageUrl);
      } else {
        console.error('Staging failed:', result.error);
        alert('Staging failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Staging error:', error);
      alert('Staging failed. Please try again.');
    } finally {
      setStaging(false);
    }
  };

  const resetStaging = () => {
    setStagedImage(null);
  };

  const downloadStagedImage = async () => {
    if (!stagedImage) return;

    try {
      const response = await fetch(stagedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `staged_${image?.filename || 'image.png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Image Not Found</h1>
          <Button asChild>
            <Link href="/project/1">← Back to Photos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Photo Editor</h1>
            <p className="text-sm text-gray-600">{image.filename}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/project/1">← Back to Photos</Link>
            </Button>
            {stagedImage && (
              <>
                <Button variant="outline" onClick={resetStaging}>
                  Reset
                </Button>
                <Button variant="outline" onClick={downloadStagedImage}>
                  Download
                </Button>
              </>
            )}
            <Button onClick={applyStaging} disabled={staging}>
              {staging ? 'Staging...' : 'Apply Staging'}
            </Button>
          </div>
        </div>
        
        <div className="flex-1 p-6 flex items-center justify-center bg-gray-50">
          <div className="max-w-4xl max-h-full w-full">
            {stagedImage ? (
              <div className="relative w-full">
                <div className="aspect-video bg-white border-2 border-gray-300 rounded-lg overflow-hidden relative">
                  <Image
                    src={stagedImage}
                    alt="Staged room"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 80vw"
                  />
                </div>
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">✅ Staging Complete!</p>
                  <p className="text-green-600 text-sm">
                    Your {selectedRoomType.replace('-', ' ')} has been virtually staged with {selectedStyle} furniture
                  </p>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-white border-2 border-gray-300 rounded-lg overflow-hidden relative">
                <S3Image
                  s3Key={image.key}
                  alt={image.filename}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Staging Options Sidebar */}
      <div className="w-80 border-l bg-white p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Staging Options</h2>
        
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Room Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {(['living-room', 'bedroom', 'kitchen', 'dining-room', 'bathroom', 'office'] as RoomType[]).map((type) => (
                <Button
                  key={type}
                  variant={selectedRoomType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRoomType(type)}
                  className="justify-start"
                >
                  {type.replace('-', ' ').split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Furniture Style</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {(['modern', 'traditional', 'minimalist', 'rustic', 'industrial', 'scandinavian'] as FurnitureStyle[]).map((style) => (
                <Button
                  key={style}
                  variant={selectedStyle === style ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStyle(style)}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Lighting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {(['bright', 'warm', 'natural', 'dramatic'] as Lighting[]).map((lighting) => (
                <Button
                  key={lighting}
                  variant={selectedLighting === lighting ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLighting(lighting)}
                >
                  {lighting.charAt(0).toUpperCase() + lighting.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Selection Summary */}
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">Current Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Room:</strong> {selectedRoomType.replace('-', ' ')}</p>
              <p><strong>Style:</strong> {selectedStyle}</p>
              <p><strong>Lighting:</strong> {selectedLighting}</p>
            </div>
          </CardContent>
        </Card>

        {staging && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-blue-800">Generating staged image...</span>
            </div>
            <p className="text-blue-600 text-sm mt-2">
              This may take 10-30 seconds depending on image complexity
            </p>
          </div>
        )}
      </div>
    </div>
  );
}