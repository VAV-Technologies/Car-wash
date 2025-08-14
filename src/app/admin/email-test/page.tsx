'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, CheckCircle2, XCircle, Info } from 'lucide-react';

export default function EmailTestPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [configData, setConfigData] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});
  const { toast } = useToast();

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test/email-config');
      const data = await response.json();
      setConfigData(data.config);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch email configuration"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testEmail = async (type: string) => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter an email address to test"
      });
      return;
    }

    setIsLoading(true);
    setTestResults(prev => ({ ...prev, [type]: { loading: true } }));

    try {
      const response = await fetch('/api/test/email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type })
      });

      const data = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [type]: {
          loading: false,
          success: data.success,
          data: data
        }
      }));

      if (data.success) {
        toast({
          title: "Test Email Sent",
          description: `Check ${email} for the test email`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Test Failed",
          description: data.error
        });
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [type]: {
          loading: false,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send test email"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration Test</CardTitle>
          <CardDescription>
            Test and debug email delivery configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="test">Send Test</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-4">
              <Button onClick={fetchConfig} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Check Configuration'
                )}
              </Button>

              {configData && (
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Environment: {configData.environment}</AlertTitle>
                    <AlertDescription>
                      Running in {configData.environment} mode
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Resend API Key:</span>
                      <span className={configData.hasResendKey ? 'text-green-600' : 'text-red-600'}>
                        {configData.hasResendKey ? `✓ ${configData.resendKeyPreview}` : '✗ Not Set'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Supabase URL:</span>
                      <span className="font-mono text-xs">{configData.supabaseUrl}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Service Role Key:</span>
                      <span className={configData.hasServiceKey ? 'text-green-600' : 'text-red-600'}>
                        {configData.hasServiceKey ? '✓ Set' : '✗ Not Set'}
                      </span>
                    </div>
                  </div>

                  {configData.emailServiceStatus && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Email Service Status</h4>
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(configData.emailServiceStatus, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Test Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => testEmail('resend-direct')}
                  disabled={isLoading || testResults['resend-direct']?.loading}
                  variant="outline"
                  className="w-full justify-start"
                >
                  {testResults['resend-direct']?.loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : testResults['resend-direct']?.success ? (
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                  ) : testResults['resend-direct']?.success === false ? (
                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  Test Resend Direct API
                </Button>

                <Button
                  onClick={() => testEmail('supabase-auth')}
                  disabled={isLoading || testResults['supabase-auth']?.loading}
                  variant="outline"
                  className="w-full justify-start"
                >
                  {testResults['supabase-auth']?.loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : testResults['supabase-auth']?.success ? (
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                  ) : testResults['supabase-auth']?.success === false ? (
                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  Test Supabase Auth Email
                </Button>

                <Button
                  onClick={() => testEmail('email-service')}
                  disabled={isLoading || testResults['email-service']?.loading}
                  variant="outline"
                  className="w-full justify-start"
                >
                  {testResults['email-service']?.loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : testResults['email-service']?.success ? (
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                  ) : testResults['email-service']?.success === false ? (
                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  Test Email Service
                </Button>
              </div>

              {Object.entries(testResults).map(([type, result]: [string, any]) => (
                result && !result.loading && (
                  <Alert key={type} variant={result.success ? "default" : "destructive"}>
                    <AlertTitle>{type}</AlertTitle>
                    <AlertDescription>
                      <pre className="text-xs mt-2 overflow-auto">
                        {JSON.stringify(result.data || result.error, null, 2)}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )
              ))}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Testing Steps</AlertTitle>
                <AlertDescription className="space-y-1 text-xs mt-2">
                  <p>1. <strong>Resend Direct</strong> - Tests Resend API directly (uses test domain)</p>
                  <p>2. <strong>Supabase Auth</strong> - Tests Supabase's email system with your SMTP</p>
                  <p>3. <strong>Email Service</strong> - Tests your app's email service wrapper</p>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}