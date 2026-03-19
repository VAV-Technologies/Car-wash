"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  ArrowRight,
  Network,
  MapPin,
  GitMerge,
  Shield,
  Globe,
  Lock,
  Handshake,
  Users,
  Phone
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors below and try again."
      });
      return;
    }

    const subject = encodeURIComponent(formData.subject || `Contact from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );
    window.location.href = `mailto:Business@nobridge.co?subject=${subject}&body=${body}`;

    toast({
      title: "Opening email client",
      description: "Your default email client should open with the message pre-filled."
    });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const buyerReasons = [
    { icon: Network, text: "Proprietary deal flow from 500+ active seller relationships" },
    { icon: MapPin, text: "Deep local market knowledge with global transaction standards" },
    { icon: GitMerge, text: "End-to-end support from sourcing to integration planning" },
    { icon: Shield, text: "Risk mitigation through comprehensive seller vetting" },
  ];

  const sellerReasons = [
    { icon: Globe, text: "Access to 2,000+ qualified international buyers" },
    { icon: Lock, text: "Confidential marketing that protects your business operations" },
    { icon: Handshake, text: "Expert negotiation to maximize value and terms" },
    { icon: Users, text: "Smooth transition planning for you and your team" },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="w-full min-h-[50vh] flex items-center justify-center bg-brand-dark-blue text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center space-y-6 px-4">
              <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                Speak With Our Team
              </h1>
              <p className="text-lg md:text-xl text-blue-100 font-light max-w-2xl mx-auto">
                Connect with the right partner for your M&A journey. All consultations are confidential and commitment-free.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Consultation Boxes */}
      <section className="w-full py-24 md:py-32 bg-white section-lines-dark">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row">
            {/* Buyer Partner Box */}
            <FadeIn delay={100} className="flex-1">
              <div className="border border-brand-dark-blue/10 p-8 md:p-10 h-full flex flex-col">
                <h2 className="text-2xl font-normal mb-4 font-heading text-brand-dark-blue">Talk to a buyer partner.</h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Looking to expand through strategic acquisitions in Asia? Our buyer partners get exclusive access to off-market opportunities across Indonesia, Malaysia, and emerging Asian markets.
                </p>

                <div className="mb-8 flex-grow">
                  <h3 className="text-base font-semibold mb-4 text-brand-dark-blue">Why Leading Acquirers Choose Nobridge:</h3>
                  <ul className="space-y-3">
                    {buyerReasons.map((reason, i) => {
                      const Icon = reason.icon;
                      return (
                        <li key={i} className="flex items-start">
                          <Icon className="h-5 w-5 text-brand-sky-blue mr-3 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{reason.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <a
                  href="https://cal.com/ahmad-fadil-lubis/nobridge-buyer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-8 py-3 text-sm font-medium text-white bg-brand-dark-blue hover:bg-brand-dark-blue/90 rounded-none transition-colors"
                >
                  Schedule Buyer Consultation <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </div>
            </FadeIn>

            {/* Seller Partner Box */}
            <FadeIn delay={200} className="flex-1">
              <div className="border border-brand-dark-blue/10 border-t-0 md:border-t md:border-l-0 p-8 md:p-10 h-full flex flex-col">
                <h2 className="text-2xl font-normal mb-4 font-heading text-brand-dark-blue">Talk to a seller partner.</h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Ready to explore your exit options or fundraise? Our seller partners work with business owners who have built something valuable and want to ensure their legacy continues with the right acquirer.
                </p>

                <div className="mb-8 flex-grow">
                  <h3 className="text-base font-semibold mb-4 text-brand-dark-blue">Why Successful Founders Trust Nobridge:</h3>
                  <ul className="space-y-3">
                    {sellerReasons.map((reason, i) => {
                      const Icon = reason.icon;
                      return (
                        <li key={i} className="flex items-start">
                          <Icon className="h-5 w-5 text-brand-sky-blue mr-3 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{reason.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <a
                  href="https://cal.com/fachri-budianto-nobridge-seller"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-8 py-3 text-sm font-medium text-white bg-brand-dark-blue hover:bg-brand-dark-blue/90 rounded-none transition-colors"
                >
                  Schedule Seller Consultation <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="w-full py-24 md:py-32 bg-brand-dark-blue text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-12 px-4">
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight mb-4">Need something else?</h2>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Speak with a senior partner who understands your market.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="flex flex-col md:flex-row">
              {/* Form */}
              <div className="flex-[2] border border-white/15 p-5 sm:p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="John Doe"
                        className={cn(
                          "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-sky-blue focus:ring-brand-sky-blue rounded-none",
                          errors.name && "border-red-400"
                        )}
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
                        className={cn(
                          "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-sky-blue focus:ring-brand-sky-blue rounded-none",
                          errors.email && "border-red-400"
                        )}
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
                      placeholder="Inquiry about advisory services"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-sky-blue focus:ring-brand-sky-blue rounded-none"
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
                      className={cn(
                        "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-sky-blue focus:ring-brand-sky-blue rounded-none",
                        errors.message && "border-red-400"
                      )}
                      required
                    />
                    {errors.message && <p className="text-sm text-red-300 mt-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center w-full px-8 py-3 text-sm font-medium text-brand-dark-blue bg-white hover:bg-white/90 rounded-none transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="flex-1 border border-white/15 border-t-0 md:border-t md:border-l-0 p-5 sm:p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white font-heading mb-6">
                    Contact Information
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-brand-sky-blue mt-0.5" />
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
                      <Phone className="h-5 w-5 text-brand-sky-blue mt-0.5" />
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

                <div className="border border-white/15 p-4 mt-8">
                  <p className="text-sm text-blue-100 leading-relaxed">
                    "We are committed to help you in every aspect of M&A from beginning to end."
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="border-t border-white/15" />
    </div>
  );
}
