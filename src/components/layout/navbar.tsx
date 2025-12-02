
'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import styles from './navbar.module.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, ChevronDown, UserCircle, LogIn, UserPlus, LogOut, LayoutDashboard, Settings, Bell, Briefcase, ShoppingCart, Building2, Phone, Info, FileText, Search, Users2, DollarSign, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/shared/logo';
import { useAuth } from '@/contexts/auth-context';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';

interface NavLinkItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavLinkGroup {
  label: string;
  triggerIcon: React.ElementType;
  items: NavLinkItem[];
}

const navLinkGroups: NavLinkGroup[] = [
  {
    label: "Sell Your Business",
    triggerIcon: Briefcase,
    items: [
      { href: "/seller-dashboard/listings/create", label: "List Your Business", icon: FileText },
      { href: "/how-selling-works", label: "How Selling Works", icon: Info },
      { href: "/seller-services", label: "Seller Services", icon: Briefcase },
    ],
  },
  {
    label: "Buy a Business",
    triggerIcon: ShoppingCart,
    items: [
      { href: "/marketplace", label: "Browse Listings", icon: Search },
      { href: "/how-buying-works", label: "How Buying Works", icon: Info },
      { href: "/buyer-services", label: "Buyer Services", icon: ShoppingCart },
    ],
  },
  {
    label: "Company",
    triggerIcon: Building2,
    items: [
      { href: "/about", label: "About Us", icon: Users2 },
      { href: "/faq", label: "FAQ", icon: Info },
    ],
  },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  // Use the robust auth context instead of deprecated hook
  const { user, profile: userProfile, isLoading, logout } = useAuth();
  const isAuthenticated = !!user;

  const [sellMenuOpen, setSellMenuOpen] = useState(false);
  const [buyMenuOpen, setBuyMenuOpen] = useState(false);
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  const sellMenuTimerRef = useRef<NodeJS.Timeout | null>(null);
  const buyMenuTimerRef = useRef<NodeJS.Timeout | null>(null);
  const companyMenuTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    try {
      // Use the centralized logout function that handles both Supabase and cache
      await logout();

      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account."
      });
      router.push('/'); // Redirect to home after logout
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error instanceof Error ? error.message : "An error occurred"
      });
    }
  };

  const getUserInitials = (profile: typeof userProfile) => {
    if (!profile?.full_name) return 'U';
    return profile.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardUrl = (profile: typeof userProfile) => {
    if (!profile) return '/dashboard'; // Fallback, though should not be called if no profile
    switch (profile.role) {
      case 'seller':
        return '/seller-dashboard';
      case 'buyer':
        return '/dashboard';
      case 'admin':
        return '/admin';
      default:
        return '/dashboard'; // Default fallback
    }
  };

  const handleMouseEnter = (setOpen: React.Dispatch<React.SetStateAction<boolean>>, timerRef: React.MutableRefObject<NodeJS.Timeout | null>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = (setOpen: React.Dispatch<React.SetStateAction<boolean>>, timerRef: React.MutableRefObject<NodeJS.Timeout | null>) => {
    timerRef.current = setTimeout(() => setOpen(false), 150);
  };

  const getMenuOpenState = (label: string) => {
    if (label === "Sell Your Business") return sellMenuOpen;
    if (label === "Buy a Business") return buyMenuOpen;
    if (label === "Company") return companyMenuOpen;
    return false;
  };

  const getSetMenuOpenFn = (label: string): React.Dispatch<React.SetStateAction<boolean>> => {
    if (label === "Sell Your Business") return setSellMenuOpen;
    if (label === "Buy a Business") return setBuyMenuOpen;
    if (label === "Company") return setCompanyMenuOpen;
    return setSellMenuOpen; // Fallback
  };

  const getTimerRef = (label: string): React.MutableRefObject<NodeJS.Timeout | null> => {
    if (label === "Sell Your Business") return sellMenuTimerRef;
    if (label === "Buy a Business") return buyMenuTimerRef;
    if (label === "Company") return companyMenuTimerRef;
    return { current: null };
  };

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-white/20 shadow-sm supports-[backdrop-filter]:bg-white/80"
          : "bg-white/80 backdrop-blur-lg border-white/10 supports-[backdrop-filter]:bg-white/60"
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-x-6 lg:gap-x-8">
          <Logo size="xl" forceTheme="light" />
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinkGroups.map((group, index) => {
              const TriggerIcon = group.triggerIcon;
              return (
                <DropdownMenu
                  key={group.label}
                  open={getMenuOpenState(group.label)}
                  onOpenChange={getSetMenuOpenFn(group.label)}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="px-3 py-2 text-sm font-normal text-brand-dark-blue hover:bg-brand-light-gray/50 hover:text-brand-dark-blue/90 focus-visible:ring-brand-sky-blue flex items-center"
                      onMouseEnter={() => handleMouseEnter(getSetMenuOpenFn(group.label), getTimerRef(group.label))}
                      onMouseLeave={() => handleMouseLeave(getSetMenuOpenFn(group.label), getTimerRef(group.label))}
                    >
                      <TriggerIcon className="mr-2 h-4 w-4 opacity-80" />
                      {group.label}
                      <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="bg-brand-white text-brand-dark-blue border-brand-light-gray/80 shadow-lg rounded-md w-56"
                    onMouseEnter={() => handleMouseEnter(getSetMenuOpenFn(group.label), getTimerRef(group.label))}
                    onMouseLeave={() => handleMouseLeave(getSetMenuOpenFn(group.label), getTimerRef(group.label))}
                  >
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <DropdownMenuItem key={item.label} asChild className="text-sm hover:bg-brand-light-gray focus:bg-brand-light-gray cursor-pointer">
                          <Link href={item.href} className="flex items-center text-brand-dark-blue hover:text-brand-dark-blue px-3 py-2">
                            <ItemIcon className="mr-2 h-4 w-4 opacity-80" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:flex items-center space-x-3">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-brand-dark-blue/50" />
              <span className="text-sm text-brand-dark-blue/50">Loading...</span>
            </div>
          ) : isAuthenticated ? (
            <>
              <Button variant="outline" asChild className="border-brand-dark-blue/30 text-brand-dark-blue hover:bg-brand-light-gray/50 hover:border-brand-dark-blue/50 py-2 px-4 font-medium text-sm">
                <Link href={getDashboardUrl(userProfile)}>Dashboard</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 rounded-full bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 text-sm font-normal">
                    {getUserInitials(userProfile)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-brand-white text-brand-dark-blue border-brand-light-gray/80 shadow-lg rounded-md w-56">
                  <div className="px-3 py-2 text-sm">
                    <div className="font-medium">{userProfile?.full_name || 'User'}</div>
                    <div className="text-brand-dark-blue/60 text-xs">{userProfile?.email}</div>
                    <div className="text-brand-dark-blue/60 text-xs capitalize">{userProfile?.role}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer text-sm hover:bg-brand-light-gray focus:bg-brand-light-gray">
                    <Link href={getDashboardUrl(userProfile)} className="flex items-center px-3 py-2">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer text-sm hover:bg-brand-light-gray focus:bg-brand-light-gray">
                    <Link href={`${getDashboardUrl(userProfile)}/settings`} className="flex items-center px-3 py-2">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 text-sm"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" asChild className="border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue hover:text-white px-4 py-2 text-sm font-medium rounded-md transition-colors">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild className="bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 px-4 py-2 text-sm font-medium rounded-md">
                <Link href="/auth/register">Register</Link>
              </Button>
            </>
          )}

          {/* Contact Us button with wavy animation */}
          <Button
            asChild
            className={cn(
              "relative text-white px-4 py-2 text-sm font-medium rounded-md transition-all duration-300",
              styles.contactButton
            )}
          >
            <Link href="/contact">
              <Phone className="mr-2 h-4 w-4 text-white" />
              Contact Us
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-brand-dark-blue hover:bg-brand-light-gray/50">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 bg-brand-white text-brand-dark-blue">
              <div className="p-6 border-b border-brand-light-gray">
                <Logo size="xl" forceTheme="light" />
              </div>
              <nav className="flex flex-col space-y-1 p-4">
                {navLinkGroups.map((group) => {
                  const TriggerIcon = group.triggerIcon;
                  return (
                    <div key={group.label} className="flex flex-col space-y-1">
                      <h4 className="text-base font-normal px-3 py-3 w-full text-brand-dark-blue flex items-center">
                        <TriggerIcon className="mr-2 h-4 w-4 opacity-80" />
                        {group.label}
                      </h4>
                      <div className="pl-4 flex flex-col space-y-1">
                        {group.items.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <SheetClose asChild key={item.label}>
                              <Button variant="ghost" asChild className={cn("justify-start text-base font-normal px-3 py-2 text-brand-dark-blue/80 hover:text-brand-dark-blue hover:bg-brand-light-gray", pathname === item.href && "bg-brand-light-gray font-medium")}>
                                <Link href={item.href} className="flex items-center">
                                  <IconComponent className="mr-2 h-4 w-4 opacity-80" />
                                  {item.label}
                                </Link>
                              </Button>
                            </SheetClose>
                          );
                        })}
                      </div>
                    </div>
                  )
                })}
                <DropdownMenuSeparator className="my-4 bg-brand-light-gray/80" />
                <SheetClose asChild>
                  <Button variant="ghost" asChild className="justify-start text-lg px-3 py-3 text-brand-dark-blue hover:bg-brand-light-gray">
                    <Link href="/contact" className="flex items-center"><Phone className="mr-2 h-5 w-5" /> Contact Us</Link>
                  </Button>
                </SheetClose>
                {isLoading ? (
                  <div className="px-3 py-2 text-sm text-brand-dark-blue/60 flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading user...
                  </div>
                ) : isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-sm border-b border-brand-light-gray/60 mb-2">
                      <div className="font-medium">{userProfile?.full_name || 'User'}</div>
                      <div className="text-brand-dark-blue/60 text-xs">{userProfile?.email}</div>
                      <div className="text-brand-dark-blue/60 text-xs capitalize">{userProfile?.role}</div>
                    </div>
                    <SheetClose asChild>
                      <Button variant="ghost" asChild className="justify-start text-lg px-3 py-3 text-brand-dark-blue hover:bg-brand-light-gray">
                        <Link href={getDashboardUrl(userProfile)} className="flex items-center"><LayoutDashboard className="mr-2 h-5 w-5" />Dashboard</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="justify-start text-lg px-3 py-3 text-red-600 hover:bg-red-100 hover:text-red-700 w-full"
                      >
                        <LogOut className="mr-2 h-5 w-5" /> Logout
                      </Button>
                    </SheetClose>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button variant="ghost" asChild className="justify-start text-lg px-3 py-3 text-brand-dark-blue hover:bg-brand-light-gray">
                        <Link href="/auth/login" className="flex items-center"><LogIn className="mr-2 h-5 w-5" /> Login</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="justify-start text-lg px-3 py-3 bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 w-full">
                        <Link href="/auth/register" className="flex items-center"><UserPlus className="mr-2 h-5 w-5" /> Register</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
