import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { MessageSquare } from "lucide-react";
import { BookOpen } from "lucide-react";
import { Mail } from "lucide-react";
import { Phone } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="container py-12 md:py-16">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <LifeBuoy className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-semibold text-primary font-heading">
            Nobridge Support Center
          </CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto">
            We're here to help you succeed. Find the resources you need or get in touch with our support team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold font-heading">
                  <MessageSquare className="h-6 w-6 mr-2 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Find quick answers to common questions about using Nobridge, for both buyers and sellers.
                </p>
                <Button asChild variant="outline">
                  <Link href="/faq">Visit FAQ Page</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold font-heading">
                  <BookOpen className="h-6 w-6 mr-2 text-primary" />
                  Documentation Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Explore our guides, tutorials, and platform feature explanations to get the most out of Nobridge.
                </p>
                <Button asChild variant="outline">
                  <Link href="/docs">Go to Documentation</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center border-t pt-10">
            <h2 className="text-2xl font-semibold mb-4 text-brand-dark-blue font-heading">Need Direct Assistance?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              If you can't find what you're looking for in our FAQ or Documentation, our support team is ready to assist you.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 max-w-md mx-auto">
              <div className="p-4 border rounded-lg text-left">
                <h3 className="font-semibold flex items-center mb-1"><Mail className="h-5 w-5 mr-2 text-primary"/> Email Support</h3>
                <p className="text-sm text-muted-foreground">Send us an email at:</p>
                <a href="mailto:support@nobridge.asia" className="text-primary hover:underline font-medium">support@nobridge.asia</a>
                <p className="text-xs text-muted-foreground mt-1">We aim to respond within 24 business hours.</p>
              </div>
              <div className="p-4 border rounded-lg text-left">
                <h3 className="font-semibold flex items-center mb-1"><Phone className="h-5 w-5 mr-2 text-primary"/> Phone Support</h3>
                <p className="text-sm text-muted-foreground">Call us (Mon-Fri, 9am-6pm SGT):</p>
                <p className="text-primary font-medium">+65 1234 5678</p>
                <p className="text-xs text-muted-foreground mt-1">(For Pro & Premium plan users)</p>
              </div>
            </div>
            <Button asChild size="lg" className="mt-8">
              <Link href="/contact">Contact Us Form</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
