'use client'

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import * as React from "react";
import { useState } from "react";
import useSWR, { mutate } from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, AlertTriangle, UserX, Shield, CheckCircle, XCircle, Eye, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

// Simple fetcher for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

interface AccountAction {
  id: string;
  action: 'extend' | 'verify' | 'suspend' | 'delete';
  reason: string;
  hours_extension?: number;
}

export default function CleanupQueuePage() {
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [actionForm, setActionForm] = useState<Partial<AccountAction>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: cleanupData, isLoading, error } = useSWR(
    '/api/admin/cleanup-queue',
    fetcher,
    { refreshInterval: 30000 } // 30-second refresh
  );

  const handleActionSubmit = async () => {
    if (!selectedAccount || !actionForm.action) return;

    setIsSubmitting(true);
    try {
      const url = `/api/admin/cleanup-queue/${selectedAccount.id}`;
      const method = actionForm.action === 'delete' ? 'DELETE' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...actionForm,
          admin_user_id: 'current-admin-id' // TODO: Get from auth context
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Action failed');
      }

      toast.success(`Account ${actionForm.action} completed successfully`);

      // Refresh data
      mutate('/api/admin/cleanup-queue');

      // Close dialog
      setActionDialogOpen(false);
      setSelectedAccount(null);
      setActionForm({});

    } catch (error) {
      console.error('Action failed:', error);
      toast.error(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openActionDialog = (account: any, action: 'extend' | 'verify' | 'suspend' | 'delete') => {
    setSelectedAccount(account);
    setActionForm({
      id: account.id,
      action,
      reason: '',
      hours_extension: action === 'extend' ? 24 : undefined
    });
    setActionDialogOpen(true);
  };

  const formatTimeLeft = (timeMs: number | null) => {
    if (!timeMs || timeMs <= 0) return 'Expired';

    const hours = Math.floor(timeMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unverified': return 'secondary';
      case 'pending_deletion': return 'destructive';
      case 'suspended': return 'outline';
      default: return 'secondary';
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600">Failed to load cleanup queue: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight font-heading">Account Cleanup Queue</h1>
          <p className="text-muted-foreground">
            Manage unverified accounts and cleanup process
          </p>
        </div>
        <Button
          onClick={() => mutate('/api/admin/cleanup-queue')}
          variant="outline"
        >
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unverified Accounts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {isLoading ? '...' : cleanupData?.data?.statistics?.unverified || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Need email verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deletion</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-600">
              {isLoading ? '...' : cleanupData?.data?.statistics?.pending_deletion || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled for cleanup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total in Queue</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {isLoading ? '...' : cleanupData?.data?.statistics?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cleanup Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Account Queue</CardTitle>
          <CardDescription>
            Accounts requiring verification or scheduled for deletion
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Loading cleanup queue...
            </div>
          )}

          {!isLoading && cleanupData?.data?.queue && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time Left</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cleanupData.data.queue.map((account: any) => {
                  const timeLeft = account.time_until_deletion || account.time_until_permanent_deletion;

                  return (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.email}</TableCell>
                      <TableCell>{account.first_name && account.last_name ?
                        `${account.first_name} ${account.last_name}` :
                        account.full_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {account.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(account.account_status)} className="text-xs">
                          {account.account_status === 'unverified' ? 'Unverified' :
                           account.account_status === 'pending_deletion' ? 'Pending Deletion' :
                           account.account_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={timeLeft && timeLeft < 2 * 60 * 60 * 1000 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                          {formatTimeLeft(timeLeft)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(account.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openActionDialog(account, 'extend')}
                            className="h-8"
                          >
                            <Clock className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openActionDialog(account, 'verify')}
                            className="h-8"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openActionDialog(account, 'suspend')}
                            className="h-8"
                          >
                            <Shield className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openActionDialog(account, 'delete')}
                            className="h-8"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {cleanupData.data.queue.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      ✅ No accounts in cleanup queue
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionForm.action === 'extend' && 'Extend Grace Period'}
              {actionForm.action === 'verify' && 'Manually Verify Account'}
              {actionForm.action === 'suspend' && 'Suspend Account'}
              {actionForm.action === 'delete' && 'Delete Account'}
            </DialogTitle>
            <DialogDescription>
              Account: {selectedAccount?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionForm.action === 'extend' && (
              <div>
                <Label htmlFor="hours">Extension (hours)</Label>
                <Select
                  value={actionForm.hours_extension?.toString()}
                  onValueChange={(value) => setActionForm({...actionForm, hours_extension: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select extension period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours (default)</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="72">72 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for this action..."
                value={actionForm.reason}
                onChange={(e) => setActionForm({...actionForm, reason: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleActionSubmit}
              disabled={isSubmitting || !actionForm.reason}
              variant={actionForm.action === 'delete' ? 'destructive' : 'default'}
            >
              {isSubmitting ? 'Processing...' : `Confirm ${actionForm.action}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
