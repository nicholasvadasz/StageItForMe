"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function TestStripe() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testStripeConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-stripe');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to connect to Stripe API' });
    } finally {
      setLoading(false);
    }
  };

  const testCreateCustomer = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_customer',
          email: 'test@example.com',
          name: 'Test User'
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to create test customer' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>💳 Test Stripe Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={testStripeConnection}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>

            <Button 
              onClick={testCreateCustomer}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Test Customer'}
            </Button>
          </div>

          {result && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Stripe Response:</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Testing:</strong> Stripe payment integration</p>
            <p><strong>Mode:</strong> Test mode (safe to test)</p>
            <p><strong>Pricing Plans:</strong> $29, $79, $199/month</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}