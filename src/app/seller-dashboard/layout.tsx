'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarSeparator,
  SidebarFooter,
  SidebarInset
} from '@/components/ui/sidebar';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  UserCircle,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  PlusCircle,
  HelpCircle,
  FileText,
  MessageSquareQuote,
  Home,
  Mail,
  Briefcase,
  ShieldCheck
} from 'lucide-react';
import type { UserRole } from '@/lib/types';
import LogoutButton from '@/components/auth/LogoutButton';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Add CSS for animations
const sidebarStyles = `
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 5px hsl(var(--primary) / 0.3);
    }
    50% {
      box-shadow: 0 0 20px hsl(var(--primary) / 0.6);
    }
  }

  .sidebar-item-animate {
    animation: slideInLeft 0.6s ease-out;
  }

  .sidebar-active-glow {
    animation: glow 2s ease-in-out infinite;
  }
`;

const sellerSidebarNavItems = [
  { title: 'Overview', href: '/seller-dashboard', icon: LayoutDashboard, tooltip: "Dashboard Overview" },
  { title: 'My Profile', href: '/seller-dashboard/profile', icon: UserCircle, tooltip: "Manage Profile" },
  { title: 'My Listings', href: '/seller-dashboard/listings', icon: Briefcase, tooltip: "Manage Listings" },
  { title: 'Create Listing', href: '/seller-dashboard/listings/create', icon: PlusCircle, tooltip: "Create New Listing" },
  { title: 'My Inquiries', href: '/seller-dashboard/inquiries', icon: MessageSquare, tooltip: "View Inquiries" },
  // { title: 'Messages', href: '/seller-dashboard/messages', icon: Mail, tooltip: "My Conversations" },
  { title: 'Verification', href: '/seller-dashboard/verification', icon: ShieldCheck, tooltip: "Account/Listing Verification" },
  { title: 'Notifications', href: '/seller-dashboard/notifications', icon: Bell, tooltip: "My Notifications" },
  { title: 'Settings', href: '/seller-dashboard/settings', icon: Settings, tooltip: "Account Settings" },
];

