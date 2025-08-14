'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, CheckCircle2, XCircle, AlertTriangle, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UnverifiedUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: any;
}

interface ResendResult {
  email: string;
  status: 'sent' | 'already_verified';
  message: string;
  service?: string;
  attempts?: number;
}

interface ResendError {
  email: string;
  error: string;
  debug?: any;
}

export default function EmailRecoveryPage() {
  const [emails, setEmails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [results, setResults] = useState<ResendResult[]>([]);
  const [errors, setErrors] = useState<ResendError[]>([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState<UnverifiedUser[]>([]);
  const { toast } = useToast();

  // Fetch unverified users on component mount
  useEffect(() => {
    fetchUnverifiedUsers();
  }, []);

  const fetchUnverifiedUsers = async () => {
    setIsFetching(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in as an admin to access this page."
        });
        return;
      }

      const response = await fetch('/api/admin/resend-verification-emails', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unverified users');
      }

      const data = await response.json();
      setUnverifiedUsers(data.users || []);
      
      // Auto-populate emails field with unverified users
      if (data.users && data.users.length > 0) {
        const emailList = data.users.map((u: UnverifiedUser) => u.email).join('\n');
        setEmails(emailList);
      }
    } catch (error) {
      console.error('Error fetching unverified users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch unverified users"
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleResendEmails = async () => {
    if (!emails.trim()) {
      toast({
        variant: "destructive",
        title: "No Emails Provided",
        description: "Please enter email addresses to resend verification emails to."
      });
      return;
    }

    setIsLoading(true);
    setResults([]);
    setErrors([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in as an admin to perform this action."
        });
        return;
      }

      // Parse emails from textarea (one per line)
      const emailList = emails
        .split('\n')
        .map(e => e.trim())
        .filter(e => e.length > 0);

      const response = await fetch('/api/admin/resend-verification-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ emails: emailList })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend emails');
      }

      setResults(data.results || []);
      setErrors(data.errors || []);

      // Show summary toast
      if (data.summary) {
        toast({
          title: "Email Resend Complete",
          description: `Sent: ${data.summary.successful}, Already Verified: ${data.summary.already_verified}, Failed: ${data.summary.failed}`
        });
      }

      // Refresh unverified users list
      await fetchUnverifiedUsers();

    } catch (error) {
      console.error('Error resending emails:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend emails"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Recovery Tool
          </CardTitle>
          <CardDescription>
            Manually resend verification emails to users who didn't receive them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Unverified Users Summary */}
          <Alert>
            <Users className="h-4 w-4" />
            <AlertTitle>Unverified Users</AlertTitle>
            <AlertDescription>
              {isFetching ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading unverified users...
                </span>
              ) : (
                <>
                  Found {unverifiedUsers.length} unverified users
                  {unverifiedUsers.length > 0 && (
                    <div className="mt-2 text-xs">
                      Most recent: {new Date(unverifiedUsers[0].created_at).toLocaleDateString()}
                    </div>
                  )}
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Email Addresses (one per line)
            </label>
            <Textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter email addresses of users who need verification emails resent
            </p>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleResendEmails} 
            disabled={isLoading || !emails.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Emails...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Resend Verification Emails
              </>
            )}
          </Button>

          {/* Results */}
          {(results.length > 0 || errors.length > 0) && (
            <div className="space-y-4">
              <h3 className="font-medium">Results</h3>
              
              {/* Success Results */}
              {results.length > 0 && (
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{result.email}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {result.status === 'sent' ? `Sent via ${result.service}` : result.message}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div className="space-y-2">
                  {errors.map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-md">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">{error.email}</span>
                      </div>
                      <span className="text-xs text-red-600">{error.error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Notes</AlertTitle>
            <AlertDescription className="space-y-2 text-xs">
              <p>• Make sure Custom SMTP is configured in Supabase Dashboard</p>
              <p>• Emails are sent with a 1-second delay to avoid rate limiting</p>
              <p>• Already verified emails will be skipped automatically</p>
              <p>• Check the Supabase Auth logs if emails continue to fail</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}