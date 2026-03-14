import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Users } from "lucide-react";
import { Briefcase } from "lucide-react";
import { Users2 } from "lucide-react";
import { Code } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { LifeBuoy } from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import { ShieldCheck } from "lucide-react";
import { FileText } from "lucide-react";

const docSections = [
  {
    title: "Getting Started with Nobridge",
    icon: <LayoutDashboard className="h-6 w-6 text-primary" />,
    description: "New to Nobridge? Learn how to create your account, set up your profile, and navigate the platform effectively.",
    link: "/docs/getting-started", // Placeholder link
    badge: "Essentials",
  },
  {
    title: "Seller's Guide",
    icon: <Briefcase className="h-6 w-6 text-primary" />,
    description: "A comprehensive guide for business owners on listing their business, managing inquiries, and navigating the sales process on Nobridge.",
    link: "/docs/seller-guide",
    badge: "For Sellers",
  },
  {
    title: "Buyer's Guide",
    icon: <Users2 className="h-6 w-6 text-primary" />,
    description: "Information for investors and acquirers on finding opportunities, making inquiries, and engaging with sellers.",
    link: "/docs/buyer-guide",
    badge: "For Buyers",
  },
  {
    title: "Verification Process",
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    description: "Understand our user and listing verification system, document requirements, and how it builds trust on the platform.",
    link: "/docs/verification-process",
  },
  {
    title: "Platform Features",
    icon: <BookOpen className="h-6 w-6 text-primary" />,
    description: "Detailed explanations of all Nobridge features, including dashboards, messaging, notifications, and account settings.",
    link: "/docs/features",
  },
  {
    title: "API Reference (For Developers)",
    icon: <Code className="h-6 w-6 text-primary" />,
    description: "Technical documentation for integrating with Nobridge APIs (if applicable in the future).",
    link: "/docs/api-reference",
    badge: "Developers",
  },
  {
    title: "Troubleshooting & Support",
    icon: <LifeBuoy className="h-6 w-6 text-primary" />,
    description: "Find solutions to common issues and learn how to get help from our support team.",
    link: "/help", // Links to the main help page
  },
  {
    title: "Platform Policies",
    icon: <FileText className="h-6 w-6 text-primary" />,
    description: "Review our Terms of Service, Privacy Policy, and other important legal information.",
    link: "/terms", // Example, could also link to a dedicated policies section
  },
];

export default function DocsPage() {
  return (
    <div className="container py-12 md:py-16">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-semibold text-primary font-heading">
            Nobridge Documentation Hub
          </CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto">
            Welcome to the official Nobridge documentation. Find guides, tutorials, and reference materials to help you make the most of our platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md text-center">
            <p className="text-yellow-700 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Our documentation is currently under active development. More detailed guides will be available soon!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docSections.map((section) => (
              <Card key={section.title} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    {section.icon}
                    <CardTitle className="text-xl font-semibold text-brand-dark-blue font-heading">{section.title}</CardTitle>
                  </div>
                  {section.badge && (
                    <Badge variant="secondary" className="w-fit text-xs">{section.badge}</Badge>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm">{section.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    {/* For now, links are placeholders. In a real app, these would go to actual doc pages. */}
                    <span className="opacity-50 cursor-not-allowed">View Section (Coming Soon)</span>
                    {/* <Link href={section.link}>View Section</Link> */}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
