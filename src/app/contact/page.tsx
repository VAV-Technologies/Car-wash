"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, ArrowRight, CheckCircle, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { FadeIn } from "@/components/ui/fade-in";
import Link from "next/link";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must be under 100 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (formData.email.length > 100) {
      newErrors.email = "Email must be under 100 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length > 2000) {
      newErrors.message = "Message must be under 2000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors below and try again."
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            variant: "destructive",
            title: "Rate Limit Exceeded",
            description: result.error || "Too many submissions. Please wait before trying again."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Submission Failed",
            description: result.error || "Failed to send your message. Please try again."
          });
        }
        return;
      }

      // Success!
      toast({
        title: "Message Sent Successfully!",
        description: result.message || "Thank you for your message! We'll get back to you soon."
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      setErrors({});

    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Unable to send your message. Please check your connection and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AnimatedBackground position="fixed" className="z-0" />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-20">

        {/* Header Section */}
        <FadeIn direction="up" className="text-center mb-16 md:mb-24">
          <h1 className="text-4xl md:text-6xl font-bold font-heading tracking-tight text-white drop-shadow-lg mb-6 max-w-5xl mx-auto">
            Ready to Make Your Next Move? <br className="hidden md:block" />
            <span className="text-brand-sky-blue">Connect with the right partner</span> for your M&A journey
          </h1>
        </FadeIn>

        {/* Two Boxes Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-24 max-w-6xl mx-auto">
          {/* Buyer Partner Box */}
          <FadeIn delay={200} className="h-full">
            <Card className="h-full bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl hover:shadow-brand-sky-blue/10 transition-all duration-300">
              <CardContent className="p-8 md:p-10 flex flex-col h-full">
                <h2 className="text-3xl font-bold mb-4 font-heading">Talk to a buyer partner.</h2>
                <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                  Looking to expand through strategic acquisitions in Asia? Our buyer partners get exclusive access to off-market opportunities across Indonesia, Malaysia, and emerging Asian markets.
                </p>

                <div className="mb-8 flex-grow">
                  <h3 className="text-lg font-semibold mb-4 text-brand-sky-blue">Why Leading Acquirers Choose Nobridge:</h3>
                  <ul className="space-y-3">
                    {[
                      "Proprietary deal flow from 500+ active seller relationships",
                      "Deep local market knowledge with global transaction standards",
                      "End-to-end support from sourcing to integration planning",
                      "Risk mitigation through comprehensive seller vetting"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-brand-sky-blue mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button asChild size="lg" className="w-full bg-white text-brand-dark-blue hover:bg-brand-sky-blue hover:text-white font-semibold text-lg h-12">
                  <Link href="/contact/buyer">
                    Schedule Buyer Consultation <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Seller Partner Box */}
          <FadeIn delay={300} className="h-full">
            <Card className="h-full bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl hover:shadow-brand-sky-blue/10 transition-all duration-300">
              <CardContent className="p-8 md:p-10 flex flex-col h-full">
                <h2 className="text-3xl font-bold mb-4 font-heading">Talk to a seller partner.</h2>
                <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                  Ready to explore your exit options or fundraise? Our seller partners work with business owners who've built something valuable and want to ensure their legacy continues with the right acquirer.
                </p>

                <div className="mb-8 flex-grow">
                  <h3 className="text-lg font-semibold mb-4 text-brand-sky-blue">Why Successful Founders Trust Nobridge:</h3>
                  <ul className="space-y-3">
                    {[
                      "Access to 2,000+ qualified international buyers",
                      "Confidential marketing that protects your business operations",
                      "Expert negotiation to maximize value and terms",
                      "Smooth transition planning for you and your team"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-brand-sky-blue mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button asChild size="lg" className="w-full bg-white text-brand-dark-blue hover:bg-brand-sky-blue hover:text-white font-semibold text-lg h-12">
                  <Link href="/contact/seller">
                    Schedule Seller Consultation <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Bottom Section - Contact Form */}
        <FadeIn delay={400} className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-heading mb-4">Need something else?</h2>
            <p className="text-xl text-blue-100">
              All consultations are confidential and commitment-free. Speak with a senior partner who understands your market.
            </p>
          </div>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl">
            <CardContent className="p-8 md:p-12 grid md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="John Doe"
                        className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-sky-blue focus:ring-brand-sky-blue ${errors.name ? "border-red-400" : ""}`}
                        disabled={isLoading}
                        required
                      />
                      {errors.name && <p className="text-sm text-red-300 mt-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="you@example.com"
                        className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-sky-blue focus:ring-brand-sky-blue ${errors.email ? "border-red-400" : ""}`}
                        disabled={isLoading}
                        required
                      />
                      {errors.email && <p className="text-sm text-red-300 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white">Subject (Optional)</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Inquiry about listing services"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-sky-blue focus:ring-brand-sky-blue"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Your message..."
                      rows={5}
                      className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-sky-blue focus:ring-brand-sky-blue ${errors.message ? "border-red-400" : ""}`}
                      disabled={isLoading}
                      required
                    />
                    {errors.message && <p className="text-sm text-red-300 mt-1">{errors.message}</p>}
                  </div>

                  <Button type="submit" className="w-full bg-brand-sky-blue text-brand-dark-blue hover:bg-white hover:text-brand-dark-blue font-semibold" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </div>

              <div className="space-y-8 border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-8">
                <div>
                  <h3 className="text-lg font-semibold text-white font-heading mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-brand-sky-blue/20 rounded-lg">
                        <Mail className="h-5 w-5 text-brand-sky-blue" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-200 mb-1">Email Us</p>
                        <a
                          href="mailto:Business@nobridge.co"
                          className="text-white hover:text-brand-sky-blue transition-colors font-medium"
                        >
                          Business@nobridge.co
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-brand-sky-blue/20 rounded-lg">
                        <Phone className="h-5 w-5 text-brand-sky-blue" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-200 mb-1">Call Us</p>
                        <a
                          href="tel:+62816104334"
                          className="text-white hover:text-brand-sky-blue transition-colors font-medium"
                        >
                          + 62 816 10 4334
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-blue-100 leading-relaxed">
                    "We are committed to providing you with the best possible service and support."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
