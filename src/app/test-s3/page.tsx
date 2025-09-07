"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function TestS3() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testS3Upload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/test-s3', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to connect to S3 API' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>☁️ Test AWS S3 Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="image">Upload Test Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button 
            onClick={testS3Upload}
            disabled={!file || loading}
            className="w-full"
          >
            {loading ? 'Uploading...' : 'Test S3 Upload'}
          </Button>

          {result && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">S3 Response:</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
                {result.imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Uploaded Image:</p>
                    <img 
                      src={result.imageUrl} 
                      alt="Uploaded" 
                      className="mt-2 max-w-full h-auto rounded border"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Testing:</strong> AWS S3 image storage</p>
            <p><strong>Bucket:</strong> {process.env.AWS_S3_BUCKET_NAME || 'Not set'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}