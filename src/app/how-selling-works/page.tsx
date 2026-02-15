
import Image from 'next/image';
import { FadeIn } from '@/components/ui/fade-in';
import { MessageCircle, Calendar, ArrowRight, ClipboardCheck, TrendingUp, Target, UserCheck } from 'lucide-react';

const preSteps = [
  {
    icon: TrendingUp,
    title: "Business Valuation",
    description: "We assess your business's financials, market position, and growth potential to establish a realistic and competitive valuation.",
  },
  {
    icon: ClipboardCheck,
    title: "Exit Readiness",
    description: "We review your operations, documentation, and organizational structure to identify what needs to be in order before going to market.",
  },
  {
    icon: Target,
    title: "Deal Objectives",
    description: "We define your goals for the sale: timeline, preferred deal structure, involvement post-sale, and minimum acceptable terms.",
  },
  {
    icon: UserCheck,
    title: "Seller Qualification",
    description: "We verify ownership, financials, and legal standing so buyers can engage with full confidence from the start.",
  },
];

export default function HowSellingWorksPage() {
  return (
    <div className="bg-white">
      {/* Before We Begin Section */}
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
                Before your business goes to market, we work with you to make sure everything is in place. A well-prepared seller attracts better buyers and stronger offers. Here's what we cover first.
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
              Once these foundations are set, you're ready to take your business to market with confidence.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Process Diagram */}
      <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 bg-white">
        <Image
          src="/assets/how_selling_works.png"
          alt="Diagram explaining how to sell a business on Nobridge"
          width={1200}
          height={800}
          className="w-full h-auto max-w-7xl rounded-lg"
          priority
        />
      </div>

      {/* Seller Partner CTA Section */}
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
                It's More Than Just Listing Your Business
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Selling a business involves preparing financials, managing buyer inquiries, navigating negotiations, and handling legal complexities. The right advisory partner ensures you maximize value and avoid costly mistakes.
              </p>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <div className="max-w-2xl mx-auto mt-12 bg-white rounded-xl p-8 md:p-10 text-center space-y-6 border border-gray-200 shadow-lg">
              <h3 className="text-2xl md:text-3xl font-normal font-heading text-brand-dark-blue">
                Discuss with a Seller Partner, Free of Charge
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Schedule a no-obligation call with one of our experienced seller partners. We'll help you understand your business's market value, prepare for due diligence, and map out a clear exit strategy, whether this is your first sale or you've done it before.
              </p>
              <a
                href="https://cal.com/fachri-budianto-nobridge-seller"
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
