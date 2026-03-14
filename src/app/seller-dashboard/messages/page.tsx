
'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import * as React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, Info } from 'lucide-react';
import type { Conversation, User, Listing } from '@/lib/types';
import { sampleUsers, sampleListings, sampleConversations } from '@/lib/placeholder-data';

const currentUserId = 'user1'; // Placeholder for current seller (John Doe)

// Helper to format timestamp
const formatTimestamp = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString();
};

export default function SellerMessagesPage() {
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const userConversations = sampleConversations
        .filter(conv => conv.sellerId === currentUserId)
        .map(conv => {
          const buyer = sampleUsers.find(u => u.id === conv.buyerId);
          const listing = sampleListings.find(l => l.id === conv.listingId);
          return {
            ...conv,
            otherPartyName: buyer?.fullName || 'Unknown Buyer',
            otherPartyAvatar: `https://placehold.co/40x40.png?text=${(buyer?.fullName || 'B').charAt(0)}`,
            listingTitle: listing?.listingTitleAnonymous || 'Unknown Listing',
          };
        })
        .sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      setConversations(userConversations);
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return <div className="p-6 text-center">Loading conversations...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight text-brand-dark-blue">My Messages</h1>
      <Card className="shadow-lg bg-brand-white">
        <CardHeader>
          <CardTitle className="text-brand-dark-blue">Active Conversations</CardTitle>
          <CardDescription>
             {conversations.length > 0 
              ? 'Here are your ongoing conversations with potential buyers.' 
              : 'No active conversations yet. Buyers will message you after a connection is facilitated by an admin.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 && !isLoading ? (
            <div className="text-center py-10 text-muted-foreground">
              <Mail className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg">You have no messages.</p>
              <p className="text-sm">When buyers respond to your listings and connections are made, conversations will appear here.</p>
               <Button asChild className="mt-6 bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90">
                <Link href="/seller-dashboard/listings">View My Listings</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conv) => (
                <Link key={conv.conversationId} href={`/seller-dashboard/messages/${conv.conversationId}`} passHref>
                  <div className="block p-4 border border-brand-light-gray rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-brand-sky-blue">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conv.otherPartyAvatar} alt={conv.otherPartyName} data-ai-hint="person avatar" />
                          <AvatarFallback>{conv.otherPartyName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-brand-dark-blue">{conv.otherPartyName}</p>
                          <p className="text-xs text-muted-foreground">Listing: {conv.listingTitle}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTimestamp(conv.updatedAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-brand-dark-blue/90 truncate">{conv.lastMessageSnippet || 'No messages yet.'}</p>
                     {conv.sellerUnreadCount && conv.sellerUnreadCount > 0 && (
                       <div className="mt-2 flex justify-end">
                        <span className="px-2 py-0.5 text-xs font-semibold bg-brand-sky-blue text-brand-white rounded-full">
                          {conv.sellerUnreadCount} New
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    