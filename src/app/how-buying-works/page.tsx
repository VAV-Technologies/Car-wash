
import Image from 'next/image';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/fade-in';
import { MessageCircle, Calendar, ArrowRight, ClipboardCheck, DollarSign, Building2, Target, UserCheck, Wallet } from 'lucide-react';

const preSteps = [
  {
    icon: Target,
    title: "Acquisition Criteria",
    description: "We define what you're looking for: industry, geography, deal size, and strategic fit with your goals.",
  },
  {
    icon: Building2,
    title: "Company Assessment",
    description: "We review your background, capabilities, and operational strengths to match you with the right opportunities.",
  },
  {
    icon: Wallet,
    title: "Budget and Financing",
    description: "We assess your available capital, financing options, and deal structuring preferences to set realistic parameters.",
  },
  {
    icon: UserCheck,
    title: "Buyer Qualification",
    description: "We verify your credentials and readiness so sellers can engage with confidence from day one.",
  },
];

export default function HowBuyingWorksPage() {
  return (
    <div className="bg-white">
      {/* Before You Start Section */}
      <section className="w-full pt-16 md:pt-24 pb-6 md:pb-8 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <FadeIn direction="up">
            <div className="max-w-3xl mx-auto text-center space-y-6 mb-16">
              <div className="flex justify-center">
                <div className="bg-brand-dark-blue/10 p-4 rounded-full">
                  <ClipboardCheck className="h-10 w-10 text-brand-dark-blue" />
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-normal font-heading tracking-tight text-brand-dark-blue">
                Before We Begin
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Before you start browsing opportunities, we work with you to lay the groundwork. A successful acquisition starts well before the first listing is viewed. Here's what we figure out together first.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {preSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <FadeIn key={step.title} delay={index * 100} className="h-full">
                  <div className="flex items-start space-x-5 p-6 rounded-xl bg-brand-light-gray/50 border border-gray-100 hover:border-brand-dark-blue/20 hover:shadow-md transition-all h-full">
                    <div className="flex-shrink-0 bg-brand-dark-blue/10 p-3 rounded-full">
                      <Icon className="h-6 w-6 text-brand-dark-blue" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-brand-dark-blue mb-1">{step.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn direction="up" delay={400}>
            <p className="text-center text-muted-foreground mt-8 max-w-2xl mx-auto text-lg">
              Once we've aligned on these foundations, you're ready to move through the acquisition process with clarity and confidence.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Process Diagram */}
      <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 bg-white">
        <Image
          src="/assets/how_buying_works.png"
          alt="Diagram explaining how to buy a business on Nobridge"
          width={1200}
          height={800}
          className="w-full h-auto max-w-7xl rounded-lg"
          priority
        />
      </div>

      {/* Buyer Partner CTA Section */}
      <section className="w-full py-16 md:py-24 bg-brand-light-gray">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <FadeIn direction="up">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-brand-dark-blue/10 p-4 rounded-full">
                  <MessageCircle className="h-10 w-10 text-brand-dark-blue" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight text-brand-dark-blue">
                It's Not as Simple as It Looks
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Acquiring a business involves navigating valuations, due diligence, legal structures, negotiations, and cross-border complexities. Every deal is different, and the right guidance early on can save you months and significant capital.
              </p>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <div className="max-w-2xl mx-auto mt-12 bg-white rounded-xl p-8 md:p-10 text-center space-y-6 border border-gray-200 shadow-lg">
              <h3 className="text-2xl md:text-3xl font-normal font-heading text-brand-dark-blue">
                Discuss with a Buyer Partner, Free of Charge
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Schedule a no-obligation call with one of our experienced buyer partners. We'll help you understand the acquisition landscape, evaluate opportunities that match your criteria, and outline a clear path forward, whether you're a first-time buyer or an experienced acquirer.
              </p>
              <a
                href="https://cal.com/ahmad-fadil-lubis/nobridge-buyer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-brand-dark-blue hover:bg-brand-dark-blue/90 rounded-md transition-colors"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Schedule a Free Call
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
