"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  ArrowRight,
  Droplets,
  Clock,
  ShieldCheck,
  MapPin,
  CalendarCheck,
  Sparkles,
  Star,
  Gift,
  Phone,
  MessageCircle,
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
    message: "",
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
        description: "Please fix the errors below and try again.",
      });
      return;
    }

    const subject = encodeURIComponent(
      formData.subject || `Contact from ${formData.name}`
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );
    window.location.href = `mailto:hello@castudio.co?subject=${subject}&body=${body}`;

    toast({
      title: "Opening email client",
      description:
        "Your default email client should open with the message pre-filled.",
    });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const oneTimeReasons = [
    { icon: Droplets, text: "Premium at-home service \u2014 we come to you" },
    { icon: Clock, text: "Standard ~2hrs, Professional ~3hrs, Elite ~4hrs" },
    { icon: ShieldCheck, text: "Satisfaction guarantee on every wash" },
    { icon: MapPin, text: "Serving all JABODETABEK zones" },
  ];

  const subscriptionReasons = [
    { icon: CalendarCheck, text: "Essentials: 2 washes/month from Rp 609K" },
    { icon: Sparkles, text: "Plus: 4 washes/month from Rp 1,349K" },
    { icon: Star, text: "Unlimited: wash anytime from Rp 3,199K" },
    { icon: Gift, text: "6-month bonus: free inspection + oil change" },
  ];

  return (
    <div className="bg-brand-black">
      {/* Hero */}
      <section className="w-full min-h-[50vh] flex items-center justify-center bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center space-y-6 px-4">
              <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                Book Your Wash
              </h1>
              <p className="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto">
                Tap WhatsApp, tell us what you need, and we&apos;ll be at your
                doorstep. It&apos;s that simple.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Booking Boxes */}
      <section className="w-full py-24 md:py-32 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row">
            {/* One-Time Wash Box */}
            <FadeIn delay={100} className="flex-1">
              <div className="border border-white/10 p-8 md:p-10 h-full flex flex-col">
                <h2 className="text-2xl font-normal mb-4 font-heading text-white">
                  Book a One-Time Wash
                </h2>
                <p className="text-white/60 text-lg mb-8 leading-relaxed">
                  Choose Standard (Rp 339K), Professional (Rp 569K), or Elite
                  (Rp 919K). Tell us your preferred date, time, and location.
                  We&apos;ll confirm within 30 minutes.
                </p>

                <div className="mb-8 flex-grow">
                  <h3 className="text-base font-semibold mb-4 text-white">
                    Why Choose Castudio:
                  </h3>
                  <ul className="space-y-3">
                    {oneTimeReasons.map((reason, i) => {
                      const Icon = reason.icon;
                      return (
                        <li key={i} className="flex items-start">
                          <Icon className="h-5 w-5 text-brand-orange mr-3 mt-0.5 shrink-0" />
                          <span className="text-white/60">{reason.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <a
                  href="https://wa.me/62816104334?text=Halo%2C%20saya%20ingin%20booking%20cuci%20mobil.%20Lokasi%20saya%20di%20[area]."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-8 py-3 text-sm font-medium text-black bg-brand-orange hover:bg-brand-orange/90 rounded-none transition-colors"
                >
                  Book via WhatsApp <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </div>
            </FadeIn>

            {/* Subscription Box */}
            <FadeIn delay={200} className="flex-1">
              <div className="border border-white/10 border-t-0 md:border-t md:border-l-0 p-8 md:p-10 h-full flex flex-col">
                <h2 className="text-2xl font-normal mb-4 font-heading text-white">
                  Start a Subscription
                </h2>
                <p className="text-white/60 text-lg mb-8 leading-relaxed">
                  Plans from Rp 609,000/month. We&apos;ll keep your car pristine
                  on a schedule that works for you. Commit for 6 months and get a
                  free car inspection + oil change.
                </p>

                <div className="mb-8 flex-grow">
                  <h3 className="text-base font-semibold mb-4 text-white">
                    Subscription Plans:
                  </h3>
                  <ul className="space-y-3">
                    {subscriptionReasons.map((reason, i) => {
                      const Icon = reason.icon;
                      return (
                        <li key={i} className="flex items-start">
                          <Icon className="h-5 w-5 text-brand-orange mr-3 mt-0.5 shrink-0" />
                          <span className="text-white/60">{reason.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <a
                  href="https://wa.me/62816104334?text=Halo%2C%20saya%20ingin%20berlangganan%20paket%20cuci%20mobil."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-8 py-3 text-sm font-medium text-black bg-brand-orange hover:bg-brand-orange/90 rounded-none transition-colors"
                >
                  Subscribe via WhatsApp{" "}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="w-full py-24 md:py-32 bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-12 px-4">
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight mb-4">
                Prefer email?
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Send us a message and we&apos;ll get back to you.
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
                      <Label htmlFor="name" className="text-white">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="John Doe"
                        className={cn(
                          "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-orange focus:ring-brand-orange rounded-none",
                          errors.name && "border-red-400"
                        )}
                        required
                      />
                      {errors.name && (
                        <p className="text-sm text-red-300 mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="you@example.com"
                        className={cn(
                          "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-orange focus:ring-brand-orange rounded-none",
                          errors.email && "border-red-400"
                        )}
                        required
                      />
                      {errors.email && (
                        <p className="text-sm text-red-300 mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white">
                      Subject (Optional)
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      placeholder="Inquiry about car wash services"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-orange focus:ring-brand-orange rounded-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      placeholder="Your message..."
                      rows={5}
                      className={cn(
                        "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-orange focus:ring-brand-orange rounded-none",
                        errors.message && "border-red-400"
                      )}
                      required
                    />
                    {errors.message && (
                      <p className="text-sm text-red-300 mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center w-full px-8 py-3 text-sm font-medium text-black bg-brand-orange hover:bg-brand-orange/90 rounded-none transition-colors"
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
                      <MessageCircle className="h-5 w-5 text-brand-orange mt-0.5" />
                      <div>
                        <p className="text-sm text-white/60 mb-1">WhatsApp</p>
                        <a
                          href="https://wa.me/62816104334"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-brand-orange transition-colors font-medium"
                        >
                          +62 816 10 4334
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-brand-orange mt-0.5" />
                      <div>
                        <p className="text-sm text-white/60 mb-1">Email</p>
                        <a
                          href="mailto:hello@castudio.co"
                          className="text-white hover:text-brand-orange transition-colors font-medium"
                        >
                          hello@castudio.co
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-brand-orange mt-0.5" />
                      <div>
                        <p className="text-sm text-white/60 mb-1">Hours</p>
                        <p className="text-white font-medium">
                          Mon&ndash;Sat, 8 AM&ndash;6 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-white/15 p-4 mt-8">
                  <p className="text-sm text-white/70 leading-relaxed">
                    &ldquo;Your car deserves better than a street wash.&rdquo;
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
