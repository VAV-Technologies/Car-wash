
'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, ChevronDown, Briefcase, ShoppingCart, Building2, Phone, Info, FileText, Search, Users2, Award, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
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
      { href: "/contact", label: "List Your Business", icon: FileText },
      { href: "/how-selling-works", label: "How Selling Works", icon: Info },
      { href: "/seller-services", label: "Seller Services", icon: Briefcase },
    ],
  },
  {
    label: "Buy a Business",
    triggerIcon: ShoppingCart,
    items: [
      { href: "/contact", label: "Visit Marketplace", icon: Search },
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

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Pages with dark hero backgrounds where navbar should start transparent with white text
  const darkHeroPages = ['/'];
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

        {/* Right - Contact button */}
        <div className="hidden md:flex items-center space-x-2.5">
          <Link href="/contact" className={cn(
            "inline-flex items-center justify-center w-36 h-10 text-sm font-medium rounded-none transition-colors",
            scrolled
              ? "bg-brand-dark-blue text-white hover:bg-brand-dark-blue/90"
              : "bg-white text-brand-dark-blue hover:bg-white/90"
          )}>Contact Us</Link>
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mega dropdown panel */}
      <AnimatePresence>
        {activeMenu && activeGroup && (
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
              <div className="inline-flex items-center" style={{ position: 'relative', left: `${dropdownOffset}px`, transform: 'translateX(-50%)' }}>
                {activeGroup.items.map((item, idx) => {
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
                })}
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
