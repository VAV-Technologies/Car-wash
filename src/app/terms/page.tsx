'use client';

import { FadeIn } from "@/components/ui/fade-in";
import { useTranslation } from '@/i18n';

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <div className="bg-brand-dark-gray">
      {/* Hero */}
      <section className="w-full min-h-[75vh] flex items-center justify-center bg-brand-black text-white section-lines-light">
        <div className="container mx-auto py-24 md:py-32">
          <FadeIn direction="up">
            <div className="text-center space-y-4 px-4">
              <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                {t('terms.title')}
              </h1>
              <p className="text-lg text-white/70">
                {t('terms.lastUpdated')}
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
              Welcome to Castudio. These Terms of Service (<strong>&quot;Terms,&quot;</strong>{" "}
              <strong>&quot;Agreement&quot;</strong>) constitute a legally binding
              agreement between you (<strong>&quot;User,&quot;</strong>{" "}
              <strong>&quot;you,&quot;</strong> <strong>&quot;your&quot;</strong>)
              and PT Vav Technologies Indonesia, operating under the name Castudio (<strong>&quot;Castudio,&quot;</strong>{" "}
              <strong>&quot;Company,&quot;</strong> <strong>&quot;we,&quot;</strong>{" "}
              <strong>&quot;us,&quot;</strong> <strong>&quot;our&quot;</strong>),
              governing your access to and use of the Castudio website, platform,
              applications, tools, and all related services (collectively, the{" "}
              <strong>&quot;Platform&quot;</strong> or{" "}
              <strong>&quot;Services&quot;</strong>). By accessing or using the
              Platform in any manner, you acknowledge that you have read,
              understood, and agree to be bound by these Terms in their entirety.
              If you do not agree to these Terms, you must immediately cease all
              use of the Platform and Services.
            </p>
            <p>
              <strong>
                PLEASE READ THESE TERMS CAREFULLY. THEY CONTAIN IMPORTANT
                INFORMATION REGARDING YOUR LEGAL RIGHTS, REMEDIES, AND
                OBLIGATIONS, INCLUDING LIMITATIONS OF LIABILITY, INDEMNIFICATION
                OBLIGATIONS, DISCLAIMERS OF WARRANTIES, AND DISPUTE RESOLUTION
                PROVISIONS.
              </strong>
            </p>

            <h2 className="font-heading">1. Definitions</h2>
            <p>
              For the purposes of this Agreement, the following terms shall have
              the meanings set forth below:
            </p>
            <ul>
              <li><strong>&quot;Account&quot;</strong> means the registered user account created by a User on the Platform.</li>
              <li><strong>&quot;Car Care Services&quot;</strong> means the car wash, car detailing, ceramic coating, paint correction, interior restoration, and related vehicle care services provided by Castudio.</li>
              <li><strong>&quot;Customer&quot;</strong> means any individual, entity, or organization that accesses the Platform with the intent to book, purchase, or otherwise use Car Care Services offered through the Platform.</li>
              <li><strong>&quot;Content&quot;</strong> means all text, data, images, graphics, videos, documents, files, service descriptions, reviews, and any other materials uploaded, submitted, posted, or transmitted by Users through the Platform.</li>
              <li><strong>&quot;Service&quot;</strong> or <strong>&quot;Booking&quot;</strong> means any car wash, detailing, coating, restoration, or other vehicle care service booked, scheduled, or purchased through or in connection with the Platform.</li>
              <li><strong>&quot;User&quot;</strong> means any individual, entity, or organization that accesses, registers on, or uses the Platform, including but not limited to Customers and any other visitors.</li>
            </ul>

            <p className="text-white/50 text-sm italic">
              Full legal terms available upon request at hi@castudio.id
            </p>

          </div>
        </div>
      </section>

      <div className="border-t border-white/10" />
    </div>
  );
}
