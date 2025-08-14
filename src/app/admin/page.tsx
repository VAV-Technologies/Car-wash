
'use client'

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'
import * as React from "react";
import { MetricCard } from "@/components/admin/metric-card";
import useSWR from 'swr';
import type { AdminDashboardMetrics } from '@/lib/types';
import { Users, BellRing, LineChart, ListChecks, UserCheck, Building, DollarSign, Banknote, ListX, Handshake, Clock, AlertTriangle, UserX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Inquiry } from "@/lib/types";
import { NobridgeIcon, NobridgeIconType } from "@/components/ui/nobridge-icon";
import { Settings } from "lucide-react";

// Simple fetcher for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminDashboardPage() {
  const { data: metrics, isLoading, error } = useSWR<AdminDashboardMetrics>('/api/admin/metrics', fetcher, { refreshInterval: 300000 }); // 5-min re-fetch

  const { data: cleanupData, isLoading: cleanupLoading, error: cleanupError } = useSWR(
    '/api/admin/cleanup-queue',
    fetcher,
    { refreshInterval: 60000 }
  );

  const { data: buyerVerificationData, isLoading: buyerVerificationLoading } = useSWR(
    '/api/admin/verification-queue/buyers?limit=5&status=all', // Fetch all, filter client-side for pending
    fetcher,
    { refreshInterval: 60000 }
  );

  const { data: sellerVerificationData, isLoading: sellerVerificationLoading } = useSWR(
    '/api/admin/verification-queue/sellers?limit=5&status=all', // Fetch all, filter client-side for pending
    fetcher,
    { refreshInterval: 60000 }
  );

  if (error) {
    return <div className="p-8 text-destructive">Failed to load metrics: {error.message}</div>;
  }

  if (isLoading || !metrics) {
    return <div className="p-8 text-muted-foreground">Loading admin metrics...</div>;
  }

  const buyerVerificationRequests = buyerVerificationData?.requests?.filter((req: any) =>
    req.operationalStatus !== 'Approved' && req.operationalStatus !== 'Rejected'
  ) || [];

  const sellerVerificationRequests = sellerVerificationData?.requests?.filter((req: any) =>
    req.operationalStatus !== 'Approved' && req.operationalStatus !== 'Rejected'
  ) || [];
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new request': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'docs under review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'more info requested': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const adminPageReadyToEngageItems = [
    // Placeholder for actual engagement queue data
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight font-heading text-foreground">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="New Sellers (7d)"
          value={metrics.newUserRegistrations7dSellers}
          icon={Users}
          description={`${metrics.newUserRegistrations24hSellers} in last 24h`}
        />
         <MetricCard
          title="New Buyers (7d)"
          value={metrics.newUserRegistrations7dBuyers}
          icon={Users}
          description={`${metrics.newUserRegistrations24hBuyers} in last 24h`}
        />
        <MetricCard
          title="New Listings (7d)"
          value={metrics.newListingsCreated7d}
          icon={() => <NobridgeIcon icon="business-listing" size="sm" className="h-5 w-5 text-muted-foreground" />}
          description={`${metrics.newListingsCreated24h} in last 24h`}
        />
        <MetricCard
          title="Total Listings (All Statuses)"
          value={metrics.totalListingsAllStatuses}
          icon={ListChecks}
          description={`${metrics.totalActiveListingsVerified + metrics.totalActiveListingsAnonymous} active`}
        />
        <MetricCard
          title="Closed/Deactivated Listings"
          value={metrics.closedOrDeactivatedListings}
          icon={ListX}
          description="Inactive or deal finalized"
        />
         <MetricCard
          title="Total Platform Revenue (MTD)"
          value={`$${(metrics.totalRevenueMTD || 0).toLocaleString()}`}
          icon={() => <NobridgeIcon icon="revenue" size="sm" className="h-5 w-5 text-muted-foreground" />}
          description="Sum of buyer & seller revenue"
        />
        <MetricCard
          title="Revenue from Buyers (MTD)"
          value={`$${(metrics.revenueFromBuyers || 0).toLocaleString()}`}
          icon={() => <NobridgeIcon icon="investment" size="sm" className="h-5 w-5 text-muted-foreground" />}
          description="From buyer subscriptions"
        />
        <MetricCard
          title="Revenue from Sellers (MTD)"
          value={`$${(metrics.revenueFromSellers || 0).toLocaleString()}`}
          icon={DollarSign}
          description="From seller subscriptions/services"
        />
        <MetricCard
          title="Buyer Verification Queue"
          value={metrics.buyerVerificationQueueCount}
          icon={() => <NobridgeIcon icon="verification" size="sm" className="h-5 w-5 text-muted-foreground" />}
          description="Buyers awaiting verification"
        />
        <MetricCard
          title="Seller/Listing Verification Queue"
          value={metrics.sellerVerificationQueueCount}
          icon={() => <NobridgeIcon icon="due-diligence" size="sm" className="h-5 w-5 text-muted-foreground" />}
          description="Sellers/listings awaiting verification"
        />
         <MetricCard
          title="Ready to Engage Queue"
          value={metrics.readyToEngageQueueCount}
          icon={BellRing}
          description="Pairs ready for admin connection"
        />
        <MetricCard
          title="Total Facilitated Connections"
          value={metrics.successfulConnectionsMTD}
          icon={Handshake}
          description={`${metrics.activeSuccessfulConnections} active, ${metrics.closedSuccessfulConnections} closed (MTD)`}
        />

        <MetricCard
          title="Unverified Accounts"
          value={cleanupData?.data?.statistics?.unverified || 0}
          icon={Clock}
          description="Need email verification"
          className={cleanupData?.data?.statistics?.unverified > 5 ? "border-yellow-500/50 bg-yellow-500/5" : "bg-card"}
        />
        <MetricCard
          title="Pending Deletion"
          value={cleanupData?.data?.statistics?.pending_deletion || 0}
          icon={AlertTriangle}
          description="Scheduled for cleanup"
          className={cleanupData?.data?.statistics?.pending_deletion > 0 ? "border-destructive/50 bg-destructive/5" : "bg-card"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         <Card className="shadow-md bg-card">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="font-heading text-foreground">Pending Buyer Verifications</CardTitle>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/verification-queue/buyers">View All</Link>
                </Button>
            </div>
            <CardDescription className="text-muted-foreground">
              {buyerVerificationLoading ? 'Loading...' : `${buyerVerificationRequests.length} buyers needing admin review.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">Buyer Name</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buyerVerificationLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">Loading...</TableCell>
                  </TableRow>
                ) : buyerVerificationRequests.slice(0, 3).map((req: any) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium text-foreground">{req.userName}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusColor(req.operationalStatus)}`}>
                        {req.operationalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(req.timestamp).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {!buyerVerificationLoading && buyerVerificationRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                      ✅ No pending buyer verifications.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-card">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="font-heading text-foreground">Pending Seller/Listing Verifications</CardTitle>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/verification-queue/sellers">View All</Link>
                </Button>
            </div>
            <CardDescription className="text-muted-foreground">
              {sellerVerificationLoading ? 'Loading...' : `${sellerVerificationRequests.length} sellers/listings needing admin review.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">Seller Name</TableHead>
                  <TableHead className="text-muted-foreground">Listing</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellerVerificationLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">Loading...</TableCell>
                  </TableRow>
                ) : sellerVerificationRequests.slice(0, 3).map((req: any) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium text-foreground">{req.userName}</TableCell>
                    <TableCell className="text-muted-foreground">{req.listingTitle || 'N/A (Profile)'}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusColor(req.operationalStatus)}`}>
                        {req.operationalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(req.timestamp).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {!sellerVerificationLoading && sellerVerificationRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      ✅ No pending seller/listing verifications.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-card">
          <CardHeader>
             <div className="flex justify-between items-center">
                <CardTitle className="font-heading text-foreground">Ready for Connection</CardTitle>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/engagement-queue">View All</Link>
                </Button>
            </div>
            <CardDescription className="text-muted-foreground">{metrics.readyToEngageQueueCount} engagements ready for admin facilitation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">Buyer</TableHead>
                  <TableHead className="text-muted-foreground">Seller</TableHead>
                  <TableHead className="text-muted-foreground">Listing</TableHead>
                   <TableHead className="text-muted-foreground">Date Ready</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminPageReadyToEngageItems.slice(0,3).map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-foreground">{item.buyerName}</TableCell>
                    <TableCell className="text-foreground">{item.sellerName}</TableCell>
                    <TableCell className="text-muted-foreground">{item.listingTitle}</TableCell>
                    <TableCell className="text-muted-foreground">{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'N/A'}</TableCell>
                  </TableRow>
                ))}
                {adminPageReadyToEngageItems.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">No engagements ready for connection.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-heading text-foreground flex items-center gap-2">
                <UserX className="h-5 w-5 text-destructive" />
                Account Cleanup Queue
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/cleanup-queue">Manage All</Link>
              </Button>
            </div>
            <CardDescription className="text-muted-foreground">
              {cleanupLoading ? 'Loading...' : `${cleanupData?.data?.statistics?.total || 0} accounts need attention`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cleanupError && (
              <div className="text-destructive text-sm">Failed to load cleanup queue</div>
            )}
            {cleanupLoading && (
              <div className="text-muted-foreground text-sm">Loading cleanup queue...</div>
            )}
            {cleanupData?.data?.queue && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-muted-foreground">Email</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Time Left</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cleanupData.data.queue.slice(0, 3).map((account: any) => {
                    const timeLeft = account.time_until_deletion ?
                      Math.floor(account.time_until_deletion / (1000 * 60 * 60)) :
                      (account.time_until_permanent_deletion ?
                        Math.floor(account.time_until_permanent_deletion / (1000 * 60 * 60)) : 0);

                    return (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium text-foreground">{account.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={account.account_status === 'unverified' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {account.account_status === 'unverified' ? 'Unverified' : 'Pending Deletion'}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-sm ${timeLeft < 2 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                          {timeLeft > 0 ? `${timeLeft}h` : 'Expired'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!cleanupData.data.queue || cleanupData.data.queue.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                        ✅ No accounts in cleanup queue
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md bg-card">
        <CardHeader>
          <CardTitle className="font-heading text-foreground">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="flex-col h-24"><Link href="/admin/users"><Users className="mb-1"/> User Management</Link></Button>
            <Button variant="outline" asChild className="flex-col h-24"><Link href="/admin/listings"><ListChecks className="mb-1"/> Listing Management</Link></Button>
            <Button variant="outline" asChild className="flex-col h-24"><Link href="/admin/analytics"><LineChart className="mb-1"/> View Full Analytics</Link></Button>
            <Button variant="outline" asChild className="flex-col h-24"><Link href="/admin/email-recovery"><NobridgeIcon icon="email" className="mb-1"/> Email Recovery</Link></Button>
            <Button variant="outline" asChild className="flex-col h-24"><Link href="/admin/email-test"><Settings className="mb-1"/> Email Test</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}

