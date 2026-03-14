
'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { MetricCard } from "@/components/admin/metric-card"; // Import MetricCard
import {
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  User,
  Building,
  DollarSign,
  Calendar,
  AlertTriangle,
  Loader2,
  FileText,
  Eye,
  RefreshCw,
  Inbox,
  ChevronLeft,
  ChevronRight,
  GitPullRequestArrow // For appeals icon
} from "lucide-react";

interface Appeal {
  id: string;
  listing_id: string;
  seller_id: string;
  appeal_message: string;
  original_rejection_reason: string;
  original_rejection_category: string;
  status: 'pending' | 'under_review' | 'approved' | 'denied';
  admin_response?: string;
  reviewed_by?: string;
  created_at: string;
  reviewed_at?: string;
  listing?: {
    id: string;
    title: string;
    industry: string;
    asking_price: number;
    status: string;
    admin_notes?: string;
    rejection_category?: string;
    admin_action_at?: string;
  };
  seller?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    verification_status: string;
  };
  reviewer?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface AppealSummary {
  total: number;
  pending: number;
  under_review: number;
  approved: number;
  denied: number;
}

export default function AdminAppealsPage() {
  const { toast } = useToast();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [summary, setSummary] = useState<AppealSummary>({ total: 0, pending: 0, under_review: 0, approved: 0, denied: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewDialog, setReviewDialog] = useState<{ isOpen: boolean; appeal: Appeal | null; action: 'approve' | 'deny' | null; }>({ isOpen: false, appeal: null, action: null });
  const [adminResponse, setAdminResponse] = useState('');

  const fetchAppeals = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ page: currentPage.toString(), limit: '10', sort_by: 'created_at', sort_order: 'desc' });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      const response = await fetch(`/api/admin/appeals?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAppeals(data.appeals || []);
        setSummary(data.summary || { total: 0, pending: 0, under_review: 0, approved: 0, denied: 0 });
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        throw new Error('Failed to fetch appeals');
      }
    } catch (error) {
      console.error('Error fetching appeals:', error);
      toast({ title: "Error Loading Appeals", description: "Failed to load appeals. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, [currentPage, statusFilter, searchQuery]);

  const handleAppealReview = async () => {
    if (!reviewDialog.appeal || !reviewDialog.action || !adminResponse.trim()) {
      toast({ title: "Response Required", description: "Please provide a detailed response explaining your decision.", variant: "destructive" });
      return;
    }
    try {
      setIsProcessing(reviewDialog.appeal.id);
      const endpoint = reviewDialog.action === 'approve' ? 'approve' : 'deny';
      const response = await fetch(`/api/admin/appeals/${reviewDialog.appeal.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminResponse: adminResponse.trim() })
      });
      if (response.ok) {
        const result = await response.json();
        setAppeals(prev => prev.map(appeal => appeal.id === reviewDialog.appeal!.id ? { ...appeal, status: result.appeal.status, admin_response: result.appeal.admin_response, reviewed_by: result.appeal.reviewed_by, reviewed_at: result.appeal.reviewed_at } : appeal));
        fetchAppeals(); // Refetch summary and potentially updated list order
        toast({ title: `✅ Appeal ${reviewDialog.action === 'approve' ? 'Approved' : 'Denied'}`, description: result.message });
        setReviewDialog({ isOpen: false, appeal: null, action: null });
        setAdminResponse('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${reviewDialog.action} appeal`);
      }
    } catch (error) {
      console.error(`Error ${reviewDialog.action}ing appeal:`, error);
      toast({ title: `❌ ${reviewDialog.action === 'approve' ? 'Approval' : 'Denial'} Failed`, description: error instanceof Error ? error.message : `Failed to ${reviewDialog.action} appeal`, variant: "destructive" });
    } finally {
      setIsProcessing(null);
    }
  };

  const openReviewDialog = (appeal: Appeal, action: 'approve' | 'deny') => {
    setReviewDialog({ isOpen: true, appeal, action });
    setAdminResponse('');
  };

  const getStatusBadge = (status: Appeal['status']) => {
    const badgeClasses = "text-xs px-2 py-1";
    switch (status) {
      case 'pending': return <Badge className={`${badgeClasses} bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/20 dark:text-blue-300`}><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'under_review': return <Badge className={`${badgeClasses} bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-700/20 dark:text-purple-300`}><Eye className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'approved': return <Badge className={`${badgeClasses} bg-green-100 text-green-700 border-green-300 dark:bg-green-700/20 dark:text-green-300`}><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'denied': return <Badge variant="destructive" className={`${badgeClasses} bg-red-100 text-red-700 border-red-300 dark:bg-red-700/20 dark:text-red-300`}><XCircle className="h-3 w-3 mr-1" />Denied</Badge>;
      default: return <Badge variant="outline" className={badgeClasses}>{status}</Badge>;
    }
  };

  const getRejectionCategoryDisplay = (category?: string) => {
    const categoryMap: Record<string, string> = { 'quality': 'Poor Quality', 'compliance': 'Policy Violation', 'incomplete': 'Incomplete Information', 'fraud': 'Suspected Fraud', 'duplicate': 'Duplicate Listing', 'inappropriate': 'Inappropriate Content', 'other': 'Other' };
    return category ? categoryMap[category] || category : 'Not specified';
  };

  if (isLoading && appeals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"> <Skeleton className="h-8 w-64" /> <Skeleton className="h-10 w-32" /> </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4"> {[...Array(5)].map((_, i) => <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-16 mb-2" /><Skeleton className="h-8 w-12" /></CardContent></Card>)} </div>
        <div className="space-y-4"> {[...Array(3)].map((_, i) => <Card key={i}><CardContent className="p-6"><div className="space-y-4"><div className="flex justify-between items-start"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-6 w-1/5" /></div><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><div className="flex gap-2"><Skeleton className="h-8 w-20" /><Skeleton className="h-8 w-20" /></div></div></CardContent></Card>)} </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight font-heading">Appeal Management</h1>
          <p className="text-muted-foreground">Review and manage listing rejection appeals.</p>
        </div>
        <Button onClick={fetchAppeals} variant="outline" size="sm"> <RefreshCw className="h-4 w-4 mr-2" /> Refresh Appeals </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard title="Total Appeals" value={summary.total} icon={GitPullRequestArrow} />
        <MetricCard title="Pending" value={summary.pending} icon={Clock} trendDirection={summary.pending > 0 ? 'down' : 'neutral'} className="text-blue-600" />
        <MetricCard title="Under Review" value={summary.under_review} icon={Eye} trendDirection={summary.under_review > 0 ? 'down' : 'neutral'} className="text-purple-600" />
        <MetricCard title="Approved" value={summary.approved} icon={CheckCircle2} trendDirection="up" className="text-green-600" />
        <MetricCard title="Denied" value={summary.denied} icon={XCircle} trendDirection="down" className="text-red-600" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by listing title, seller name/email, or appeal ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="under_review">Under Review</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="denied">Denied</SelectItem></SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /> <p className="mt-2 text-muted-foreground">Loading appeals...</p></div>
      ) : appeals.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="p-12 text-center">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">No Appeals Found</h3>
            <p className="text-muted-foreground">{statusFilter !== 'all' || searchQuery ? 'No appeals match your current filters.' : 'No appeals have been submitted yet.'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal) => (
            <Card key={appeal.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4 bg-muted/30">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                      <Building className="h-4 w-4 text-primary" />
                      <Link href={`/listings/${appeal.listing_id}`} className="hover:underline">{appeal.listing?.title || 'Unknown Listing'}</Link>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />Seller: <Link href={`/admin/users/${appeal.seller_id}`} className="hover:underline text-primary/80">{appeal.seller?.first_name} {appeal.seller?.last_name}</Link></span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />Asking: ${appeal.listing?.asking_price?.toLocaleString() || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Submitted: {new Date(appeal.created_at).toLocaleDateString()}</span>
                    </CardDescription>
                  </div>
                  {getStatusBadge(appeal.status)}
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4">
                <Alert variant="destructive" className="border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/30">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-sm font-semibold text-red-800 dark:text-red-300">Original Rejection: {getRejectionCategoryDisplay(appeal.original_rejection_category)}</AlertTitle>
                  {appeal.original_rejection_reason && <AlertDescription className="text-xs text-red-700 dark:text-red-400 mt-1">{appeal.original_rejection_reason}</AlertDescription>}
                </Alert>
                <div>
                  <h4 className="font-medium mb-1 text-sm text-foreground flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary"/>Seller's Appeal Message:</h4>
                  <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">{appeal.appeal_message}</div>
                </div>
                {appeal.admin_response && (
                  <div>
                    <h4 className="font-medium mb-1 text-sm text-foreground flex items-center gap-2"><FileText className="h-4 w-4 text-primary"/>Admin Response <span className="text-xs text-muted-foreground">by {appeal.reviewer?.first_name || 'Admin'}</span></h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300  whitespace-pre-wrap max-h-32 overflow-y-auto">{appeal.admin_response}</div>
                    {appeal.reviewed_at && <div className="text-xs text-muted-foreground mt-1">Reviewed on {new Date(appeal.reviewed_at).toLocaleDateString()}</div>}
                  </div>
                )}
                {(appeal.status === 'pending' || appeal.status === 'under_review') && (
                  <div className="flex gap-2 pt-2 border-t mt-4">
                    <Button onClick={() => openReviewDialog(appeal, 'approve')} disabled={isProcessing === appeal.id} size="sm" className="bg-green-600 hover:bg-green-700 text-white"> {isProcessing === appeal.id && appeal.id === reviewDialog.appeal?.id && reviewDialog.action === 'approve' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />} Approve </Button>
                    <Button onClick={() => openReviewDialog(appeal, 'deny')} disabled={isProcessing === appeal.id} size="sm" variant="destructive"> {isProcessing === appeal.id && appeal.id === reviewDialog.appeal?.id && reviewDialog.action === 'deny' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />} Deny </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button variant="outline" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1 || isLoading} size="sm"><ChevronLeft className="h-4 w-4 mr-1"/>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || isLoading} size="sm">Next<ChevronRight className="h-4 w-4 ml-1"/></Button>
        </div>
      )}

      <Dialog open={reviewDialog.isOpen} onOpenChange={(open) => { if (!open) { setReviewDialog({ isOpen: false, appeal: null, action: null }); setAdminResponse(''); } }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-heading"> {reviewDialog.action === 'approve' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />} {reviewDialog.action === 'approve' ? 'Approve' : 'Deny'} Appeal </DialogTitle>
            <DialogDescription> {reviewDialog.action === 'approve' ? 'Approving this appeal will restore the listing.' : 'Denying this appeal will keep the listing rejected.'} Please provide a detailed response for the seller. </DialogDescription>
          </DialogHeader>
          {reviewDialog.appeal && (
            <div className="space-y-4 py-4">
              <Alert variant={reviewDialog.action === 'approve' ? "default" : "destructive"} className={`border-${reviewDialog.action === 'approve' ? 'green' : 'red'}-300 bg-${reviewDialog.action === 'approve' ? 'green' : 'red'}-50 dark:bg-${reviewDialog.action === 'approve' ? 'green' : 'red'}-900/30`}>
                <MessageCircle className={`h-4 w-4 text-${reviewDialog.action === 'approve' ? 'green' : 'red'}-600`} />
                <AlertTitle className={`font-medium text-sm text-${reviewDialog.action === 'approve' ? 'green' : 'red'}-800 dark:text-${reviewDialog.action === 'approve' ? 'green' : 'red'}-200`}>Appeal for: {reviewDialog.appeal.listing?.title}</AlertTitle>
                <AlertDescription className={`text-xs text-${reviewDialog.action === 'approve' ? 'green' : 'red'}-700 dark:text-${reviewDialog.action === 'approve' ? 'green' : 'red'}-300`}>Seller: {reviewDialog.appeal.seller?.first_name} {reviewDialog.appeal.seller?.last_name}</AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="admin-response" className="text-sm font-medium">Your Response to Seller *</Label>
                <Textarea id="admin-response" placeholder={reviewDialog.action === 'approve' ? "Explain why the appeal was approved..." : "Explain why the appeal was denied..."} value={adminResponse} onChange={(e) => setAdminResponse(e.target.value)} rows={5} className="resize-none text-sm" />
                <div className="text-xs text-muted-foreground">{adminResponse.length}/1000 characters</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReviewDialog({ isOpen: false, appeal: null, action: null }); setAdminResponse(''); }} disabled={isProcessing !== null}>Cancel</Button>
            <Button onClick={handleAppealReview} disabled={isProcessing !== null || !adminResponse.trim() || adminResponse.length > 1000} className={reviewDialog.action === 'approve' ? "bg-green-600 hover:bg-green-700 text-white" : ""}> {isProcessing !== null ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : <>{reviewDialog.action === 'approve' ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />} {reviewDialog.action === 'approve' ? 'Approve Appeal' : 'Deny Appeal'}</>} </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
