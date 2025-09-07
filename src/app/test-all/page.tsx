import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function TestAll() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🧪 StageItForMe Test Suite</h1>
          <p className="text-gray-600">Test all major components and integrations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔐 Authentication
              </CardTitle>
              <CardDescription>NextAuth + Google OAuth</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test sign-in, session management, and protected routes
              </p>
              <Button asChild className="w-full">
                <Link href="/test-auth">Test Auth</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Gemini AI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 Gemini AI Staging
              </CardTitle>
              <CardDescription>Google Gemini API</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Upload photos and test virtual staging with AI
              </p>
              <Button asChild className="w-full">
                <Link href="/test-gemini">Test Staging</Link>
              </Button>
            </CardContent>
          </Card>

          {/* AWS S3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ☁️ AWS S3 Storage
              </CardTitle>
              <CardDescription>Image upload & storage</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test image uploads and cloud storage functionality
              </p>
              <Button asChild className="w-full">
                <Link href="/test-s3">Test Storage</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Stripe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💳 Stripe Payments
              </CardTitle>
              <CardDescription>Subscription billing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test payment integration and subscription plans
              </p>
              <Button asChild className="w-full">
                <Link href="/test-stripe">Test Payments</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Convex Database */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🗄️ Convex Database
              </CardTitle>
              <CardDescription>Real-time data storage</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test database connection and schema configuration
              </p>
              <Button asChild className="w-full">
                <Link href="/test-convex">Test Database</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Environment Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚙️ Environment Check
              </CardTitle>
              <CardDescription>API keys & configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Verify all environment variables and API keys
              </p>
              <Button asChild className="w-full">
                <Link href="/test-env">Check Config</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Production App Links */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">🚀 Production App</h2>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">Landing Page</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Status Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🔍 Quick Status Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Auth:</strong> ✅ Working
              </div>
              <div>
                <strong>Gemini:</strong> ⏳ Test needed
              </div>
              <div>
                <strong>S3:</strong> ⏳ Test needed
              </div>
              <div>
                <strong>Stripe:</strong> ⏳ Test needed
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}