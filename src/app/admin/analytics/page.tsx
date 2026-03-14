'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import * as React from "react";
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, LineChart, PieChart, Users, Briefcase, DollarSign, CheckCircle, TrendingUp, UserMinus, UserPlus, Banknote, ShieldCheck, Handshake, ListX, ListChecks, RefreshCw, AlertCircle, Zap, DatabaseZap, ShieldAlert as CircuitBreakerIcon, BellRing as AlertsIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Line, LineChart as RechartsLineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Pie, PieChart as RechartsPieChart, Cell, LabelList } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminDashboardMetrics, SyncPerformanceMetrics, SyncCachePerformance, SyncCircuitBreakerStatus, CircuitBreakerInfo, SyncAlertsSummary, SyncAlertItem } from '@/lib/types';
import { NobridgeIcon, NobridgeIconType } from '@/components/ui/nobridge-icon';
import { MetricCard } from "@/components/admin/metric-card";

// Chart color configurations
const userGrowthChartConfig = {
  sellers: {
    label: "Sellers",
    color: "hsl(var(--brand-dark-blue-hsl))",
  },
  buyers: {
    label: "Buyers",
    color: "hsl(var(--brand-sky-blue-hsl))",
  },
}

const userDistributionChartConfig = {
  sellers: {
    label: "Sellers",
    color: "hsl(var(--brand-dark-blue-hsl))",
  },
  buyers: {
    label: "Buyers",
    color: "hsl(var(--brand-sky-blue-hsl))",
  },
}

