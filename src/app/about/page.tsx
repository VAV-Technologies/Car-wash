
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Globe, Handshake, ShieldCheck, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-16">
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="text-center bg-brand-light-gray p-8 md:p-12">
          <CardTitle className="text-3xl md:text-5xl font-bold text-primary font-heading">
            About Nobridge
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none dark:prose-invert p-6 md:p-10 space-y-8">
          <p>
            At Nobridge, we are dedicated to a singular mission: to make the process of buying and selling small and medium-sized enterprises (SMEs) across Asia simpler, more transparent, and more secure. We understand that selling a business is one of the most significant events in an owner's life. It's the culmination of years of hard work, passion, and dedication. Our platform and advisory services are built to honor that legacy and maximize its value.
          </p>
          
          <div className="my-8 md:my-12">
            <Image
              src="/assets/about-us-1.jpg"
              alt="Team discussing business strategy in a modern office"
              width={1000}
              height={500}
              className="rounded-lg shadow-lg w-full max-w-4xl mx-auto h-auto"
              data-ai-hint="team business strategy"
            />
          </div>

          <h2 className="font-heading">The Challenge for SME Owners</h2>
          <p>
            The mergers and acquisitions (M&A) landscape can be daunting, especially for SME owners. They often face sophisticated buyers, such as private equity firms and strategic acquirers, who possess significant transactional experience. This information and experience gap can leave sellers at a disadvantage. Nobridge was created to level the playing field, providing SME owners with the dedicated, expert advisory they need to navigate the complexities of a sale with confidence.
          </p>

          <h2 className="font-heading">Our Solution: A Trusted Partner from Start to Finish</h2>

           <div className="my-8 md:my-12">
            <Image
              src="/assets/about-us-2.jpg"
              alt="Two professionals shaking hands, finalizing a deal"
              width={1000}
              height={500}
              className="rounded-lg shadow-lg w-full max-w-4xl mx-auto h-auto"
              data-ai-hint="handshake deal business"
            />
          </div>

          <p>
            Nobridge is more than just a marketplace; we are a comprehensive platform and advisory partner designed to support business owners through every stage of their exit.
          </p>
          
          <h3 className="font-heading">A Modern Marketplace for Discovery</h3>
          <p>Our platform begins as an online M&A marketplace connecting business sellers with a diverse range of qualified buyers. We enable frictionless discovery by allowing users to browse listings with a degree of anonymity, lowering the barrier to exploring possibilities. Listings showcase key details like business category, location, and high-level financial metrics to attract initial interest.</p>

          <h3 className="font-heading">A Foundation of Trust and Confidentiality</h3>
          <p>We have built a secure and trustworthy ecosystem. Sensitive business data is protected through a robust, manual verification process that can take up to 48 hours and may include direct contact. Communication between parties is enabled only after both are verified and have executed a jurisdiction-specific Non-Disclosure Agreement (NDA), ensuring all discussions are protected.</p>

          <h3 className="font-heading">Exclusive, Expert Seller-Side Advisory</h3>
          <p>Our mandate is clear and unwavering: we exclusively represent the seller. From the moment of formal engagement, Nobridge acts as the seller's dedicated M&A advisor. We manage the entire transaction, from strategic preparation and comprehensive valuation to confidential marketing, negotiation, and closing. Our goal is to craft a compelling narrative, defend the company's true value, and generate a competitive environment to achieve the best possible price and terms for our client.</p>

          <div className="not-prose pt-8">
            <h2 className="text-3xl font-bold text-center text-primary mb-8 font-heading">Why Choose Nobridge?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground font-heading">Asia-Centric Focus</h4>
                  <p className="text-muted-foreground mt-1">Nobridge is built by experts who understand the specific nuances and needs of the SME landscape across Asia.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground font-heading">Dedicated Advocacy</h4>
                  <p className="text-muted-foreground mt-1">We are not neutral facilitators. Our fiduciary duty is exclusively to the seller, ensuring their interests are protected.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground font-heading">End-to-End Execution</h4>
                  <p className="text-muted-foreground mt-1">We provide structured support throughout the entire M&A journey, from marketing to post-closing.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                  <Handshake className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground font-heading">Alignment and Transparency</h4>
                  <p className="text-muted-foreground mt-1">Our success-based fee structure ensures our primary compensation is directly tied to a successful closing.</p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="pt-6">
            By combining a modern technology platform with disciplined, expert-led advisory, Nobridge empowers SME owners to navigate their exit with clarity, confidence, and the professional support required to successfully monetize their life's work.
          </p>

        </CardContent>
      </Card>
    </div>
  );
}
