"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function TestConvex() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testConvexConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-convex');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to connect to Convex API' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>🗄️ Test Convex Database</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testConvexConnection}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Convex Connection'}
          </Button>

          {result && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Convex Response:</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Testing:</strong> Convex database connection</p>
            <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_CONVEX_URL || 'Not set'}</p>
            <p><strong>Tables:</strong> users, projects, photos, stagingEdits</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}