const utilityNavItems = [
  { title: 'Help', href: '/help', icon: HelpCircle, tooltip: "Get Help" },
  { title: 'FAQ', href: '/faq', icon: MessageSquareQuote, tooltip: "Frequently Asked Questions" },
  { title: 'Back to Homepage', href: '/', icon: Home, tooltip: "Go to Homepage" },
];

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile, isLoading, error } = useAuth();
  const [inquiryCount, setInquiryCount] = React.useState(0);

  // Fetch inquiry count for notification badge
  React.useEffect(() => {
    const fetchInquiryCount = async () => {
      if (!profile || profile.role !== 'seller') return;

      try {
        const response = await fetch('/api/inquiries?role=seller&limit=100');
        const data = await response.json();

        if (response.ok && data.inquiries) {
          setInquiryCount(data.inquiries.length);
        }
      } catch (error) {
        console.warn('Failed to fetch inquiry count for sidebar badge:', error);
      }
    };

    fetchInquiryCount();
  }, [profile]);

  // Show loading state while fetching user data - but don't block access
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  // If we have profile data, check role-based access
  // If no profile data, trust middleware and render dashboard (middleware handles auth)
  if (profile && profile.role !== 'seller') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Logo size="2xl" forceTheme="light"/>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">Access Denied</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          You must be logged in as a seller to view this page.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Your current role: {profile.role}
        </p>
        <Button asChild className="mt-4">
          <Link href={profile.role === 'admin' ? '/admin' : '/dashboard'}>
            Go to {profile.role === 'admin' ? 'Admin' : 'Buyer'} Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <style dangerouslySetInnerHTML={{ __html: sidebarStyles }} />
      <div className="flex min-h-screen bg-gray-50/30">
        <Sidebar variant="sidebar" className="h-screen sticky top-0 border-r-0 bg-white text-foreground shadow-lg">
          <div className="h-full bg-white rounded-r-3xl border-r border-gray-200 shadow-xl">
            <SidebarHeader className="p-6 border-b border-gray-200 bg-white rounded-tr-3xl">
              <div className="flex items-center justify-between">
                <Logo size="lg" forceTheme="light" />
                <SidebarTrigger className="md:hidden rounded-lg hover:bg-gray-100 transition-colors duration-200" />
              </div>
            </SidebarHeader>
            <SidebarContent className="flex-grow px-4 py-6 space-y-2 bg-white">
              <SidebarMenu className="space-y-1">
                {sellerSidebarNavItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const iconProps = { className:"h-5 w-5 mr-3 shrink-0 transition-all duration-200 group-hover:scale-110" };

                  const overviewPath = '/seller-dashboard';
                  let itemIsActive = pathname === item.href;
                  if (item.href === overviewPath && pathname === overviewPath) {
                      itemIsActive = true;
                  } else if (item.href !== overviewPath && pathname.startsWith(item.href) && (pathname.length === item.href.length || pathname[item.href.length] === '/')) {
                      itemIsActive = true;
                  }

                  if (item.title === "My Listings") {
                      itemIsActive = pathname.startsWith("/seller-dashboard/listings") && !pathname.startsWith("/seller-dashboard/listings/create");
                  }
                  if (item.title === "Create Listing") {
                      itemIsActive = pathname === "/seller-dashboard/listings/create";
                  }

                  return (
                  <SidebarMenuItem key={item.title} className="group sidebar-item-animate">
                    <SidebarMenuButton
                      asChild
                      isActive={itemIsActive}
                      tooltip={{ children: item.tooltip, className: "bg-gray-800 text-white border-gray-600 shadow-lg" }}
                      className={`
                        relative rounded-xl px-4 py-3 transition-all duration-300 ease-out
                        hover:bg-gray-50 hover:scale-[1.02] hover:shadow-md
                        focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-white
                        ${itemIsActive
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02] sidebar-active-glow'
                          : 'text-gray-700 hover:text-gray-900'
                        }
                        before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r
                        before:from-primary/0 before:to-accent/0 before:opacity-0
                        before:transition-opacity before:duration-300 hover:before:opacity-5
                        group overflow-hidden
                      `}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <Link href={item.href} className="flex items-center relative z-10 w-full">
                        <IconComponent {...iconProps} />
                        <span className="truncate font-medium transition-all duration-200">{item.title}</span>
                        {itemIsActive && (
                          <div className="absolute right-2 w-2 h-2 bg-primary-foreground rounded-full opacity-80 animate-pulse"></div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )})}
              </SidebarMenu>

              <div className="py-4">
                <SidebarSeparator className="bg-gray-200" />
              </div>

              <SidebarMenu className="space-y-1">
                {utilityNavItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const iconProps = { className:"h-5 w-5 mr-3 shrink-0 transition-all duration-200 group-hover:scale-110" };
                  const isActive = pathname === item.href;

                  return (
                  <SidebarMenuItem key={item.title} className="group sidebar-item-animate">
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={{ children: item.tooltip, className: "bg-gray-800 text-white border-gray-600 shadow-lg" }}
                      className={`
                        relative rounded-xl px-4 py-3 transition-all duration-300 ease-out
                        hover:bg-gray-50 hover:scale-[1.02] hover:shadow-md
                        focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-white
                        ${isActive
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02] sidebar-active-glow'
                          : 'text-gray-700 hover:text-gray-900'
                        }
                        before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r
                        before:from-primary/0 before:to-accent/0 before:opacity-0
                        before:transition-opacity before:duration-300 hover:before:opacity-5
                        group overflow-hidden
                      `}
                      style={{
                        animationDelay: `${(sellerSidebarNavItems.length + index) * 50}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                       <Link href={item.href} className="flex items-center relative z-10 w-full">
                        <IconComponent {...iconProps} />
                        <span className="truncate font-medium transition-all duration-200">{item.title}</span>
                        {isActive && (
                          <div className="absolute right-2 w-2 h-2 bg-primary-foreground rounded-full opacity-80 animate-pulse"></div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )})}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-6 border-t border-gray-200 bg-white rounded-br-3xl">
              <div className="transform transition-transform duration-200 hover:scale-[1.02]">
                <LogoutButton fullWidth />
              </div>
            </SidebarFooter>
          </div>
        </Sidebar>
        <SidebarInset className="flex-grow flex flex-col overflow-hidden bg-white">
            <header className="md:hidden flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
              <Logo size="lg" forceTheme="light" />
              <SidebarTrigger className="rounded-lg hover:bg-gray-100 transition-colors duration-200"/>
            </header>
            <div className="p-6 md:p-8 lg:p-10 flex-grow flex flex-col overflow-y-auto">
             {children}
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