// Chart colors for pie chart
const COLORS = {
  sellers: "hsl(var(--brand-dark-blue-hsl))",
  buyers: "hsl(var(--brand-sky-blue-hsl))",
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status}: ${res.statusText}` }));
    throw new Error(errorData.error || errorData.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
};

export default function AdminAnalyticsPage() {
  const { data: metrics, error, isLoading, mutate } = useSWR<AdminDashboardMetrics>(
    '/api/admin/metrics',
    fetcher,
    {
      refreshInterval: 60000, // Auto-refresh every 60 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const { data: userGrowthData, error: userGrowthError, isLoading: userGrowthLoading } = useSWR(
    '/api/admin/user-growth',
    fetcher,
    {
      refreshInterval: 300000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // SWR hooks for new sync observability data
  const { data: syncPerformance, error: syncPerfError, isLoading: syncPerfLoading, mutate: mutateSyncPerf } = useSWR<SyncPerformanceMetrics>('/api/admin/sync-performance', fetcher, { refreshInterval: 30000 });
  const { data: syncCache, error: syncCacheError, isLoading: syncCacheLoading, mutate: mutateSyncCache } = useSWR<SyncCachePerformance>('/api/admin/sync-cache', fetcher, { refreshInterval: 30000 });
  const { data: syncCircuitBreakers, error: syncCircuitBreakersError, isLoading: syncCircuitBreakersLoading, mutate: mutateSyncCircuitBreakers } = useSWR<SyncCircuitBreakerStatus>('/api/admin/sync-circuit-breakers', fetcher, { refreshInterval: 30000 });
  const { data: syncAlerts, error: syncAlertsError, isLoading: syncAlertsLoading, mutate: mutateSyncAlerts } = useSWR<SyncAlertsSummary>('/api/admin/sync-alerts', fetcher, { refreshInterval: 30000 });


  const handleRefreshAll = () => {
    mutate();
    mutateSyncPerf();
    mutateSyncCache();
    mutateSyncCircuitBreakers();
    mutateSyncAlerts();
  };

  const formatMs = (ms?: number) => ms ? `${ms.toFixed(1)} ms` : 'N/A';
  const formatPercent = (val?: number) => val ? `${val.toFixed(1)}%` : 'N/A';

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-dark-blue">Platform Analytics</h1>
          <Button disabled variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => ( // Increased skeleton count
            <Card key={i} className="shadow-md bg-brand-white">
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-dark-blue">Platform Analytics</h1>
          <Button onClick={handleRefreshAll} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry All
          </Button>
        </div>
        <Card className="shadow-md bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">Failed to load platform analytics data</p>
                <p className="text-sm text-red-600">{error.message || 'An error occurred'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const totalUsers = metrics.totalActiveBuyers + metrics.totalActiveSellers;

  // Prepare data for user distribution pie chart
  const userDistributionData = [
    {
      role: 'Buyers',
      count: metrics.totalActiveBuyers,
      fill: COLORS.buyers,
    },
    {
      role: 'Sellers',
      count: metrics.totalActiveSellers,
      fill: COLORS.sellers,
    }
  ];

  // Fallback for syncCircuitBreakers to always be an object with circuitBreakers array
  const safeSyncCircuitBreakers: SyncCircuitBreakerStatus =
    Array.isArray(syncCircuitBreakers)
      ? { circuitBreakers: [] }
      : syncCircuitBreakers ?? { circuitBreakers: [] };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-dark-blue">Platform Analytics</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600">
            Live Data
          </Badge>
          <Button onClick={handleRefreshAll} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* General Platform Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md bg-brand-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-dark-blue">Total Users</CardTitle>
            <Users className="h-5 w-5 text-brand-dark-blue/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-brand-dark-blue">{totalUsers}</div>
            <p className="text-xs text-brand-dark-blue/70">{metrics.totalActiveSellers} Sellers, {metrics.totalActiveBuyers} Buyers</p>
          </CardContent>
        </Card>
         <Card className="shadow-md bg-brand-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-dark-blue">Total Listings (All Statuses)</CardTitle>
            <ListChecks className="h-5 w-5 text-brand-dark-blue/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-brand-dark-blue">{metrics.totalListingsAllStatuses}</div>
            <p className="text-xs text-brand-dark-blue/70">{metrics.totalActiveListingsVerified + metrics.totalActiveListingsAnonymous} active</p>
            {metrics.totalListingsAllStatuses === 0 && (
              <Badge variant="outline" className="text-orange-600 mt-1">Coming Soon</Badge>
            )}
          </CardContent>
        </Card>
         <Card className="shadow-md bg-brand-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-dark-blue">Closed/Deactivated Listings</CardTitle>
            <ListX className="h-5 w-5 text-brand-dark-blue/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-brand-dark-blue">{metrics.closedOrDeactivatedListings}</div>
            <p className="text-xs text-brand-dark-blue/70">Inactive or deal finalized</p>
            {metrics.closedOrDeactivatedListings === 0 && (
              <Badge variant="outline" className="text-orange-600 mt-1">Coming Soon</Badge>
            )}
          </CardContent>
        </Card>
         <Card className="shadow-md bg-brand-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-dark-blue">Total Facilitated Connections</CardTitle>
            <Handshake className="h-5 w-5 text-brand-dark-blue/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-brand-dark-blue">{metrics.successfulConnectionsMTD}</div>
            <p className="text-xs text-brand-dark-blue/70">{metrics.activeSuccessfulConnections} active, {metrics.closedSuccessfulConnections} closed (MTD)</p>
            {metrics.successfulConnectionsMTD === 0 && (
              <Badge variant="outline" className="text-orange-600 mt-1">Coming Soon</Badge>
            )}
          </CardContent>
        </Card>
      </div>
      {/* ... other existing metric sections ... */}
      <Separator className="bg-brand-light-gray/80"/>
      <h2 className="text-2xl font-semibold tracking-tight pt-4 text-brand-dark-blue">Recent Activity (7 Days)</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md bg-brand-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between text-brand-dark-blue">
              New Sellers (7d)
              <UserPlus className="h-5 w-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-brand-dark-blue">{metrics.newUserRegistrations7dSellers}</div>
            <p className="text-xs text-brand-dark-blue/70">{metrics.newUserRegistrations24hSellers} in last 24h</p>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-brand-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between text-brand-dark-blue">
              New Buyers (7d)
              <UserPlus className="h-5 w-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-brand-dark-blue">{metrics.newUserRegistrations7dBuyers}</div>
            <p className="text-xs text-brand-dark-blue/70">{metrics.newUserRegistrations24hBuyers} in last 24h</p>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-brand-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between text-brand-dark-blue">
              New Listings (7d)
              <ListChecks className="h-5 w-5 text-brand-sky-blue" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-brand-dark-blue">{metrics.newListingsCreated7d}</div>
            <p className="text-xs text-brand-dark-blue/70">{metrics.newListingsCreated24h} in last 24h</p>
            {metrics.newListingsCreated7d === 0 && (
              <Badge variant="outline" className="text-orange-600 mt-1">Coming Soon</Badge>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-md bg-brand-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between text-brand-dark-blue">
              Verification Queue
              <ShieldCheck className="h-5 w-5 text-brand-sky-blue" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-brand-dark-blue">{metrics.buyerVerificationQueueCount + metrics.sellerVerificationQueueCount}</div>
            <p className="text-xs text-brand-dark-blue/70">{metrics.buyerVerificationQueueCount} buyers, {metrics.sellerVerificationQueueCount} sellers</p>
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-brand-light-gray/80"/>
      <h2 className="text-2xl font-semibold tracking-tight pt-4 text-brand-dark-blue">User Segmentation</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md bg-brand-white">
          <CardHeader className="pb-2"> <CardTitle className="text-sm font-medium flex items-center justify-between text-brand-dark-blue">Paid Buyers <UserPlus className="h-5 w-5 text-green-500" /></CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-brand-dark-blue">{metrics.totalPaidBuyers}</div>
            {metrics.totalPaidBuyers === 0 && (
              <Badge variant="outline" className="text-orange-600 mt-1">Coming Soon</Badge>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-md bg-brand-white">
          <CardHeader className="pb-2"> <CardTitle className="text-sm font-medium flex items-center justify-between text-brand-dark-blue">Free Buyers <UserMinus className="h-5 w-5 text-orange-500" /></CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-brand-dark-blue">{metrics.totalFreeBuyers}</div>
            <p className="text-xs text-brand-dark-blue/70">All users currently free</p>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-brand-white">
         <CardHeader className="pb-2"> <CardTitle className="text-sm font-medium flex items-center justify-between text-brand-dark-blue">Paid Sellers <UserPlus className="h-5 w-5 text-green-500" /></CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-brand-dark-blue">{metrics.totalPaidSellers}</div>
            {metrics.totalPaidSellers === 0 && (
              <Badge variant="outline" className="text-orange-600 mt-1">Coming Soon</Badge>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-md bg-brand-white">
          <CardHeader className="pb-2"> <CardTitle className="text-sm font-medium flex items-center justify-between text-brand-dark-blue">Free Sellers <UserMinus className="h-5 w-5 text-orange-500" /></CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-brand-dark-blue">{metrics.totalFreeSellers}</div>
            <p className="text-xs text-brand-dark-blue/70">All users currently free</p>
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-brand-light-gray/80"/>
      <h2 className="text-2xl font-semibold tracking-tight pt-4 text-brand-dark-blue">Revenue Breakdown (MTD)</h2>
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <Card className="shadow-md bg-brand-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-dark-blue">Total Revenue (MTD)</CardTitle>
            <Banknote className="h-5 w-5 text-brand-dark-blue/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-brand-dark-blue">${(metrics.totalRevenueMTD || 0).toLocaleString()}</div>
            <p className="text-xs text-brand-dark-blue/70">Sum from subscriptions</p>
            {(metrics.totalRevenueMTD || 0) === 0 && (
              <Badge variant="outline" className="text-orange-600 mt-1">Coming Soon</Badge>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-md bg-brand-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-dark-blue">Revenue from Buyers (MTD)</CardTitle>
            <DollarSign className="h-5 w-5 text-brand-dark-blue/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-brand-dark-blue">${(metrics.revenueFromBuyers || 0).toLocaleString()}</div>
            <p className="text-xs text-brand-dark-blue/70">Buyer subscriptions</p>
            {(metrics.revenueFromBuyers || 0) === 0 && (
              <Badge variant="outline" className="text-orange-600 mt-1">Coming Soon</Badge>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-md bg-brand-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-dark-blue">Revenue from Sellers (MTD)</CardTitle>
            <DollarSign className="h-5 w-5 text-brand-dark-blue/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-brand-dark-blue">${(metrics.revenueFromSellers || 0).toLocaleString()}</div>
            <p className="text-xs text-brand-dark-blue/70">Seller subscriptions/services</p>
            {(metrics.revenueFromSellers || 0) === 0 && (
              <Badge variant="outline" className="text-orange-600 mt-1">Coming Soon</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-brand-light-gray/80"/>
      <h2 className="text-2xl font-semibold tracking-tight pt-4 text-brand-dark-blue">Connection Funnel</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md bg-brand-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-brand-dark-blue">Active Successful Connections</CardTitle>
                <Handshake className="h-5 w-5 text-brand-sky-blue"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold text-brand-dark-blue">{metrics.activeSuccessfulConnections}</div>
                <p className="text-xs text-brand-dark-blue/70">Connections facilitated, ongoing</p>
                {metrics.activeSuccessfulConnections === 0 && (
                  <Badge variant="outline" className="text-orange-600 mt-1">Coming Soon</Badge>
                )}
            </CardContent>
        </Card>
        <Card className="shadow-md bg-brand-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-brand-dark-blue">Deals Closed (MTD)</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold text-brand-dark-blue">{metrics.closedSuccessfulConnections}</div>
                <p className="text-xs text-brand-dark-blue/70">Connections marked as deal closed/archived</p>
                {metrics.closedSuccessfulConnections === 0 && (
                  <Badge variant="outline" className="text-orange-600 mt-1">Coming Soon</Badge>
                )}
            </CardContent>
        </Card>
        <Card className="shadow-md bg-brand-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-brand-dark-blue">Ready to Engage Queue</CardTitle>
                <TrendingUp className="h-5 w-5 text-brand-sky-blue"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold text-brand-dark-blue">{metrics.readyToEngageQueueCount}</div>
                <p className="text-xs text-brand-dark-blue/70">Pending admin facilitation</p>
                {metrics.readyToEngageQueueCount === 0 && (
                  <Badge variant="outline" className="text-orange-600 mt-1">Coming Soon</Badge>
                )}
            </CardContent>
        </Card>
      </div>
      {/* Charts Section */}
      <Separator className="bg-brand-light-gray/80"/>
      <h2 className="text-2xl font-semibold tracking-tight pt-4 text-brand-dark-blue">Activity Charts</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Over Time Chart */}
        <Card className="shadow-md bg-brand-white">
          <CardHeader>
            <CardTitle className="text-brand-dark-blue flex items-center justify-between">
              User Growth Over Time
              <Badge variant="outline" className="text-green-600">Live Data</Badge>
            </CardTitle>
            <CardDescription className="text-brand-dark-blue/80">Monthly new user registrations (Sellers vs Buyers).</CardDescription>
          </CardHeader>
          <CardContent>
            {userGrowthLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-brand-dark-blue/50 animate-spin" />
                <p className="text-brand-dark-blue/70 ml-2">Loading chart data...</p>
              </div>
            ) : userGrowthError ? (
              <div className="h-[300px] flex items-center justify-center bg-red-50 rounded-md">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <p className="text-red-600 ml-2">Failed to load chart data</p>
              </div>
            ) : userGrowthData && userGrowthData.length > 0 ? (
              <ChartContainer config={userGrowthChartConfig} className="h-[300px]">
                <RechartsLineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="sellers"
                    stroke="var(--color-sellers)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-sellers)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="buyers"
                    stroke="var(--color-buyers)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-buyers)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </RechartsLineChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center bg-brand-light-gray/30 rounded-md">
                <LineChart className="h-24 w-24 text-brand-dark-blue/50" />
                <p className="text-brand-dark-blue/70 ml-4">No historical data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Role Distribution Chart */}
        <Card className="shadow-md bg-brand-white">
          <CardHeader>
            <CardTitle className="text-brand-dark-blue flex items-center justify-between">
              User Role Distribution
              <Badge variant="outline" className="text-green-600">Live Data</Badge>
            </CardTitle>
            <CardDescription className="text-brand-dark-blue/80">Current breakdown of sellers vs. buyers on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            {totalUsers > 0 ? (
              <ChartContainer config={userDistributionChartConfig} className="h-[300px]">
                <RechartsPieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ role, count, percent }) =>
                      `${role}: ${count} (${(percent * 100).toFixed(1)}%)`
                    }
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      `${value} users (${((value as number / totalUsers) * 100).toFixed(1)}%)`,
                      name
                    ]}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </RechartsPieChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center bg-brand-light-gray/30 rounded-md">
                <PieChart className="h-24 w-24 text-brand-dark-blue/50" />
                <p className="text-brand-dark-blue/70 ml-4">No users registered yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sync System Observability Section */}
      <Separator className="bg-brand-light-gray/80 my-8" />
      <h2 className="text-2xl font-semibold tracking-tight pt-4 text-brand-dark-blue">Universal Sync System Observability</h2>

      {/* Sync Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Avg Sync Time" value={syncPerfLoading ? 'Loading...' : formatMs(syncPerformance?.averageProcessingTimeMs)} icon={Zap} description="Avg. processing time for sync operations" />
        <MetricCard title="P95 Latency" value={syncPerfLoading ? 'Loading...' : formatMs(syncPerformance?.p95LatencyMs)} icon={Zap} description="95th percentile latency" />
        <MetricCard title="P99 Latency" value={syncPerfLoading ? 'Loading...' : formatMs(syncPerformance?.p99LatencyMs)} icon={Zap} description="99th percentile latency" />
        <MetricCard title="Sync Error Rate" value={syncPerfLoading ? 'Loading...' : formatPercent(syncPerformance?.errorRatePercent)} icon={AlertCircle} description="Percentage of failed sync operations" />
      </div>
      {syncPerfError && <p className="text-sm text-red-500 mt-2">Error loading sync performance: {syncPerfError.message}</p>}

      {/* Sync Cache Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <MetricCard title="Cache Hit Ratio" value={syncCacheLoading ? 'Loading...' : formatPercent(syncCache?.hitRatioPercent)} icon={DatabaseZap} description="Effectiveness of the sync cache" />
        <MetricCard title="Active Cache Entries" value={syncCacheLoading ? 'Loading...' : syncCache?.totalEntries?.toLocaleString() || 'N/A'} icon={DatabaseZap} description="Total items currently cached" />
        {syncCache?.averageEntrySizeBytes && <MetricCard title="Avg Cache Entry Size" value={syncCacheLoading ? 'Loading...' : `${(syncCache.averageEntrySizeBytes / 1024).toFixed(1)} KB`} icon={DatabaseZap} />}
        {syncCache?.readThroughputPerSecond && <MetricCard title="Cache Reads/sec" value={syncCacheLoading ? 'Loading...' : syncCache.readThroughputPerSecond.toLocaleString()} icon={DatabaseZap} />}
      </div>
      {syncCacheError && <p className="text-sm text-red-500 mt-2">Error loading sync cache data: {syncCacheError.message}</p>}

      {/* Circuit Breaker Status */}
      <Card className="mt-6 shadow-md bg-brand-white">
        <CardHeader>
          <CardTitle className="text-brand-dark-blue flex items-center"><CircuitBreakerIcon className="mr-2 h-5 w-5" />Sync Circuit Breaker Status</CardTitle>
          <CardDescription>Real-time status of service circuit breakers.</CardDescription>
        </CardHeader>
        <CardContent>
          {syncCircuitBreakersLoading ? <p>Loading circuit breaker status...</p> : syncCircuitBreakersError ? <p className="text-red-500">Error: {syncCircuitBreakersError.message}</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Failures</TableHead>
                  <TableHead>Last Failure</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeSyncCircuitBreakers.circuitBreakers.map((cb) => (
                  <TableRow key={cb.name}>
                    <TableCell className="font-medium">{cb.name}</TableCell>
                    <TableCell>
                      <Badge variant={cb.state === 'OPEN' ? 'destructive' : cb.state === 'HALF_OPEN' ? 'outline' : 'default'}
                             className={cb.state === 'CLOSED' ? 'bg-green-100 text-green-700' : cb.state === 'HALF_OPEN' ? 'bg-yellow-100 text-yellow-700' : ''}>
                        {cb.state}
                      </Badge>
                    </TableCell>
                    <TableCell>{cb.failures}</TableCell>
                    <TableCell>{cb.lastFailureAt ? new Date(cb.lastFailureAt).toLocaleString() : 'N/A'}</TableCell>
                  </TableRow>
                ))}
                 {safeSyncCircuitBreakers.circuitBreakers.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center">No circuit breakers configured or data unavailable.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sync Alerts Summary */}
      <Card className="mt-6 shadow-md bg-brand-white">
        <CardHeader>
          <CardTitle className="text-brand-dark-blue flex items-center"><AlertsIcon className="mr-2 h-5 w-5" />Active Sync System Alerts</CardTitle>
          <CardDescription>Overview of critical and high-priority system alerts.</CardDescription>
        </CardHeader>
        <CardContent>
          {syncAlertsLoading ? <p>Loading alerts summary...</p> : syncAlertsError ? <p className="text-red-500">Error: {syncAlertsError.message}</p> : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <MetricCard title="Critical Alerts" value={syncAlerts?.activeCriticalAlerts || 0} icon={AlertCircle} trendDirection={syncAlerts?.activeCriticalAlerts || 0 > 0 ? 'down' : 'neutral'} />
                <MetricCard title="High Alerts" value={syncAlerts?.activeHighAlerts || 0} icon={AlertCircle} trendDirection={syncAlerts?.activeHighAlerts || 0 > 0 ? 'down' : 'neutral'} />
              </div>
              <h3 className="text-md font-semibold mb-2">Recent Alerts:</h3>
              {syncAlerts?.recentAlerts && syncAlerts.recentAlerts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Triggered At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncAlerts.recentAlerts.map(alert => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : 'outline'}
                                 className={alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' : ''}>
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{alert.ruleName}</TableCell>
                        <TableCell className="text-xs max-w-xs truncate">{alert.details}</TableCell>
                        <TableCell>{new Date(alert.triggeredAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-sm text-muted-foreground">No recent alerts.</p>}
            </>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

