'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Mail, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// API endpoint for fetching email logs
const EMAIL_LOGS_API = '/api/admin/email-logs';

interface EmailLog {
  id: string;
  recipient_email: string;
  sender_email: string | null;
  subject: string;
  template_type: string | null;
  email_provider: string;
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed' | 'clicked' | 'opened';
  external_id: string | null;
  error_message: string | null;
  user_id: string | null;
  metadata: any;
  created_at: string;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  sent: 'bg-blue-100 text-blue-800 border-blue-200', 
  delivered: 'bg-green-100 text-green-800 border-green-200',
  opened: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  clicked: 'bg-purple-100 text-purple-800 border-purple-200',
  bounced: 'bg-orange-100 text-orange-800 border-orange-200',
  failed: 'bg-red-100 text-red-800 border-red-200'
};

const STATUS_ICONS = {
  pending: Clock,
  sent: Mail,
  delivered: CheckCircle2,
  opened: ExternalLink,
  clicked: ExternalLink,
  bounced: AlertCircle,
  failed: XCircle
};

export default function EmailLogsPage() {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTemplateType, setSelectedTemplateType] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('all');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    successRate: 0
  });

  // Fetch email logs
  const fetchEmailLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        limit: '500'
      });

      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedTemplateType !== 'all') params.set('template_type', selectedTemplateType);
      if (selectedProvider !== 'all') params.set('provider', selectedProvider);
      if (selectedTrigger !== 'all') params.set('trigger', selectedTrigger);
      if (searchEmail) params.set('search', searchEmail);

      const response = await fetch(`${EMAIL_LOGS_API}?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const data = result.data || [];

      setEmailLogs(data);
      
      // Calculate stats
      const total = data.length;
      const sent = data.filter((log: EmailLog) => ['sent', 'delivered', 'opened', 'clicked'].includes(log.status)).length;
      const delivered = data.filter((log: EmailLog) => ['delivered', 'opened', 'clicked'].includes(log.status)).length;
      const failed = data.filter((log: EmailLog) => ['failed', 'bounced'].includes(log.status)).length;
      const successRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

      setStats({ total, sent, delivered, failed, successRate });

    } catch (err) {
      console.error('Error fetching email logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load email logs');
    } finally {
      setLoading(false);
    }
  };

  // Filter logs
  useEffect(() => {
    let filtered = emailLogs;

    // Search by email
    if (searchEmail) {
      filtered = filtered.filter(log => 
        log.recipient_email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(log => log.status === selectedStatus);
    }

    // Filter by template type
    if (selectedTemplateType !== 'all') {
      filtered = filtered.filter(log => log.template_type === selectedTemplateType);
    }

    // Filter by provider
    if (selectedProvider !== 'all') {
      filtered = filtered.filter(log => log.email_provider === selectedProvider);
    }

    // Filter by trigger
    if (selectedTrigger !== 'all') {
      filtered = filtered.filter(log => log.metadata?.trigger === selectedTrigger);
    }

    setFilteredLogs(filtered);
  }, [emailLogs, searchEmail, selectedStatus, selectedTemplateType, selectedProvider, selectedTrigger]);

  // Get unique values for filter dropdowns
  const uniqueTemplateTypes = [...new Set(emailLogs.map(log => log.template_type).filter(Boolean))];
  const uniqueProviders = [...new Set(emailLogs.map(log => log.email_provider).filter(Boolean))];
  const uniqueTriggers = [...new Set(emailLogs.map(log => log.metadata?.trigger).filter(Boolean))];

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading email logs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Error: {error}</span>
          </div>
          <Button onClick={fetchEmailLogs} className="mt-4" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Email Logs</h1>
          <p className="text-muted-foreground">
            Track and monitor all email delivery attempts
          </p>
        </div>
        <Button onClick={fetchEmailLogs} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.total.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600">{stats.sent.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">{stats.delivered.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-600">{stats.failed.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.successRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter email logs by recipient, status, template type, or provider</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Email</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by recipient email..." 
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="opened">Opened</SelectItem>
                  <SelectItem value="clicked">Clicked</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Template Type</label>
              <Select value={selectedTemplateType} onValueChange={setSelectedTemplateType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  {uniqueTemplateTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Provider</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {uniqueProviders.map(provider => (
                    <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trigger</label>
              <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Triggers</SelectItem>
                  <SelectItem value="initial_registration">Initial Registration</SelectItem>
                  <SelectItem value="manual_resend">Manual Resend</SelectItem>
                  <SelectItem value="auto_retry">Auto Retry</SelectItem>
                  <SelectItem value="admin_resend">Admin Resend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Email Logs ({filteredLogs.length.toLocaleString()})</CardTitle>
          <CardDescription>Recent email delivery attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No email logs found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => {
                    const StatusIcon = STATUS_ICONS[log.status] || Mail;
                    
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.recipient_email}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={log.subject}>
                            {log.subject}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[log.status] || 'bg-gray-100 text-gray-800'}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {log.template_type || 'N/A'}
                          </code>
                        </TableCell>
                        <TableCell>
                          {log.metadata?.trigger ? (
                            <Badge 
                              variant="outline" 
                              className={
                                log.metadata.trigger === 'initial_registration' 
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : log.metadata.trigger === 'manual_resend'
                                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                  : log.metadata.trigger === 'auto_retry'
                                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }
                            >
                              {log.metadata.trigger.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.email_provider}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {log.sent_at 
                              ? formatDistanceToNow(new Date(log.sent_at), { addSuffix: true })
                              : formatDistanceToNow(new Date(log.created_at), { addSuffix: true })
                            }
                          </div>
                          {log.external_id && (
                            <div className="text-xs text-muted-foreground font-mono">
                              {log.external_id.substring(0, 8)}...
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.error_message ? (
                            <div 
                              className="text-xs text-red-600 max-w-[200px] truncate" 
                              title={log.error_message}
                            >
                              {log.error_message}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}