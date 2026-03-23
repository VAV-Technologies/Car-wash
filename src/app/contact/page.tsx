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
import { useTranslation } from "@/i18n";

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
  const { t } = useTranslation();

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
      newErrors.name = t('contact.form.nameRequired');
    } else if (formData.name.length > 100) {
      newErrors.name = t('contact.form.nameTooLong');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.form.emailInvalid');
    } else if (formData.email.length > 100) {
      newErrors.email = t('contact.form.emailTooLong');
    }
    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.messageRequired');
    } else if (formData.message.length > 2000) {
      newErrors.message = t('contact.form.messageTooLong');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: t('contact.form.validationError'),
        description: t('contact.form.validationErrorDesc'),
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
      title: t('contact.form.openingEmail'),
      description: t('contact.form.openingEmailDesc'),
    });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const oneTimeReasons = [
    { icon: Droplets, text: t('contact.oneTime.reason1') },
    { icon: Clock, text: t('contact.oneTime.reason2') },
    { icon: ShieldCheck, text: t('contact.oneTime.reason3') },
    { icon: MapPin, text: t('contact.oneTime.reason4') },
  ];

  const subscriptionReasons = [
    { icon: CalendarCheck, text: t('contact.subscription.plan1') },
    { icon: Sparkles, text: t('contact.subscription.plan2') },
    { icon: Star, text: t('contact.subscription.plan3') },
    { icon: Gift, text: t('contact.subscription.plan4') },
  ];

  return (
    <div className="bg-brand-black">
      {/* Hero */}
      <section className="w-full min-h-[75vh] flex items-center justify-center bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center space-y-6 px-4">
              <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                {t('contact.hero.title')}
              </h1>
              <p className="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto">
                {t('contact.hero.subtitle')}
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
                  {t('contact.oneTime.title')}
                </h2>
                <p className="text-white/60 text-lg mb-8 leading-relaxed">
                  {t('contact.oneTime.body')}
                </p>

                <div className="mb-8 flex-grow">
                  <h3 className="text-base font-semibold mb-4 text-white">
                    {t('contact.oneTime.whyTitle')}
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
                  {t('common.cta.bookViaWhatsApp')} <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </div>
            </FadeIn>

            {/* Subscription Box */}
            <FadeIn delay={200} className="flex-1">
              <div className="border border-white/10 border-t-0 md:border-t md:border-l-0 p-8 md:p-10 h-full flex flex-col">
                <h2 className="text-2xl font-normal mb-4 font-heading text-white">
                  {t('contact.subscription.title')}
                </h2>
                <p className="text-white/60 text-lg mb-8 leading-relaxed">
                  {t('contact.subscription.body')}
                </p>

                <div className="mb-8 flex-grow">
                  <h3 className="text-base font-semibold mb-4 text-white">
                    {t('contact.subscription.plansTitle')}
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
                  href="https://wa.me/62816104334?text=Halo%2C%20saya%20ingin%20booking%20sesi%20detailing."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-8 py-3 text-sm font-medium text-black bg-brand-orange hover:bg-brand-orange/90 rounded-none transition-colors"
                >
                  {t('common.cta.bookViaWhatsApp')}{" "}
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
                {t('contact.form.title')}
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                {t('contact.form.subtitle')}
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
                        {t('contact.form.fullName')}
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
                        {t('contact.form.emailAddress')}
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
                      {t('contact.form.subject')}
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      placeholder={t('contact.form.subjectPlaceholder')}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-orange focus:ring-brand-orange rounded-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white">
                      {t('contact.form.message')}
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      placeholder={t('contact.form.messagePlaceholder')}
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
                    {t('contact.form.send')}
                  </button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="flex-1 border border-white/15 border-t-0 md:border-t md:border-l-0 p-5 sm:p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white font-heading mb-6">
                    {t('contact.info.title')}
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
                        <p className="text-sm text-white/60 mb-1">{t('common.contact.hoursLabel')}</p>
                        <p className="text-white font-medium">
                          {t('common.contact.hours')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-white/15 p-4 mt-8">
                  <p className="text-sm text-white/70 leading-relaxed">
                    {t('contact.info.quote')}
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
