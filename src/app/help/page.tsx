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
    <div className="min-h-screen bg-brand-black">
      <div className="container py-12 md:py-16">
        <Card className="shadow-xl bg-brand-dark-gray border-white/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <LifeBuoy className="h-16 w-16 text-brand-orange" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-semibold text-white font-heading">
              Castudio Support Center
            </CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto text-white/60">
              We&apos;re here to help you with your car care needs. Find the resources you need or get in touch with our support team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-10">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="hover:shadow-md transition-shadow bg-brand-black border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-semibold font-heading text-white">
                    <MessageSquare className="h-6 w-6 mr-2 text-brand-orange" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/60 mb-4">
                    Find quick answers to common questions about using Castudio, our services, subscriptions, and more.
                  </p>
                  <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5">
                    <Link href="/faq">Visit FAQ Page</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow bg-brand-black border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-semibold font-heading text-white">
                    <BookOpen className="h-6 w-6 mr-2 text-brand-orange" />
                    Car Care Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/60 mb-4">
                    Explore our guides, tips, and expert advice to keep your car looking its best between visits to Castudio.
                  </p>
                  <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5">
                    <Link href="/resources">Browse Tips</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center border-t border-white/10 pt-10">
              <h2 className="text-2xl font-semibold mb-4 text-white font-heading">Need Direct Assistance?</h2>
              <p className="text-white/60 mb-6 max-w-lg mx-auto">
                If you can&apos;t find what you&apos;re looking for in our FAQ or Car Care Tips, our support team is ready to assist you.
              </p>
              <div className="grid sm:grid-cols-2 gap-6 max-w-md mx-auto">
                <div className="p-4 border border-white/10 rounded-lg text-left bg-brand-black">
                  <h3 className="font-semibold flex items-center mb-1 text-white"><Mail className="h-5 w-5 mr-2 text-brand-orange"/> Email Support</h3>
                  <p className="text-sm text-white/60">Send us an email at:</p>
                  <a href="mailto:hello@castudio.co" className="text-brand-orange hover:underline font-medium">hello@castudio.co</a>
                  <p className="text-xs text-white/60 mt-1">We aim to respond within 24 hours.</p>
                </div>
                <div className="p-4 border border-white/10 rounded-lg text-left bg-brand-black">
                  <h3 className="font-semibold flex items-center mb-1 text-white"><Phone className="h-5 w-5 mr-2 text-brand-orange"/> Phone Support</h3>
                  <p className="text-sm text-white/60">Call or WhatsApp us:</p>
                  <a href="tel:+62816104334" className="text-brand-orange font-medium">+62 816 10 4334</a>
                  <p className="text-xs text-white/60 mt-1">Daily, 8am - 6pm</p>
                </div>
              </div>
              <Button asChild size="lg" className="mt-8 bg-brand-orange text-black hover:bg-brand-orange/90">
                <Link href="/contact">Contact Us Form</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
