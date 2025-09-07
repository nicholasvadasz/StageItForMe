"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function TestGemini() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testGeminiStaging = async () => {
    if (!file || !session) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('options', JSON.stringify({
      roomType: 'living-room',
      furnitureStyle: 'modern',
      lighting: 'bright'
    }));

    try {
      const response = await fetch('/api/stage', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to connect to staging API' });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>⚠️ Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to test Gemini staging.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>🤖 Test Gemini AI Staging</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="image">Upload Room Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button 
            onClick={testGeminiStaging}
            disabled={!file || loading}
            className="w-full"
          >
            {loading ? 'Staging Room...' : 'Stage This Room'}
          </Button>

          {result && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">API Response:</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Testing:</strong> Gemini AI integration</p>
            <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_GEMINI_CHECK ? '✅ Set' : '❌ Check console'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}