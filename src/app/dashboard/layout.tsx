'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  UserCircle,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  ShoppingCart,
  HelpCircle,
  FileText,
  MessageSquareQuote,
  Home,
  Mail,
  ShieldCheck
} from 'lucide-react';
import type { UserRole } from '@/lib/types';
import LogoutButton from '@/components/auth/LogoutButton';

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

const currentUserRole: UserRole | null = 'buyer';

const buyerSidebarNavItems = [
  { title: 'Overview', href: '/dashboard', icon: LayoutDashboard, tooltip: "Dashboard Overview" },
  { title: 'My Profile', href: '/dashboard/profile', icon: UserCircle, tooltip: "Manage Profile" },
  { title: 'My Inquiries', href: '/dashboard/inquiries', icon: MessageSquare, tooltip: "View Inquiries" },
  // { title: 'Messages', href: '/dashboard/messages', icon: Mail, tooltip: "My Conversations" },
  { title: 'Verification', href: '/dashboard/verification', icon: ShieldCheck, tooltip: "Account Verification" },
  { title: 'Notifications', href: '/dashboard/notifications', icon: Bell, tooltip: "My Notifications" },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings, tooltip: "Account Settings" },
];

const utilityNavItems = [
  { title: 'Marketplace', href: '/marketplace', icon: ShoppingCart, tooltip: "Browse Marketplace" },
  { title: 'Help', href: '/help', icon: HelpCircle, tooltip: "Get Help" },
  { title: 'FAQ', href: '/faq', icon: MessageSquareQuote, tooltip: "Frequently Asked Questions" },
  { title: 'Back to Homepage', href: '/', icon: Home, tooltip: "Go to Homepage" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [inquiryCount, setInquiryCount] = React.useState(0);

  // Fetch inquiry count for notification badge
  React.useEffect(() => {
    const fetchInquiryCount = async () => {
      try {
        const response = await fetch('/api/inquiries?role=buyer&limit=100');
        const data = await response.json();

        if (response.ok && data.inquiries) {
          setInquiryCount(data.inquiries.length);
        }
      } catch (error) {
        console.warn('Failed to fetch inquiry count for sidebar badge:', error);
      }
    };

    fetchInquiryCount();
  }, []);

  if (currentUserRole !== 'buyer') {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Logo size="2xl" forceTheme="light" />
        <p className="mt-4 text-lg text-muted-foreground">Access Denied or incorrect role. This is the Buyer Dashboard.</p>
         <Button asChild className="mt-4"><Link href="/">Go to Homepage</Link></Button>
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
                {buyerSidebarNavItems.map((item, index) => {
                   const IconComponent = item.icon;
                   const iconProps = { className:"h-5 w-5 mr-3 shrink-0 transition-all duration-200 group-hover:scale-110" };
                   const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

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
                        animationDelay: `${index * 50}ms`,
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
                        animationDelay: `${(buyerSidebarNavItems.length + index) * 50}ms`,
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
