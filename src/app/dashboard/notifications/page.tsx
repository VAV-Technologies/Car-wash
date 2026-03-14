
'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bell, Check, Mail, ShieldCheck, Edit3, CheckCircle2, MessageSquare } from "lucide-react";
import type { NotificationItem, User } from "@/lib/types";
import { sampleBuyerNotifications, sampleUsers } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

const currentBuyerId = 'user6'; 
const currentUser: User | undefined = sampleUsers.find(u => u.id === currentBuyerId && u.role === 'buyer');

function FormattedTimestamp({ timestamp }: { timestamp: Date | string }) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (timestamp) {
      const dateObj = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      if (!isNaN(dateObj.getTime())) {
        setFormattedDate(dateObj.toLocaleString());
      } else {
        setFormattedDate('Invalid Date');
      }
    } else {
      setFormattedDate('N/A');
    }
  }, [timestamp]);

  if (timestamp && !formattedDate) {
    return <span className="italic text-xs">Loading date...</span>;
  }
  return <>{formattedDate || 'N/A'}</>;
}


export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (currentUser) {
      const buyerNots = sampleBuyerNotifications
        .filter(notif => notif.userId === currentUser.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications(buyerNots);
    }
  }, []);


  const handleMarkAsRead = (notificationId: string) => {
    console.log("Marking notification as read:", notificationId);
    setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, isRead: true} : n));
  };

  if (typeof window !== 'undefined' && !currentUser) { 
     return (
      <div className="space-y-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground">You must be logged in as a buyer to view this page.</p>
        <Button asChild><Link href="/auth/login">Login</Link></Button>
      </div>
    );
  }
  
  if (typeof window === 'undefined' && !currentUser) { 
    return <div className="space-y-8 text-center"><p>Loading notifications...</p></div>
  }


  const getIconForNotificationType = (type: NotificationItem['type']) => {
    switch(type) {
      case 'inquiry': return <MessageSquare className="mr-2 h-4 w-4"/>;
      case 'verification': return <ShieldCheck className="mr-2 h-4 w-4"/>;
      case 'engagement': return <CheckCircle2 className="mr-2 h-4 w-4"/>; 
      case 'listing_update': return <Edit3 className="mr-2 h-4 w-4"/>;
      case 'system': 
      default: return <Bell className="mr-2 h-4 w-4"/>;
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight text-brand-dark-blue">My Notifications</h1>
      <p className="text-muted-foreground">
        Stay updated with important alerts and messages related to your activity.
      </p>

      {notifications.length === 0 ? (
        <Card className="shadow-md text-center py-12 bg-brand-white">
          <CardContent>
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No notifications yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Important updates and alerts will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg bg-brand-white">
          <CardHeader>
            <CardTitle className="text-brand-dark-blue">All Notifications</CardTitle>
            <CardDescription>You have {notifications.filter(n => !n.isRead).length} unread notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${notification.isRead ? 'bg-brand-light-gray/50 hover:bg-brand-light-gray/70' : 'bg-brand-sky-blue/10 hover:bg-brand-sky-blue/20 border-brand-sky-blue/50'}`}
              >
                <div className="flex-grow">
                  <p className={`text-sm ${notification.isRead ? 'text-muted-foreground' : 'text-brand-dark-blue'}`}>
                    {notification.message}
                  </p>
                  <p className={`text-xs mt-1 ${notification.isRead ? 'text-muted-foreground/70' : 'text-brand-sky-blue/80'}`}>
                    <FormattedTimestamp timestamp={notification.timestamp} />
                  </p>
                </div>
                <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  {notification.link && notification.type === 'verification' && notification.message.toLowerCase().includes("profile needs to be verified") && (
                    <Button variant="default" size="sm" asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                        <Link href={notification.link}>
                            <ShieldCheck className="mr-2 h-4 w-4"/> Verify Your Profile to Proceed
                        </Link>
                    </Button>
                  )}
                  {notification.link && !(notification.type === 'verification' && notification.message.toLowerCase().includes("profile needs to be verified")) && (
                    <Button variant="outline" size="sm" asChild className="border-brand-dark-blue/30 text-brand-dark-blue hover:bg-brand-light-gray">
                      <Link href={notification.link}>
                        {getIconForNotificationType(notification.type)}
                        View Details
                      </Link>
                    </Button>
                  )}
                  {!notification.isRead && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)} className="text-brand-dark-blue hover:bg-brand-light-gray/50">
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
