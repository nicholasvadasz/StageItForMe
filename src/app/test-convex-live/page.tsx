"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestConvexLive() {
  const hello = useQuery(api.test.hello);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>🗄️ Test Live Convex Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>Convex Status:</strong></p>
            {hello === undefined ? (
              <p className="text-blue-600">Loading...</p>
            ) : (
              <p className="text-green-600">✅ {hello}</p>
            )}
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Testing:</strong> Live Convex database connection</p>
            <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_CONVEX_URL}</p>
            <p><strong>Real-time:</strong> Updates automatically</p>
          </div>

          <Button onClick={() => window.location.reload()}>
            Refresh Test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}