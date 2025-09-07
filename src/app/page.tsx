import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">StageItForMe</h1>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signin">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Transform Empty Spaces Into
          <span className="text-blue-600"> Dream Homes</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          AI-powered virtual staging for real estate professionals. Upload your photos 
          and watch as our advanced technology adds beautiful furniture and decor instantly.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/signin">Start Staging Now</Link>
          </Button>
          <Button size="lg" variant="outline">
            View Examples
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose StageItForMe?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚡ Lightning Fast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Stage multiple rooms in minutes, not days. Our AI processes 
                high-resolution images instantly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 Professional Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Choose from hundreds of furniture styles and arrangements. 
                From modern to traditional, we've got every taste covered.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💰 Cost Effective
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Save thousands on traditional staging. Perfect for real estate 
                agents, photographers, and property managers.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Simple, Transparent Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-3xl font-bold">$29<span className="text-base font-normal">/mo</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ 10 photos per month</li>
                <li>✓ Basic staging furniture</li>
                <li>✓ Standard resolution output</li>
                <li>✓ Email support</li>
              </ul>
              <Button className="w-full mt-6">Start Free Trial</Button>
            </CardContent>
          </Card>

          <Card className="border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">Most Popular</span>
            </div>
            <CardHeader>
              <CardTitle>Professional</CardTitle>
              <CardDescription>For busy real estate agents</CardDescription>
              <div className="text-3xl font-bold">$79<span className="text-base font-normal">/mo</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ 50 photos per month</li>
                <li>✓ Premium staging furniture</li>
                <li>✓ High resolution output</li>
                <li>✓ Priority email support</li>
                <li>✓ Bulk processing</li>
              </ul>
              <Button className="w-full mt-6">Start Free Trial</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For agencies and teams</CardDescription>
              <div className="text-3xl font-bold">$199<span className="text-base font-normal">/mo</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Unlimited photos</li>
                <li>✓ Premium + custom furniture</li>
                <li>✓ 4K resolution output</li>
                <li>✓ Phone & email support</li>
                <li>✓ API access</li>
                <li>✓ Custom branding</li>
              </ul>
              <Button className="w-full mt-6">Contact Sales</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-4">StageItForMe</h3>
          <p className="text-gray-400">
            © 2024 StageItForMe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}