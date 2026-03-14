'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import * as React from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Mail, Phone, MapPin, CalendarDays, Briefcase, UserCircle,
  ShieldCheck, ShieldAlert, Edit3, Wallet, Building2, Users2,
  Clock, Loader2, ArrowLeft, RefreshCw, AlertCircle, Eye, Target,
  FileText, User, Activity, Crown, Sparkles, Zap, Key
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminLoginLinkDialog } from "@/components/admin/admin-login-link-dialog";

// Types for API response
interface UserDetailResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: string;
    verificationStatus: string;
    country: string;
    isEmailVerified: boolean;
    lastLogin: string | null;
    initialCompanyName?: string;
    buyerPersonaType?: string;
    buyerPersonaOther?: string;
    investmentFocusDescription?: string;
    preferredInvestmentSize?: string;
    keyIndustriesOfInterest?: string;
    is_onboarding_completed: boolean;
    isOnboardingCompleted: boolean;
    onboarding_step_completed: number;
    onboardingStep: number;
    onboardingCompletedAt?: string;
    submittedDocuments?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    isPaid: boolean;
    listingCount: number;
    inquiryCount: number;
    recentListings: any[];
    recentInquiries: any[];
  };
  metadata: {
    fetchedAt: string;
    source: string;
  };
}

// Types for meme API
interface MemeResponse {
  postLink: string;
  subreddit: string;
  title: string;
  url: string;
  nsfw: boolean;
  spoiler: boolean;
  author: string;
  ups: number;
  preview: string[];
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<UserDetailResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('USER_NOT_FOUND');
    }
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

