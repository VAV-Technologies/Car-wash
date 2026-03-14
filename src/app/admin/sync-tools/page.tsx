'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSyncTools() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async (syncAll: boolean = false) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/sync-seller-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sync_all: syncAll,
          fix_mismatches: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync seller verification');
      }

      setResult(data);
      toast({
        title: 'Sync Completed',
        description: `Updated ${data.listings_updated} listings across ${data.sellers_processed} sellers`,
        variant: 'default',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: 'Sync Failed',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-semibold mb-6">Admin Sync Tools</h1>

      <Tabs defaultValue="seller-verification" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="seller-verification">Seller Verification Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="seller-verification">
          <Card>
            <CardHeader>
              <CardTitle>Seller Verification Status Sync</CardTitle>
              <CardDescription>
                Synchronize seller verification status with their listings. This ensures that when a seller's
                verification status changes, all their listings are updated accordingly.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-medium">What This Does</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Updates <code>is_seller_verified</code> on all listings based on seller's <code>verification_status</code></li>
                    <li>Only updates listings that are out of sync (to minimize database operations)</li>
                    <li>Provides detailed results of what was updated</li>
                  </ul>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {result && (
                  <Alert variant={result.listings_updated > 0 ? 'default' : 'secondary'}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Sync Results</AlertTitle>
                    <AlertDescription>
                      <p>Processed {result.sellers_processed} sellers</p>
                      <p>Updated {result.listings_updated} listings</p>
                      {result.listings_updated === 0 && (
                        <p className="text-muted-foreground">All listings are already in sync!</p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => handleSync(false)}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Fix Current Listing
              </Button>

              <Button
                onClick={() => handleSync(true)}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Sync All Sellers
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
