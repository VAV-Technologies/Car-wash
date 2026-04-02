'use client';

import { FadeIn } from "@/components/ui/fade-in";
import { useTranslation } from '@/i18n';

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="bg-brand-dark-gray">
      {/* Hero */}
      <section className="w-full min-h-[75vh] flex items-center justify-center bg-brand-black text-white section-lines-light">
        <div className="container mx-auto py-24 md:py-32">
          <FadeIn direction="up">
            <div className="text-center space-y-4 px-4">
              <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                {t('privacy.title')}
              </h1>
              <p className="text-lg text-white/70">
                {t('privacy.lastUpdated')}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="w-full py-24 md:py-32 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <div className="prose prose-lg prose-invert max-w-4xl mx-auto px-4 text-justify text-white/80 [&_h2]:text-left [&_h2]:text-white [&_h3]:text-left [&_h3]:text-white [&_h2]:mt-20 [&_h2]:mb-6 [&_h2]:pt-10 [&_h2]:border-t [&_h2]:border-white/10 [&_h3]:mt-10 [&_h3]:mb-4 [&_p]:!mb-[1.5em] [&_p]:leading-relaxed [&_li]:!mb-[0.5em] [&_ul]:!mb-[1.5em] [&_strong]:font-semibold">

            <p>
              PT Vav Technologies Indonesia, operating under the name Castudio, and its affiliates (collectively, <strong>&quot;Castudio,&quot;</strong> <strong>&quot;we,&quot;</strong> <strong>&quot;us,&quot;</strong> or <strong>&quot;our&quot;</strong>) is committed to protecting your privacy and handling your personal data responsibly. This Privacy Policy (&quot;Policy&quot;) explains how we collect, use, disclose, store, and safeguard your information when you access or use our website, platform, applications, tools, and all related services (collectively, the <strong>&quot;Services&quot;</strong>).
            </p>
            <p>
              By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with this Policy, you must immediately cease all use of our Services. This Policy forms part of and is incorporated into our Terms of Service.
            </p>
            <p>
              Our Services are designed to provide premium car wash, car detailing, ceramic coating, paint correction, interior restoration, and related vehicle care services. We collect information necessary to provide our car care services, process bookings, manage subscriptions, and communicate with you.
            </p>

            <h2 className="font-heading">1. Definitions</h2>
            <p>For the purposes of this Privacy Policy, the following terms shall have the meanings set out below:</p>
            <ul>
              <li><strong>&quot;Personal Data&quot;</strong> means any information relating to an identified or identifiable natural person.</li>
              <li><strong>&quot;Vehicle Data&quot;</strong> means any information relating to a Customer&apos;s vehicle, including make, model, year, color, license plate number, VIN, service history, and vehicle condition records.</li>
              <li><strong>&quot;Processing&quot;</strong> means any operation or set of operations performed on Personal Data or Vehicle Data.</li>
              <li><strong>&quot;Controller&quot;</strong> means the entity that determines the purposes and means of Processing Personal Data. Castudio acts as the Controller for Personal Data collected through the Services.</li>
              <li><strong>&quot;User&quot;</strong> or <strong>&quot;you&quot;</strong> means any individual or entity that accesses or uses the Services.</li>
            </ul>

            <p className="text-white/50 text-sm italic">
              Full privacy policy available upon request at hi@castudio.id
            </p>

          </div>
        </div>
      </section>

      <div className="border-t border-white/10" />
    </div>
  );
}
