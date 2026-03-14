
import * as React from 'react';
import { sampleListings, sampleUsers } from "@/lib/placeholder-data";
import type { Listing, User } from "@/lib/types";
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, DollarSign, Briefcase, ShieldCheck, ShieldAlert, CalendarDays, Users as UsersIcon, Info, TrendingUp, Tag, HandCoins, Edit, Trash2, FileText, Clock, Building, Brain, Globe, Link as LinkIconLucide, ImagePlus, Banknote } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NobridgeIcon, NobridgeIconType } from '@/components/ui/nobridge-icon';


async function getListingDetails(id: string): Promise<Listing | undefined> {
  return sampleListings.find(listing => listing.id === id);
}

async function getSellerDetails(sellerId: string): Promise<User | undefined> {
  return sampleUsers.find(user => user.id === sellerId && user.role === 'seller');
}

export default async function AdminListingDetailPage({ params }: { params: { listingId: string } }) {
  const { listingId } = await params;
  const listing = await getListingDetails(listingId);

  if (!listing) {
    notFound();
  }

  const seller = await getSellerDetails(listing.sellerId);

  const getListingStatusBadge = (status: Listing['status'], isSellerVerified: boolean) => {
    if (status === 'verified_public') return <Badge className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 border-green-300 dark:border-green-600"><ShieldCheck className="h-3 w-3 mr-1" /> Verified Public</Badge>;
    if (status === 'verified_anonymous') return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600"><ShieldCheck className="h-3 w-3 mr-1" /> Verified (Anon)</Badge>;
    if (status === 'pending_verification') return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-600"><AlertTriangle className="h-3 w-3 mr-1" /> Pending Verification</Badge>;
    if (status === 'active' && !isSellerVerified) return <Badge variant="outline">Active (Anonymous)</Badge>;
    if (status === 'active' && isSellerVerified) return <Badge className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 border-green-300 dark:border-green-600"><ShieldCheck className="h-3 w-3 mr-1" /> Active (Verified Seller)</Badge>;
    if (status === 'inactive') return <Badge variant="destructive">Inactive</Badge>;
    if (status === 'closed_deal') return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-600">Deal Closed</Badge>;
    if (status === 'rejected_by_admin') return <Badge variant="destructive" className="bg-red-700 text-white dark:bg-red-800 dark:text-red-200">Rejected</Badge>;
    return <Badge variant="outline" className="capitalize">{status.replace(/_/g, ' ')}</Badge>;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-3xl font-semibold tracking-tight flex items-center text-brand-dark-blue font-heading">
            <NobridgeIcon icon="business-listing" size="lg" className="mr-3" /> Listing Details: {listing.listingTitleAnonymous}
        </h1>
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <Button variant="outline" asChild>
              <Link href={`/admin/listings/${listingId}/edit`}>
                <Edit className="h-4 w-4 mr-2"/> Edit Listing
              </Link>
            </Button>
            <Button variant={(listing.status === 'active' || listing.status === 'verified_public' || listing.status === 'verified_anonymous') ? 'destructive' : 'default'}>
                {(listing.status === 'active' || listing.status === 'verified_public' || listing.status === 'verified_anonymous') ? <Trash2 className="h-4 w-4 mr-2"/> : <ShieldCheck className="h-4 w-4 mr-2"/>}
                {(listing.status === 'active' || listing.status === 'verified_public' || listing.status === 'verified_anonymous') ? 'Deactivate' : 'Activate'} Listing
            </Button>
             {listing.status === 'pending_verification' && (
                <Button variant="default" className="bg-green-600 hover:bg-green-700"><ShieldCheck className="h-4 w-4 mr-2"/> Approve & Mark Verified</Button>
             )}
             {listing.status === 'active' && (
                 <Button variant="outline" className="bg-yellow-500 hover:bg-yellow-600 text-white"><AlertTriangle className="h-4 w-4 mr-2"/> Request More Info</Button>
             )}
             {listing.status !== 'rejected_by_admin' && listing.status !== 'pending_verification' && (
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700"><AlertTriangle className="h-4 w-4 mr-2"/> Reject Listing</Button>
             )}
        </div>
      </div>

      <Card className="shadow-xl overflow-hidden bg-brand-white">
        <CardHeader className="p-0 relative">
            <Image
              src={listing.imageUrls?.[0] || "https://placehold.co/1200x400.png"}
              alt={listing.listingTitleAnonymous}
              width={1200}
              height={400}
              className="w-full h-64 md:h-80 object-cover"
              data-ai-hint={listing.imageUrls?.[0] ? "business operations factory" : "generic office space"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-brand-white tracking-tight font-heading">{listing.listingTitleAnonymous}</h2>
                <div className="mt-2 flex gap-2 flex-wrap">
                {getListingStatusBadge(listing.status, listing.isSellerVerified)}
                {seller && (
                  <Badge variant={seller.isPaid ? "default" : "secondary"} className={`${seller.isPaid ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'} border-transparent`}>
                    Seller: {seller.isPaid ? "Paid" : "Free"}
                  </Badge>
                )}
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="profileOps">Profile &amp; Ops</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="dealSeller">Deal &amp; Seller</TabsTrigger>
                    <TabsTrigger value="growth">Growth</TabsTrigger>
                    <TabsTrigger value="docsImages">Docs &amp; Images</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <section>
                            <h3 className="text-xl font-semibold text-brand-dark-blue mb-2 flex items-center font-heading"><Info className="h-5 w-5 mr-2 text-primary"/>Business Overview</h3>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.anonymousBusinessDescription}</p>
                        </section>
                        <Separator />
                        <section>
                            <h3 className="text-xl font-semibold text-brand-dark-blue mb-2 flex items-center font-heading"><TrendingUp className="h-5 w-5 mr-2 text-primary"/>Key Strengths</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-5">
                                {(listing.keyStrengthsAnonymous || []).map((strength, index) => (
                                <li key={index}>{strength}</li>
                                ))}
                            </ul>
                        </section>
                        {listing.reasonForSellingAnonymous && (
                            <><Separator /><section>
                                <h3 className="text-xl font-semibold text-brand-dark-blue mb-2 flex items-center font-heading"><Tag className="h-5 w-5 mr-2 text-primary"/>Reason for Selling</h3>
                                <p className="text-muted-foreground leading-relaxed">{listing.reasonForSellingAnonymous}</p>
                            </section></>
                        )}
                    </div>
                    <aside className="space-y-6 md:sticky md:top-24 h-fit">
                        <Card className="shadow-md bg-brand-light-gray/50">
                            <CardHeader><CardTitle className="text-lg text-brand-dark-blue font-heading">Listing Summary</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <p><span className="font-medium text-brand-dark-blue">Industry:</span> {listing.industry}</p>
                                <p><span className="font-medium text-brand-dark-blue">Location:</span> {listing.locationCityRegionGeneral}, {listing.locationCountry}</p>
                                <p><span className="font-medium text-brand-dark-blue">Annual Revenue:</span> {listing.annualRevenueRange}</p>
                                {listing.netProfitMarginRange && <p><span className="font-medium text-brand-dark-blue">Net Profit Margin:</span> {listing.netProfitMarginRange}</p>}
                                <p><span className="font-medium text-brand-dark-blue">Asking Price (USD):</span> {listing.askingPrice ? `$${listing.askingPrice.toLocaleString()}` : 'N/A'}</p>
                                {listing.adjustedCashFlow !== undefined && <p><span className="font-medium text-brand-dark-blue">Adjusted Cash Flow (USD):</span> ${listing.adjustedCashFlow.toLocaleString()}</p>}
                                {listing.dealStructureLookingFor && listing.dealStructureLookingFor.length > 0 && <p><span className="font-medium text-brand-dark-blue">Deal Structure:</span> {(listing.dealStructureLookingFor || []).join(', ')}</p>}
                                <p><span className="font-medium text-brand-dark-blue">Listed On:</span> {new Date(listing.createdAt).toLocaleDateString()}</p>
                                {seller && (
                                  <>
                                    <p><span className="font-medium text-brand-dark-blue">Seller:</span> <Link href={`/admin/users/${seller.id}`} className="text-primary hover:underline">{seller.fullName}</Link></p>
                                    <p><span className="font-medium text-brand-dark-blue">Seller Verified:</span> {seller.verificationStatus === 'verified' ? <Badge className="bg-green-100 text-green-700">Yes</Badge> : <Badge variant="secondary">No</Badge>}</p>
                                    <p><span className="font-medium text-brand-dark-blue">Seller Paid:</span> {seller.isPaid ? <Badge className="bg-green-100 text-green-700">Yes</Badge> : <Badge variant="secondary">No</Badge>}</p>
                                  </>
                                )}
                            </CardContent>
                        </Card>
                    </aside>
                </TabsContent>

                <TabsContent value="profileOps" className="space-y-6">
                     <h3 className="text-xl font-semibold text-brand-dark-blue mb-2 flex items-center font-heading"><Building className="h-5 w-5 mr-2 text-primary"/>Business Profile &amp; Operations</h3>
                     <div className="p-4 bg-brand-light-gray/30 rounded-lg border border-brand-light-gray space-y-3 text-sm">
                        <p><span className="font-medium text-brand-dark-blue">Business Model:</span> {listing.businessModel || 'N/A'}</p>
                        <p><span className="font-medium text-brand-dark-blue">Year Established:</span> {listing.yearEstablished || 'N/A'}</p>
                        <p><span className="font-medium text-brand-dark-blue">Registered Business Name:</span> {listing.registeredBusinessName || 'N/A'}</p>
                        <p><span className="font-medium text-brand-dark-blue">Actual Company Name (if different):</span> {listing.actualCompanyName || 'N/A'}</p>
                        <p><span className="font-medium text-brand-dark-blue">Full Business Address:</span> {listing.fullBusinessAddress || 'N/A'}</p>
                        <p><span className="font-medium text-brand-dark-blue">Business Website:</span> {listing.businessWebsiteUrl ? <Link href={listing.businessWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{listing.businessWebsiteUrl}</Link> : 'N/A'}</p>
                        <div><span className="font-medium text-brand-dark-blue">Social Media:</span> <pre className="text-muted-foreground whitespace-pre-wrap text-xs">{listing.socialMediaLinks || 'N/A'}</pre></div>
                        <p><span className="font-medium text-brand-dark-blue">Number of Employees:</span> {listing.numberOfEmployees || 'N/A'}</p>
                        <div><span className="font-medium text-brand-dark-blue">Technology Stack:</span> <p className="text-muted-foreground whitespace-pre-wrap text-xs">{listing.technologyStack || 'N/A'}</p></div>
                     </div>
                </TabsContent>

                <TabsContent value="financials" className="space-y-6">
                    <h3 className="text-xl font-semibold text-brand-dark-blue mb-2 flex items-center font-heading"><NobridgeIcon icon="calculator" size="md" className="mr-2"/>Financial Details</h3>
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-brand-light-gray/30 rounded-lg border border-brand-light-gray text-sm">
                        <p><span className="font-medium text-brand-dark-blue">Specific Annual Revenue (TTM):</span> {listing.specificAnnualRevenueLastYear ? `$${listing.specificAnnualRevenueLastYear.toLocaleString()} USD` : 'N/A'}</p>
                        <p><span className="font-medium text-brand-dark-blue">Specific Net Profit (TTM):</span> {listing.specificNetProfitLastYear ? `$${listing.specificNetProfitLastYear.toLocaleString()} USD` : 'N/A'}</p>
                        <p><span className="font-medium text-brand-dark-blue">Adjusted Cash Flow (TTM):</span> {listing.adjustedCashFlow !== undefined ? `$${listing.adjustedCashFlow.toLocaleString()} USD` : 'N/A'}</p>
                        {listing.adjustedCashFlowExplanation && <p className="md:col-span-2"><span className="font-medium text-brand-dark-blue">Adj. Cash Flow Explanation:</span> {listing.adjustedCashFlowExplanation}</p>}
                    </div>
                </TabsContent>

                <TabsContent value="dealSeller" className="space-y-6">
                     <h3 className="text-xl font-semibold text-brand-dark-blue mb-2 flex items-center font-heading"><NobridgeIcon icon="deal-structure" size="md" className="mr-2"/>Deal &amp; Seller Information</h3>
                     <div className="p-4 bg-brand-light-gray/30 rounded-lg border border-brand-light-gray space-y-3 text-sm">
                        <div><h4 className="font-semibold text-brand-dark-blue font-heading">Detailed Reason for Selling:</h4> <p className="text-muted-foreground whitespace-pre-wrap text-xs">{listing.detailedReasonForSelling || 'N/A'}</p></div>
                        <div><h4 className="font-semibold text-brand-dark-blue font-heading">Seller Role & Time Commitment:</h4> <p className="text-muted-foreground whitespace-pre-wrap text-xs">{listing.sellerRoleAndTimeCommitment || 'N/A'}</p></div>
                        <div><h4 className="font-semibold text-brand-dark-blue font-heading">Post-Sale Transition Support:</h4> <p className="text-muted-foreground whitespace-pre-wrap text-xs">{listing.postSaleTransitionSupport || 'N/A'}</p></div>
                     </div>
                </TabsContent>

                <TabsContent value="growth" className="space-y-6">
                    <h3 className="text-xl font-semibold text-brand-dark-blue mb-2 flex items-center font-heading"><NobridgeIcon icon="growth" size="md" className="mr-2"/>Specific Growth Opportunities</h3>
                     <div className="p-4 bg-brand-light-gray/30 rounded-lg border border-brand-light-gray space-y-3 text-sm">
                        <ul className="list-disc list-inside text-muted-foreground leading-relaxed pl-1">
                          {(listing.specificGrowthOpportunities || "").split('\n').map((line, index) => (
                            line.trim() && <li key={index}>{line.trim().replace(/^- /, '')}</li>
                          ))}
                          {!listing.specificGrowthOpportunities && <li>N/A</li>}
                        </ul>
                     </div>
                </TabsContent>

                <TabsContent value="docsImages" className="space-y-6">
                    <h3 className="text-xl font-semibold text-brand-dark-blue mb-2 flex items-center font-heading"><ImagePlus className="h-5 w-5 mr-2 text-primary"/>Additional Images</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-brand-light-gray/30 rounded-lg border border-brand-light-gray">
                        {listing.imageUrls && listing.imageUrls.length > 1 ? (
                            listing.imageUrls.slice(1).map((url, index) => (
                                <div key={index} className="aspect-square bg-muted rounded-md overflow-hidden">
                                    <Image src={url} alt={`Listing image ${index + 2}`} width={200} height={200} className="w-full h-full object-cover" data-ai-hint="business product team" />
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground col-span-full text-center py-4">No additional images provided.</p>
                        )}
                    </div>
                    <Separator />
                    <h3 className="text-xl font-semibold text-brand-dark-blue mb-2 flex items-center font-heading"><NobridgeIcon icon="documents" size="md" className="mr-2"/>Uploaded Documents (Placeholders)</h3>
                    <div className="p-4 bg-brand-light-gray/30 rounded-lg border border-brand-light-gray space-y-3">
                        <div className="flex justify-between items-center p-2 border-b">
                            <p className="font-medium text-brand-dark-blue">Financial Statements (e.g., P&L.pdf)</p>
                            {listing.financialDocumentsUrl ? <Button variant="link" size="sm" asChild><Link href={listing.financialDocumentsUrl} target="_blank" rel="noopener noreferrer">View</Link></Button> : <Badge variant="outline">Not Provided</Badge>}
                        </div>
                         <div className="flex justify-between items-center p-2 border-b">
                            <p className="font-medium text-brand-dark-blue">Key Metrics Report (e.g., Metrics.xlsx)</p>
                             {listing.keyMetricsReportUrl ? <Button variant="link" size="sm" asChild><Link href={listing.keyMetricsReportUrl} target="_blank" rel="noopener noreferrer">View</Link></Button> : <Badge variant="outline">Not Provided</Badge>}
                        </div>
                         <div className="flex justify-between items-center p-2">
                            <p className="font-medium text-brand-dark-blue">Proof of Ownership (e.g., Incorporation.pdf)</p>
                            {listing.ownershipDocumentsUrl ? <Button variant="link" size="sm" asChild><Link href={listing.ownershipDocumentsUrl} target="_blank" rel="noopener noreferrer">View</Link></Button> : <Badge variant="outline">Not Provided</Badge>}
                        </div>
                         {listing.secureDataRoomLink && (
                            <div className="flex justify-between items-center p-2 border-t mt-2 pt-3">
                                <p className="font-medium text-brand-dark-blue">Secure Data Room:</p>
                                <Button variant="default" size="sm" asChild className="bg-primary text-primary-foreground">
                                    <Link href={listing.secureDataRoomLink} target="_blank" rel="noopener noreferrer">Access Link</Link>
                                </Button>
                            </div>
                        )}
                         {!listing.financialDocumentsUrl && !listing.keyMetricsReportUrl && !listing.ownershipDocumentsUrl && !listing.secureDataRoomLink && (
                            <p className="text-sm text-muted-foreground text-center py-4">No documents or data room link provided for this listing yet.</p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
