
'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bell, Check, Mail, ShieldCheck, MessageSquare, Edit3, CheckCircle2 } from "lucide-react"; // Added CheckCircle2
import type { NotificationItem, User } from "@/lib/types";
import { sampleSellerNotifications, sampleUsers } from "@/lib/placeholder-data";
import { useState, useEffect } from "react";

// Placeholder for current seller ID
const currentSellerId = 'user1'; // Or 'user3'
const currentUser: User | undefined = sampleUsers.find(u => u.id === currentSellerId && u.role === 'seller');

const getInitialNotifications = (): NotificationItem[] => {
  if (typeof window === "undefined") { // Prevent running filter on server if sampleSellerNotifications might not be fully initialized
    return [];
  }
  return sampleSellerNotifications
    .filter(notif => notif.userId === currentUser?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); 
}


function FormattedTimestamp({ timestamp }: { timestamp: Date | string }) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    setFormattedDate(new Date(timestamp).toLocaleString());
  }, [timestamp]);

  if (!formattedDate) {
    return <span className="italic">Loading date...</span>; 
  }
  return <>{formattedDate}</>;
}


export default function SellerNotificationsPage() {
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    setNotifications(getInitialNotifications());
  }, []);


  const handleMarkAsRead = (notificationId: string) => {
    console.log("Marking notification as read:", notificationId);
    setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, isRead: true} : n));
  };

  if (typeof window !== 'undefined' && !currentUser) { // Added typeof window check for currentUser access
     return (
      <div className="space-y-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground">You must be logged in as a seller to view this page.</p>
        <Button asChild><Link href="/auth/login">Login</Link></Button>
      </div>
    );
  }
  
  if (typeof window === 'undefined' && !currentUser) { // SSR fallback or initial loading
    return <div className="space-y-8 text-center"><p>Loading notifications...</p></div>
  }


  const getIconForNotificationType = (type: NotificationItem['type']) => {
    switch(type) {
      case 'inquiry': return <MessageSquare className="mr-2 h-4 w-4"/>;
      case 'verification': return <ShieldCheck className="mr-2 h-4 w-4"/>;
      case 'engagement': return <CheckCircle2 className="mr-2 h-4 w-4"/>; // Correctly uses CheckCircle2
      case 'listing_update': return <Edit3 className="mr-2 h-4 w-4"/>;
      case 'system': 
      default: return <Bell className="mr-2 h-4 w-4"/>;
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">My Notifications</h1>
      <p className="text-muted-foreground">
        Stay updated with important alerts and messages related to your activity.
      </p>

      {notifications.length === 0 ? (
        <Card className="shadow-md text-center py-12">
          <CardContent>
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No notifications yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Important updates and alerts will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
            <CardDescription>You have {notifications.filter(n => !n.isRead).length} unread notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${notification.isRead ? 'bg-card hover:bg-muted/30' : 'bg-primary/10 hover:bg-primary/20 border-primary/50'}`}
              >
                <div className="flex-grow">
                  <p className={`text-sm ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {notification.message}
                  </p>
                  <p className={`text-xs mt-1 ${notification.isRead ? 'text-muted-foreground/70' : 'text-primary/80'}`}>
                    <FormattedTimestamp timestamp={notification.timestamp} />
                  </p>
                </div>
                <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  {notification.link && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={notification.link}>
                        {getIconForNotificationType(notification.type)}
                        View Details
                      </Link>
                    </Button>
                  )}
                  {!notification.isRead && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                      <Check className="mr-2 h-4 w-4"/> Mark as Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