// Meme fetcher function
const memeFetcher = async (url: string): Promise<MemeResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Meme API Error: ${res.status}`);
  }
  return res.json();
};

// Utility component for formatted dates
function FormattedDate({ dateString }: { dateString?: string | null }) {
  const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (dateString) {
      const dateObj = new Date(dateString);
      if (!isNaN(dateObj.getTime())) {
        setFormattedDate(dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }));
      } else {
        setFormattedDate('Invalid Date');
      }
    } else {
      setFormattedDate('N/A');
    }
  }, [dateString]);

  return <span>{formattedDate || 'N/A'}</span>;
}

// Badge components
const getProfileVerificationBadge = (status: string, large: boolean = false) => {
  const iconSize = large ? "h-5 w-5 mr-2" : "h-3 w-3 mr-1";
  const textSize = large ? 'p-2 text-lg' : 'text-xs';

  switch (status) {
    case 'verified':
      return (
        <Badge className={`${textSize} bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 border-green-300 dark:border-green-600`}>
          <ShieldCheck className={iconSize} /> Verified
        </Badge>
      );
    case 'pending_verification':
      return (
        <Badge variant="secondary" className={`${textSize} bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-600`}>
          <ShieldAlert className={iconSize} /> Pending
        </Badge>
      );
    case 'anonymous':
      return <Badge variant="outline" className={textSize}>Anonymous</Badge>;
    case 'rejected':
      return <Badge variant="destructive" className={textSize}>Rejected</Badge>;
    default:
      return <Badge variant="outline" className={textSize}>{status}</Badge>;
  }
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { toast } = useToast();

  // State for admin login link dialog
  const [isLoginLinkDialogOpen, setIsLoginLinkDialogOpen] = React.useState(false);

  // Fetch user data with SWR
  const {
    data,
    error,
    isLoading,
    mutate: refetchUser
  } = useSWR<UserDetailResponse>(
    userId ? `/api/admin/users/${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  // Fetch a random meme for admin users
  const {
    data: memeData,
    error: memeError,
    isLoading: memeLoading,
    mutate: refreshMeme
  } = useSWR<MemeResponse>(
    data?.user?.role === 'admin' ? 'https://meme-api.com/gimme/wholesomememes' : null,
    memeFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Loading user details...</h3>
            <p className="text-muted-foreground text-sm">Fetching comprehensive user information</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error states
  if (error) {
    if (error.message === 'USER_NOT_FOUND') {
      notFound();
      return null;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load user details: {error.message}
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchUser()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin/users')}>
            Return to User List
          </Button>
        </div>
      </div>
    );
  }

  // Ensure data exists before rendering
  if (!data?.user) {
    notFound();
    return null;
  }

  const user = data.user;

  // Action handlers
  const handleTogglePaidStatus = async () => {
    try {
      // TODO: Implement API call to update paid status
      toast({
        title: "Feature Coming Soon",
        description: "Paid status management will be available once subscription system is implemented.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update paid status. Please try again.",
      });
    }
  };

  const handleRefreshData = () => {
    refetchUser();
    toast({
      title: "Data Refreshed",
      description: "User information has been updated.",
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
        <h1 className="text-3xl font-semibold tracking-tight flex items-center text-brand-dark-blue font-heading">
              <UserCircle className="h-8 w-8 mr-3 text-primary" />
              {user.fullName}
        </h1>
            <p className="text-muted-foreground">
              Last updated: <FormattedDate dateString={data.metadata.fetchedAt} />
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {user.role !== 'admin' ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsLoginLinkDialogOpen(true)}
                className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
              >
                <Key className="h-4 w-4 mr-2" />
                Generate Login Link
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/admin/verification-queue/${user.role === 'buyer' ? 'buyers' : 'sellers'}?userId=${user.id}`}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Manage Verification
                </Link>
              </Button>
              <Button variant="outline" onClick={handleTogglePaidStatus}>
                <Wallet className="h-4 w-4 mr-2" />
                Make {user.isPaid ? 'Free' : 'Paid'}
              </Button>
            </>
          ) : (
            <Button variant="outline" disabled className="opacity-50">
              <Crown className="h-4 w-4 mr-2" />
              Admin Account
            </Button>
          )}
        </div>
      </div>

      {/* Main Profile Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl text-brand-dark-blue font-heading">
                {user.fullName}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
                {user.role === 'admin' ? (
                  <>
                    <Badge className="bg-purple-500 text-white">Platform Admin</Badge>
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Full Access
                    </Badge>
                  </>
                ) : (
                  user.isPaid ? (
                    <Badge className="bg-green-500 text-white">Paid User</Badge>
                  ) : (
                    <Badge variant="secondary">Free User</Badge>
                  )
                )}
              </CardDescription>
            </div>
            {getProfileVerificationBadge(user.verificationStatus, true)}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-brand-dark-blue mb-2">Contact Information</h4>
              <p className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                <span className="font-medium mr-2">Email:</span>
                {user.email}
              </p>
              <p className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                <span className="font-medium mr-2">Phone:</span>
                {user.phoneNumber}
              </p>
              <p className="flex items-center">
                <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                <span className="font-medium mr-2">Country:</span>
                {user.country}
              </p>
          </div>

            {/* Account Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-brand-dark-blue mb-2">Account Information</h4>
              <p className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-3 text-muted-foreground" />
                <span className="font-medium mr-2">Registered:</span>
                <FormattedDate dateString={user.createdAt} />
              </p>
              <p className="flex items-center">
                <ShieldCheck className="h-4 w-4 mr-3 text-muted-foreground" />
                <span className="font-medium mr-2">Email Verified:</span>
                {user.isEmailVerified ? 'Yes' : 'No'}
              </p>
              {user.lastLogin && (
                <p className="flex items-center">
                  <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span className="font-medium mr-2">Last Login:</span>
                  <FormattedDate dateString={user.lastLogin} />
                </p>
              )}
          </div>

            {/* Platform Activity - Different for Admin vs Regular Users */}
            <div className="space-y-3">
              {user.role === 'admin' ? (
                <>
                  <h4 className="font-semibold text-brand-dark-blue mb-2 flex items-center">
                    <Crown className="h-4 w-4 mr-2 text-purple-600" />
                    Admin Status
                  </h4>
                  <div className="flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-3 text-purple-600" />
                    <span className="font-medium mr-2">Access Level:</span>
                    <Badge className="bg-purple-100 text-purple-700">Maximum</Badge>
                  </div>
                  <p className="flex items-center">
                    <Users2 className="h-4 w-4 mr-3 text-purple-600" />
                    <span className="font-medium mr-2">Privileges:</span>
                    <span className="text-purple-700 font-medium">All Systems</span>
                  </p>
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-3 text-purple-600" />
                    <span className="font-medium mr-2">Security Clearance:</span>
                    <Badge className="bg-green-100 text-green-700">Maximum</Badge>
                  </div>
                  <p className="flex items-center">
                    <Zap className="h-4 w-4 mr-3 text-purple-600" />
                    <span className="font-medium mr-2">Role:</span>
                    <span className="text-purple-700 font-medium">Platform Administrator</span>
                  </p>
                </>
              ) : (
                <>
                  <h4 className="font-semibold text-brand-dark-blue mb-2">Platform Activity</h4>
                  <p className="flex items-center">
                    <Users2 className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span className="font-medium mr-2">Onboarding:</span>
                    {user.is_onboarding_completed ? 'Completed' : `Step ${user.onboarding_step_completed}`}
                  </p>
                  {user.role === 'seller' && (
                    <p className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span className="font-medium mr-2">Listings:</span>
                      {user.listingCount}
                    </p>
                  )}
                  <p className="flex items-center">
                    <Activity className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span className="font-medium mr-2">Inquiries:</span>
                    {user.inquiryCount}
                  </p>
                  {user.role === 'seller' && user.initialCompanyName && (
                    <p className="flex items-center">
                      <Building2 className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span className="font-medium mr-2">Company:</span>
                      {user.initialCompanyName}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Admin Section with Personality and Memes */}
      {user.role === 'admin' && (
        <Card className="shadow-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center justify-between">
              <div className="flex items-center">
                <Crown className="h-8 w-8 mr-3 animate-pulse" />
                You Are Admin LOL!
                <Sparkles className="h-6 w-6 ml-3 animate-bounce" />
              </div>
              {memeData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshMeme()}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Meme
                </Button>
              )}
            </CardTitle>
            <CardDescription className="text-purple-100">
              🎉 You're looking at a fellow admin's profile! Here's some wholesome content to brighten your day.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Admin Personality Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-purple-700">
                  <Zap className="h-5 w-5" />
                  <h4 className="font-semibold text-lg">Admin Powers Activated!</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-purple-100 text-purple-700">🚀 Super User</Badge>
                    <span>Can access all admin features</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-pink-100 text-pink-700">👑 Platform Master</Badge>
                    <span>Ultimate platform control</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-700">🔍 Data Detective</Badge>
                    <span>Can see all user analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-700">🛡️ Security Guardian</Badge>
                    <span>Verification queue master</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                  <p className="text-purple-800 text-sm font-medium">
                    💝 Fun Fact: You're viewing {user.fullName}'s admin profile. They probably know all the platform secrets!
                  </p>
                </div>
              </div>

              {/* Meme Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-pink-700">
                  <Sparkles className="h-5 w-5" />
                  <h4 className="font-semibold text-lg">Admin Mood Booster</h4>
                </div>

                {memeLoading && (
                  <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600 mb-2" />
                      <p className="text-sm text-gray-600">Loading wholesome meme...</p>
                    </div>
                  </div>
                )}

                {memeError && (
                  <div className="h-48 bg-red-50 rounded-lg border-2 border-red-200 flex items-center justify-center">
                    <div className="text-center text-red-600">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Memes are taking a break! 😴</p>
                    </div>
                  </div>
                )}

                {memeData && !memeLoading && (
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                      <img
                        src={memeData.url}
                        alt={memeData.title}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <h5 className="font-medium text-gray-800 text-sm mb-2">
                        {memeData.title}
                      </h5>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>r/{memeData.subreddit}</span>
                        <span>👍 {memeData.ups}</span>
                      </div>
                    </div>
                    <p className="text-xs text-center text-gray-500 italic">
                      Fresh meme delivered with admin love! 💖
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="profile_details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          <TabsTrigger value="profile_details">
            <User className="h-4 w-4 mr-2" />
            Profile Details
          </TabsTrigger>
          {user.role === 'buyer' && (
            <TabsTrigger value="buyer_persona">
              <Target className="h-4 w-4 mr-2" />
              Buyer Persona
            </TabsTrigger>
          )}
          {user.role !== 'admin' && (
            <TabsTrigger value="onboarding_info">
              <FileText className="h-4 w-4 mr-2" />
              Onboarding
            </TabsTrigger>
          )}
          <TabsTrigger value="activity_history">
            <Activity className="h-4 w-4 mr-2" />
            {user.role === 'admin' ? 'Admin Activity' : 'Activity'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile_details" className="space-y-6">
          <Card>
              <CardHeader>
              <CardTitle>Complete Profile Information</CardTitle>
              <CardDescription>
                Comprehensive view of user's profile data
              </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">User ID:</span>
                      <span className="font-mono text-xs">{user.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Full Name:</span>
                      <span>{user.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{user.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Country:</span>
                      <span>{user.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Role:</span>
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Account Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Verification Status:</span>
                      {user.role === 'admin' ? (
                        <Badge className="bg-purple-100 text-purple-700">Admin Account</Badge>
                      ) : (
                        getProfileVerificationBadge(user.verificationStatus)
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email Verified:</span>
                      <Badge variant={user.isEmailVerified ? "default" : "secondary"}>
                        {user.isEmailVerified ? "Yes" : "No"}
                      </Badge>
                    </div>
                    {user.role !== 'admin' && (
                      <div className="flex justify-between">
                        <span className="font-medium">Paid Status:</span>
                        <Badge variant={user.isPaid ? "default" : "secondary"}>
                          {user.isPaid ? "Paid" : "Free"}
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Created:</span>
                      <span><FormattedDate dateString={user.createdAt} /></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Last Updated:</span>
                      <span><FormattedDate dateString={user.updatedAt} /></span>
                    </div>
                    {user.lastLogin && (
                      <div className="flex justify-between">
                        <span className="font-medium">Last Login:</span>
                        <span><FormattedDate dateString={user.lastLogin} /></span>
                      </div>
                  )}
                  </div>
                </div>
              </div>
                </CardContent>
           </Card>
        </TabsContent>

        {user.role === 'buyer' && (
          <TabsContent value="buyer_persona" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buyer Persona Information</CardTitle>
                <CardDescription>
                  Investment preferences and buyer profile details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.buyerPersonaType && (
                    <div>
                      <span className="font-medium">Buyer Type:</span>
                      <p className="mt-1 text-sm text-muted-foreground">{user.buyerPersonaType}</p>
                    </div>
                  )}
                  {user.buyerPersonaOther && (
                    <div>
                      <span className="font-medium">Other Buyer Type:</span>
                      <p className="mt-1 text-sm text-muted-foreground">{user.buyerPersonaOther}</p>
                    </div>
                  )}
                  {user.investmentFocusDescription && (
                    <div>
                      <span className="font-medium">Investment Focus:</span>
                      <p className="mt-1 text-sm text-muted-foreground">{user.investmentFocusDescription}</p>
                    </div>
                  )}
                  {user.preferredInvestmentSize && (
                <div>
                      <span className="font-medium">Preferred Investment Size:</span>
                      <p className="mt-1 text-sm text-muted-foreground">{user.preferredInvestmentSize}</p>
                </div>
                  )}
                  {user.keyIndustriesOfInterest && (
                <div>
                      <span className="font-medium">Industries of Interest:</span>
                      <p className="mt-1 text-sm text-muted-foreground">{user.keyIndustriesOfInterest}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="onboarding_info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Information</CardTitle>
              <CardDescription>
                User's onboarding progress and submitted documents
              </CardDescription>
            </CardHeader>
                <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Onboarding Status:</span>
                  <Badge variant={user.is_onboarding_completed ? "default" : "secondary"}>
                    {user.is_onboarding_completed ? "Completed" : "In Progress"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Current Step:</span>
                  <span>{user.onboarding_step_completed}</span>
                </div>
                {user.onboardingCompletedAt && (
                  <div className="flex justify-between">
                    <span className="font-medium">Completed At:</span>
                    <span><FormattedDate dateString={user.onboardingCompletedAt} /></span>
                  </div>
                )}
                {user.submittedDocuments && Object.keys(user.submittedDocuments).length > 0 && (
                  <div>
                    <span className="font-medium">Submitted Documents:</span>
                    <div className="mt-2 space-y-1">
                      {Object.entries(user.submittedDocuments).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
              </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="activity_history" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {user.role === 'admin' ? 'Administrative Activity' : 'Platform Activity Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.role === 'admin' ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Access Level:</span>
                      <Badge className="bg-purple-100 text-purple-700">System Administrator</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Admin Privileges:</span>
                      <Badge className="bg-green-100 text-green-700">Full Platform Control</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Data Access:</span>
                      <Badge className="bg-blue-100 text-blue-700">All Users & Analytics</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Management:</span>
                      <Badge className="bg-orange-100 text-orange-700">Verification & Content</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Listings:</span>
                      <Badge variant="outline">{user.listingCount}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Inquiries:</span>
                      <Badge variant="outline">{user.inquiryCount}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.role === 'admin' ? (
                  <>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/admin/analytics">
                        <Activity className="h-4 w-4 mr-2" />
                        View Analytics Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/admin/users">
                        <Users2 className="h-4 w-4 mr-2" />
                        Manage All Users
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/admin/verification-queue/buyers">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Verification Queue
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/admin/listings?sellerId=${user.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View User's Listings
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/admin/conversations?userId=${user.id}`}>
                        <Activity className="h-4 w-4 mr-2" />
                        View Conversations
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Admin Login Link Dialog */}
      <AdminLoginLinkDialog
        isOpen={isLoginLinkDialogOpen}
        onOpenChange={setIsLoginLinkDialogOpen}
        targetUser={user.role !== 'admin' ? {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        } : null}
      />
    </div>
  );
}

