
'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, ChevronDown, UserCircle, LogIn, UserPlus, LogOut, LayoutDashboard, Settings, Bell, Briefcase, ShoppingCart, Building2, Phone, Info, FileText, Search, Users2, DollarSign, Loader2, Award, BookOpen } from 'lucide-react';
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
      { href: "/marketplace", label: "Visit Marketplace", icon: Search },
      { href: "/how-buying-works", label: "How Buying Works", icon: Info },
      { href: "/buyer-services", label: "Buyer Services", icon: ShoppingCart },
    ],
  },
  {
    label: "Our Company",
    triggerIcon: Building2,
    items: [
      { href: "/about", label: "About Us", icon: Users2 },
      { href: "/faq", label: "FAQ", icon: Info },
      { href: "/acfi-certificate", label: "ACFI Certificate", icon: Award },
      { href: "/resources", label: "Resources", icon: BookOpen },
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

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Pages with dark hero backgrounds where navbar should start transparent with white text
  const darkHeroPages = ['/', '/marketplace'];
  const hasDarkHero = darkHeroPages.includes(pathname);

  const [scrolled, setScrolled] = useState(!hasDarkHero);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(hasDarkHero ? latest > 20 : true);
  });

  const openMenu = (label: string) => {
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
    setActiveMenu(label);
  };

  const closeMenu = () => {
    menuTimerRef.current = setTimeout(() => setActiveMenu(null), 150);
  };

  const cancelClose = () => {
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
  };

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

  const activeGroup = navLinkGroups.find((g) => g.label === activeMenu);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const navbarRef = useRef<HTMLDivElement | null>(null);
  const [dropdownOffset, setDropdownOffset] = useState(0);

  React.useEffect(() => {
    if (activeMenu && triggerRefs.current[activeMenu] && navbarRef.current) {
      const trigger = triggerRefs.current[activeMenu]!;
      const navbar = navbarRef.current;
      const triggerRect = trigger.getBoundingClientRect();
      const navbarRect = navbar.getBoundingClientRect();
      const triggerCenter = triggerRect.left + triggerRect.width / 2 - navbarRect.left;
      setDropdownOffset(triggerCenter);
    }
  }, [activeMenu]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 pt-6 pointer-events-none"
    >
      <div className="container mx-auto">
      <div
        ref={navbarRef}
        className="relative pointer-events-auto"
        onMouseLeave={closeMenu}
      >
      <div className={cn(
        "relative flex h-[72px] items-center justify-between px-4 transition-all duration-300",
        scrolled
          ? activeMenu
            ? "bg-white border border-brand-dark-blue/10 shadow-sm border-b-0"
            : "bg-white/90 backdrop-blur-xl shadow-sm border border-brand-dark-blue/10 supports-[backdrop-filter]:bg-white/80"
          : activeMenu
            ? "bg-brand-dark-blue border border-white/15 border-b-0"
            : "bg-white/5 backdrop-blur-sm border border-white/15"
      )}>
        {/* Left - Logo */}
        <div className="flex items-center">
          <Logo size="lg" forceTheme={scrolled ? "light" : "dark"} />
        </div>

        {/* Center - Nav items */}
        <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
          {navLinkGroups.map((group) => {
            const TriggerIcon = group.triggerIcon;
            const isActive = activeMenu === group.label;
            return (
              <button
                key={group.label}
                ref={(el) => { triggerRefs.current[group.label] = el; }}
                className={cn(
                  "h-10 w-[200px] text-sm font-medium flex items-center justify-center transition-colors rounded-none",
                  scrolled
                    ? cn(
                        "text-brand-dark-blue",
                        isActive ? "bg-brand-light-gray/70" : "hover:bg-brand-light-gray/50 hover:text-brand-dark-blue/90"
                      )
                    : cn(
                        "text-white",
                        isActive ? "bg-white/15" : "hover:bg-white/10 hover:text-white/90"
                      )
                )}
                onMouseEnter={() => openMenu(group.label)}
              >
                <TriggerIcon className="mr-2 h-4 w-4 opacity-80" />
                {group.label}
                <ChevronDown className={cn("ml-1 h-4 w-4 opacity-70 transition-transform duration-200", isActive && "rotate-180")} />
              </button>
            );
          })}
        </nav>

        {/* Right - Auth buttons */}

        <div className="hidden md:flex items-center space-x-2.5">
          <Link href="/contact" className={cn(
            "inline-flex items-center justify-center w-36 h-10 text-sm font-medium rounded-none transition-colors",
            scrolled
              ? "bg-brand-dark-blue text-white hover:bg-brand-dark-blue/90"
              : "bg-white text-brand-dark-blue hover:bg-white/90"
          )}>Contact Us</Link>

          {isLoading ? (
            <div className="flex items-center justify-center h-10 w-10">
              <Loader2 className={cn("h-5 w-5 animate-spin", scrolled ? "text-brand-dark-blue/50" : "text-white/50")} />
            </div>
          ) : isAuthenticated ? (
            <button
              ref={(el) => { triggerRefs.current["__account"] = el; }}
              onMouseEnter={() => openMenu("__account")}
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-none transition-colors",
                scrolled
                  ? "bg-brand-dark-blue text-white hover:bg-brand-dark-blue/90"
                  : "bg-white/15 text-white hover:bg-white/25",
                activeMenu === "__account" && (scrolled ? "bg-brand-dark-blue/80" : "bg-white/25")
              )}
            >
              {getUserInitials(userProfile)}
            </button>
          ) : (
            <button
              ref={(el) => { triggerRefs.current["__account"] = el; }}
              onMouseEnter={() => openMenu("__account")}
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-none border transition-colors",
                scrolled
                  ? "border-brand-dark-blue/30 text-brand-dark-blue hover:bg-brand-light-gray/50"
                  : "border-white/30 text-white hover:bg-white/10",
                activeMenu === "__account" && (scrolled ? "bg-brand-light-gray/70" : "bg-white/15")
              )}
            >
              <UserCircle className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={cn(scrolled ? "text-brand-dark-blue hover:bg-brand-light-gray/50" : "text-white hover:bg-white/10")}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 bg-brand-white text-brand-dark-blue">
              <div className="px-4 pt-14 pb-4 border-b border-brand-dark-blue/10">
                <Logo size="lg" forceTheme="light" />
              </div>
              <nav className="flex flex-col gap-3 p-4">
                {navLinkGroups.map((group) => {
                  const TriggerIcon = group.triggerIcon;
                  return (
                    <div key={group.label} className="border border-brand-dark-blue/10">
                      <h4 className="text-sm font-medium uppercase tracking-wider px-4 py-3 text-brand-dark-blue/50 flex items-center border-b border-brand-dark-blue/10 bg-brand-light-gray/30">
                        <TriggerIcon className="mr-2 h-4 w-4 opacity-60" />
                        {group.label}
                      </h4>
                      <div className="flex flex-col">
                        {group.items.map((item, itemIndex) => {
                          const IconComponent = item.icon;
                          return (
                            <SheetClose asChild key={item.label}>
                              <Button variant="ghost" asChild className={cn(
                                "justify-start text-base font-normal rounded-none px-4 py-3 text-brand-dark-blue/80 hover:text-brand-dark-blue hover:bg-brand-light-gray/50",
                                itemIndex > 0 && "border-t border-brand-dark-blue/10",
                                pathname === item.href && "bg-brand-light-gray font-medium text-brand-dark-blue"
                              )}>
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

                {/* Contact — primary CTA */}
                <SheetClose asChild>
                  <Button asChild className="justify-start text-base font-normal rounded-none px-4 py-3 bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 w-full">
                    <Link href="/contact" className="flex items-center"><Phone className="mr-2 h-4 w-4" /> Contact Us</Link>
                  </Button>
                </SheetClose>

                {/* Auth section */}
                <div className="border border-brand-dark-blue/10">
                  {isLoading ? (
                    <div className="px-4 py-3 text-sm text-brand-dark-blue/60 flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading user...
                    </div>
                  ) : isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 text-sm border-b border-brand-dark-blue/10 bg-brand-light-gray/30">
                        <div className="font-medium">{userProfile?.full_name || 'User'}</div>
                        <div className="text-brand-dark-blue/60 text-xs">{userProfile?.email}</div>
                        <div className="text-brand-dark-blue/60 text-xs capitalize">{userProfile?.role}</div>
                      </div>
                      <SheetClose asChild>
                        <Button variant="ghost" asChild className="justify-start text-base font-normal rounded-none px-4 py-3 text-brand-dark-blue hover:bg-brand-light-gray/50 w-full border-b border-brand-dark-blue/10">
                          <Link href={getDashboardUrl(userProfile)} className="flex items-center"><LayoutDashboard className="mr-2 h-4 w-4 opacity-80" />Dashboard</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className="justify-start text-base font-normal rounded-none px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 w-full"
                        >
                          <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                      </SheetClose>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button variant="ghost" asChild className="justify-start text-base font-normal rounded-none px-4 py-3 text-brand-dark-blue hover:bg-brand-light-gray/50 w-full border-b border-brand-dark-blue/10">
                          <Link href="/auth/login" className="flex items-center"><LogIn className="mr-2 h-4 w-4 opacity-80" /> Login</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button asChild className="justify-start text-base font-normal rounded-none px-4 py-3 bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 w-full">
                          <Link href="/auth/register" className="flex items-center"><UserPlus className="mr-2 h-4 w-4" /> Register</Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mega dropdown panel */}
      <AnimatePresence>
        {activeMenu && (activeGroup || activeMenu === "__account") && (
          <motion.div
            key={activeMenu}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={cn(
              "overflow-hidden border-x border-b",
              scrolled
                ? "bg-white border-brand-dark-blue/10"
                : "bg-brand-dark-blue border-white/15"
            )}
            onMouseEnter={cancelClose}
            onMouseLeave={closeMenu}
          >
            {/* Separator line */}
            <div className={cn(
              "mx-4",
              scrolled ? "border-t border-brand-dark-blue/10" : "border-t border-white/15"
            )} />
            <div className="py-5 relative">
              <div className={cn("inline-flex items-center", activeMenu === "__account" ? "w-full justify-center" : "")} style={activeMenu === "__account" ? {} : { position: 'relative', left: `${dropdownOffset}px`, transform: 'translateX(-50%)' }}>
                {activeMenu === "__account" ? (
                  /* Account dropdown items */
                  isAuthenticated ? (
                    <>
                      <Link
                        href={getDashboardUrl(userProfile)}
                        onClick={() => setActiveMenu(null)}
                        className={cn(
                          "flex items-center justify-center gap-2 text-sm font-medium h-10 w-[200px] transition-colors",
                          scrolled
                            ? "text-brand-dark-blue/70 hover:text-brand-dark-blue hover:bg-brand-light-gray/50"
                            : "text-white/70 hover:text-white hover:bg-white/10",
                          pathname === getDashboardUrl(userProfile) && (scrolled ? "text-brand-dark-blue font-medium bg-brand-light-gray/50" : "text-white font-medium bg-white/10")
                        )}
                      >
                        <LayoutDashboard className="h-4 w-4 opacity-80 shrink-0" />
                        Dashboard
                      </Link>
                      <div className={cn("h-4 w-px mx-2", scrolled ? "bg-brand-dark-blue/15" : "bg-white/20")} />
                      <Link
                        href="/settings"
                        onClick={() => setActiveMenu(null)}
                        className={cn(
                          "flex items-center justify-center gap-2 text-sm font-medium h-10 w-[200px] transition-colors",
                          scrolled
                            ? "text-brand-dark-blue/70 hover:text-brand-dark-blue hover:bg-brand-light-gray/50"
                            : "text-white/70 hover:text-white hover:bg-white/10",
                          pathname === "/settings" && (scrolled ? "text-brand-dark-blue font-medium bg-brand-light-gray/50" : "text-white font-medium bg-white/10")
                        )}
                      >
                        <Settings className="h-4 w-4 opacity-80 shrink-0" />
                        Settings
                      </Link>
                      <div className={cn("h-4 w-px mx-2", scrolled ? "bg-brand-dark-blue/15" : "bg-white/20")} />
                      <button
                        onClick={() => { setActiveMenu(null); handleLogout(); }}
                        className={cn(
                          "flex items-center justify-center gap-2 text-sm font-medium h-10 w-[200px] transition-colors",
                          scrolled
                            ? "text-brand-dark-blue/70 hover:text-brand-dark-blue hover:bg-brand-light-gray/50"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        )}
                      >
                        <LogOut className="h-4 w-4 opacity-80 shrink-0" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setActiveMenu(null)}
                        className={cn(
                          "flex items-center justify-center gap-2 text-sm font-medium h-10 w-[200px] transition-colors",
                          scrolled
                            ? "text-brand-dark-blue/70 hover:text-brand-dark-blue hover:bg-brand-light-gray/50"
                            : "text-white/70 hover:text-white hover:bg-white/10",
                          pathname === "/auth/login" && (scrolled ? "text-brand-dark-blue font-medium bg-brand-light-gray/50" : "text-white font-medium bg-white/10")
                        )}
                      >
                        <LogIn className="h-4 w-4 opacity-80 shrink-0" />
                        Login
                      </Link>
                      <div className={cn("h-4 w-px mx-2", scrolled ? "bg-brand-dark-blue/15" : "bg-white/20")} />
                      <Link
                        href="/auth/register"
                        onClick={() => setActiveMenu(null)}
                        className={cn(
                          "flex items-center justify-center gap-2 text-sm font-medium h-10 w-[200px] transition-colors",
                          scrolled
                            ? "text-brand-dark-blue/70 hover:text-brand-dark-blue hover:bg-brand-light-gray/50"
                            : "text-white/70 hover:text-white hover:bg-white/10",
                          pathname === "/auth/register" && (scrolled ? "text-brand-dark-blue font-medium bg-brand-light-gray/50" : "text-white font-medium bg-white/10")
                        )}
                      >
                        <UserPlus className="h-4 w-4 opacity-80 shrink-0" />
                        Register
                      </Link>
                    </>
                  )
                ) : activeGroup && (
                  /* Nav group dropdown items */
                  activeGroup.items.map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <React.Fragment key={item.label}>
                        {idx > 0 && (
                          <div className={cn(
                            "h-4 w-px mx-2",
                            scrolled ? "bg-brand-dark-blue/15" : "bg-white/20"
                          )} />
                        )}
                        <Link
                          href={item.href}
                          onClick={() => setActiveMenu(null)}
                          className={cn(
                            "flex items-center justify-center gap-2 text-sm font-medium h-10 w-[200px] transition-colors",
                            scrolled
                              ? "text-brand-dark-blue/70 hover:text-brand-dark-blue hover:bg-brand-light-gray/50"
                              : "text-white/70 hover:text-white hover:bg-white/10",
                            pathname === item.href && (scrolled ? "text-brand-dark-blue font-medium bg-brand-light-gray/50" : "text-white font-medium bg-white/10")
                          )}
                        >
                          <ItemIcon className="h-4 w-4 opacity-80 shrink-0" />
                          {item.label}
                        </Link>
                      </React.Fragment>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
      </div>
    </motion.header>
  );
}
