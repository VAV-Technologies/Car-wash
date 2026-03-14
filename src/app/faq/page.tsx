import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { Briefcase, Users, Globe, ShieldCheck, DollarSign, Handshake } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const generalFAQs = [
  {
    sectionTitle: "About Nobridge",
    icon: Globe,
    questions: [
      {
        q: "What is Nobridge and what do you do?",
        a: "Nobridge is a full-service M&A advisory firm built specifically for small and medium-sized enterprises across Asia. We provide end-to-end advisory for both sellers looking to exit their business and buyers looking to acquire in the region. Our services span the entire transaction lifecycle, from initial assessment and business positioning through buyer outreach, negotiation, due diligence, and close. We also operate a curated deal marketplace where qualified buyers can discover pre-screened acquisition opportunities.",
      },
      {
        q: "What types of businesses do you work with?",
        a: "We work with SMEs across a wide range of industries, including manufacturing, technology, services, consumer goods, food and beverage, healthcare, education, logistics, and more. Our typical clients are businesses with enterprise values between $2M and $50M. Whether you are a founder-led company, a family business, or an institutionally owned enterprise, our advisory services are designed to meet the specific needs of mid-market transactions in Asia.",
      },
      {
        q: "What markets does Nobridge cover?",
        a: "Asia is our primary market, where we have deep operational presence, cultural fluency, and local expertise. On the buyer side, our network extends globally, covering acquirers across Asia-Pacific, Europe, and North America. This includes strategic buyers, private equity funds, family offices, holding companies, search funds, and high-net-worth individuals who are actively seeking opportunities in the region. The result is a genuinely cross-border deal process with local knowledge on one side and global capital on the other.",
      },
      {
        q: "How is Nobridge different from other M&A firms?",
        a: "Most global advisory firms ignore deals under $100M, and local brokers typically lack the buyer networks, process discipline, and cross-border capability to execute effectively. Nobridge fills this gap. We combine the rigour of institutional M&A with the speed and regional depth that only a technology-enabled, locally embedded firm can offer. As an AI-enabled company, we deliver broader market coverage and faster execution than traditional advisory, with fees structured to align our incentives with yours.",
      },
      {
        q: "Is Nobridge accredited or certified?",
        a: "Yes. Nobridge is certified and accredited by the Asia Corporate Finance Institute (ACFI), which validates our adherence to professional standards in corporate finance advisory. This accreditation reflects our commitment to operating with the highest level of professionalism, integrity, and competence in every engagement we take on.",
      },
    ],
  },
];

const sellerFAQs = [
  {
    sectionTitle: "Sell-Side Advisory",
    icon: Briefcase,
    questions: [
      {
        q: "What does your sell-side advisory process look like?",
        a: "Our sell-side advisory follows a structured, proven process. It begins with a confidential discovery session where we understand your goals, timeline, and business fundamentals. From there, we conduct a thorough exit assessment including valuation benchmarking and readiness analysis. If needed, we work with you on value enhancement to strengthen your business before going to market. We then prepare professional transaction materials, including a Confidential Information Memorandum (CIM), and execute a targeted buyer outreach campaign across our global network. Once buyer interest is established, we manage the entire negotiation, due diligence, and closing process on your behalf.",
      },
      {
        q: "How do you find buyers for my business?",
        a: "We use a combination of our established global buyer network, targeted outreach, and our deal marketplace to connect your business with qualified acquirers. Our network spans strategic buyers, private equity funds, family offices, holding companies, and high-net-worth individuals across Asia-Pacific, Europe, and North America. Being an AI-enabled firm allows us to cover more ground and reach more qualified buyers than traditional advisory, ensuring your business gets the widest possible exposure to serious acquirers while maintaining strict confidentiality throughout.",
      },
      {
        q: "How do you protect my confidentiality during the sale process?",
        a: "Confidentiality is at the core of everything we do. Your business is initially presented to the market through anonymous teasers that reveal no identifying information. Interested buyers must sign a Non-Disclosure Agreement (NDA) before receiving any confidential details. We control the flow of information at every stage, releasing more detailed materials only to buyers who have been properly vetted and who have demonstrated genuine interest and financial capacity. Your employees, customers, suppliers, and competitors will not know your business is for sale unless you choose to tell them.",
      },
      {
        q: "What is value enhancement and do I need it?",
        a: "Value enhancement is an optional but often highly impactful part of our process. Before going to market, we identify and help implement improvements that directly increase your business's value and buyer appeal. This can include financial clean-up and reporting improvements, operational efficiency gains, customer and revenue diversification, building management depth, and addressing any risk factors that might concern buyers. Businesses that go through a structured value enhancement process typically see valuation increases of 20 to 40 percent. We will be honest about whether your business needs this step or is ready for market immediately.",
      },
      {
        q: "How long does the sell-side process typically take?",
        a: "The timeline varies depending on the complexity of the business and market conditions, but a typical engagement runs between 6 and 12 months from mandate to close. The initial preparation phase, including valuation, documentation, and positioning, usually takes 4 to 8 weeks. Buyer outreach and initial engagement typically run 2 to 3 months. From LOI to close, including due diligence and final negotiation, you can expect another 2 to 4 months. If value enhancement is needed, that may add 3 to 6 months upfront, but the improvement in outcome typically far outweighs the additional time.",
      },
      {
        q: "What does it cost to engage Nobridge as my sell-side advisor?",
        a: "Our sell-side advisory fees depend on the scope of work and the specific needs of your engagement. Every business and transaction is different, so we tailor our fee structure accordingly. All fee terms are discussed and agreed upon transparently during our initial consultation, before any engagement begins. There are no hidden charges, and we ensure our interests are fully aligned with achieving the best possible outcome for you.",
      },
    ],
  },
];

const buyerFAQs = [
  {
    sectionTitle: "Buy-Side Advisory",
    icon: Users,
    questions: [
      {
        q: "What buy-side services does Nobridge offer?",
        a: "Our buy-side advisory covers the full acquisition lifecycle. This includes developing your acquisition strategy and target criteria, identifying and screening on-market and off-market opportunities, conducting detailed valuation analysis and synergy modelling, coordinating multi-workstream due diligence, structuring and negotiating deal terms, arranging acquisition financing, planning and executing post-close integration, and driving post-acquisition value creation. Whether you are making your first acquisition or building a portfolio through serial M&A, we provide the support you need at every stage.",
      },
      {
        q: "How do you source acquisition targets?",
        a: "We go well beyond standard databases to find the right targets for you. Our sourcing approach combines proprietary deal flow from our Asian network, off-market opportunities identified through industry relationships and local contacts, our curated deal marketplace of pre-screened businesses, and systematic market mapping based on your specific acquisition criteria. For international buyers looking at Asia, we provide the local presence, cultural fluency, and on-the-ground intelligence that is essential for identifying and evaluating opportunities in the region.",
      },
      {
        q: "Does Nobridge represent the buyer or the seller?",
        a: "We provide advisory services to both sides, but never on the same transaction. When we are engaged as a sell-side advisor, our duty is to the seller. When we are engaged as a buy-side advisor, our duty is to the buyer. This separation is absolute and is maintained across all of our engagements. We are transparent about this from the outset so there is never any ambiguity about whose interests we are representing in a given transaction.",
      },
      {
        q: "Can I browse opportunities without a formal engagement?",
        a: "Yes. Our deal marketplace is accessible to qualified buyers who create a profile on the platform. You can browse anonymous listings, view general business information, and submit inquiries at no cost. However, accessing confidential business details and communicating directly with sellers requires completing our verification process and signing an NDA. If you are looking for more proactive, dedicated sourcing beyond what is available on the marketplace, that is where our formal buy-side advisory engagement comes in.",
      },
      {
        q: "What does buy-side advisory cost?",
        a: "Our buy-side advisory fees depend on the scope of work, the complexity of your acquisition criteria, and the level of support you need. Every engagement is structured to reflect the specific services involved. We discuss and agree on all fee terms transparently before any engagement begins, so there are no surprise costs.",
      },
    ],
  },
];

const processFAQs = [
  {
    sectionTitle: "The Deal Process",
    icon: Handshake,
    questions: [
      {
        q: "What is a Confidential Information Memorandum (CIM)?",
        a: "A CIM is a comprehensive document that presents a business opportunity in detail to potential buyers. It typically includes a thorough overview of the company, its history, products and services, market position, competitive advantages, financial performance, growth opportunities, and key operational details. We prepare CIMs on behalf of our sell-side clients to a professional, institutional standard. CIMs are only shared with buyers who have signed an NDA and been verified as serious, qualified acquirers.",
      },
      {
        q: "What is due diligence and how does Nobridge manage it?",
        a: "Due diligence is the detailed investigation phase where a buyer verifies the information provided about a target business before committing to a transaction. This typically covers financial, legal, commercial, operational, and sometimes technical and environmental areas. On the sell side, we prepare our clients for this process by organizing documentation, conducting pre-sale reviews to address potential issues proactively, and managing the flow of information to keep the process moving efficiently. On the buy side, we coordinate all diligence workstreams, manage information requests, and ensure that findings are properly evaluated and reflected in deal terms.",
      },
      {
        q: "What is an LOI and what happens after one is signed?",
        a: "A Letter of Intent (LOI) is a preliminary agreement that outlines the key terms of a proposed transaction, including purchase price, deal structure, conditions, and timeline. It signals that both parties are serious about proceeding and typically includes an exclusivity period during which the buyer conducts detailed due diligence. After an LOI is signed, the process moves into confirmatory due diligence, negotiation of definitive legal agreements, satisfaction of closing conditions, and ultimately the close of the transaction. Many deals can fall apart between LOI and close, which is why our team stays deeply involved throughout this critical phase.",
      },
      {
        q: "How do you handle negotiations?",
        a: "Negotiation is one of the most critical parts of any M&A transaction, and it goes far beyond just agreeing on a price. We negotiate across multiple dimensions, including purchase price and payment terms, deal structure and tax efficiency, earnout arrangements and performance metrics, escrow provisions and indemnification terms, working capital adjustments, non-compete and transition agreements, and representations and warranties. Our approach focuses on creating value through creative deal structuring, maintaining competitive tension when possible, and protecting our client's interests at every point in the process. We have the experience to know what is standard, what is negotiable, and where to push for better terms.",
      },
      {
        q: "What happens after a deal closes?",
        a: "For sellers, post-close activities often include a transition period where you help the buyer integrate the business, along with management of any earnout arrangements or deferred consideration. We provide ongoing support to ensure your interests are protected during this phase and that any contingent payments are properly tracked and achieved. For buyers, the focus shifts to integration and value creation. We offer integration planning and execution support to capture synergies, maintain business continuity, retain key talent, and realize the full potential of the acquisition.",
      },
    ],
  },
];

const trustFAQs = [
  {
    sectionTitle: "Fees, Confidentiality & Trust",
    icon: ShieldCheck,
    questions: [
      {
        q: "How does Nobridge's fee structure work?",
        a: "Our fee structure depends on the type and scope of each engagement. Every transaction and client situation is different, so we tailor our fees to reflect the specific work involved. Whether you are engaging us on the sell side or the buy side, all fees are discussed and agreed upon transparently before any work begins. We believe in straightforward pricing with no hidden charges, and we are happy to walk you through our approach during an initial consultation.",
      },
      {
        q: "What is a Non-Disclosure Agreement (NDA) and why is it required?",
        a: "An NDA is a legally binding agreement that protects confidential information shared between parties during the M&A process. It prevents the receiving party from sharing business details with third parties, using the information for competitive purposes, or disclosing the existence of a potential transaction. NDAs are standard practice in virtually every M&A process worldwide and are essential for protecting the seller's business, employees, and customer relationships. We require NDAs before any confidential information is shared, and they remain in effect regardless of whether a transaction ultimately proceeds.",
      },
      {
        q: "How does the verification process work?",
        a: "Verification is our process for confirming the identity and legitimacy of both buyers and sellers on our platform and in our advisory engagements. It involves a direct call with our team, a review of relevant credentials, and the signing of an NDA. The process typically takes around 48 hours and is handled personally by our team to ensure thoroughness and quality. Verification is a one-time process, and once approved, you can engage with opportunities across the platform. This step is essential for maintaining the integrity and trust that both buyers and sellers rely on.",
      },
      {
        q: "Can I engage Nobridge for just part of the process?",
        a: "Yes, our services are modular. While we offer comprehensive end-to-end advisory, we understand that some clients may only need support at specific stages. For example, a seller might engage us only for valuation and buyer outreach, while handling negotiations through their own counsel. A buyer might need help with target identification and due diligence but manage integration independently. We are flexible about scoping engagements to match your specific needs and capabilities.",
      },
      {
        q: "How do I get started with Nobridge?",
        a: "The best way to start is by booking a confidential, no-obligation consultation with our team. During this initial conversation, we will discuss your goals, assess your situation, and explain how our services can help you achieve the outcome you are looking for. Whether you are considering selling your business, looking to acquire in Asia, or simply exploring your options, this first conversation is completely free and everything discussed is kept strictly confidential. You can book a consultation through our website or contact us directly.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="w-full min-h-[50vh] flex items-center justify-center bg-brand-dark-blue text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={200}>
            <div className="text-center space-y-6 px-4">
              <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                Frequently Asked Questions
              </h1>
              <p className="text-lg md:text-xl text-blue-100 font-light max-w-2xl mx-auto">
                Common questions about our advisory services, deal process, and working with Nobridge.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* General FAQs */}
      <section className="w-full py-20 md:py-24 bg-brand-light-gray/30 section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="flex items-center gap-4 mb-12 px-4">
              <Globe className="h-8 w-8 text-brand-dark-blue" />
              <div>
                <h2 className="text-2xl md:text-3xl font-normal text-brand-dark-blue font-heading">
                  About Nobridge
                </h2>
                <p className="text-muted-foreground mt-1">Who we are, what we do, and how we are different.</p>
              </div>
            </div>
          </FadeIn>

          <div className="space-y-12">
            {generalFAQs.map((category) => (
              <FadeIn key={category.sectionTitle}>
                <div className="px-4">
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        value={`general-${index}`}
                        key={index}
                        className="border border-brand-dark-blue/10 px-4 data-[state=open]:bg-brand-light-gray/30 transition-colors"
                      >
                        <AccordionTrigger className="text-left hover:no-underline text-base font-medium text-brand-dark-blue py-4">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-brand-dark-blue/10" />

      {/* Seller FAQs */}
      <section className="w-full py-20 md:py-24 bg-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="flex items-center gap-4 mb-12 px-4">
              <Briefcase className="h-8 w-8 text-brand-dark-blue" />
              <div>
                <h2 className="text-2xl md:text-3xl font-normal text-brand-dark-blue font-heading">
                  For Business Sellers
                </h2>
                <p className="text-muted-foreground mt-1">Questions about selling your business with Nobridge.</p>
              </div>
            </div>
          </FadeIn>

          <div className="space-y-12">
            {sellerFAQs.map((category) => (
              <FadeIn key={category.sectionTitle}>
                <div className="px-4">
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        value={`seller-${index}`}
                        key={index}
                        className="border border-brand-dark-blue/10 px-4 data-[state=open]:bg-brand-light-gray/30 transition-colors"
                      >
                        <AccordionTrigger className="text-left hover:no-underline text-base font-medium text-brand-dark-blue py-4">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-brand-dark-blue/10" />

      {/* Buyer FAQs */}
      <section className="w-full py-20 md:py-24 bg-brand-light-gray/30 section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="flex items-center gap-4 mb-12 px-4">
              <Users className="h-8 w-8 text-brand-dark-blue" />
              <div>
                <h2 className="text-2xl md:text-3xl font-normal text-brand-dark-blue font-heading">
                  For Business Buyers
                </h2>
                <p className="text-muted-foreground mt-1">Questions about acquiring a business through Nobridge.</p>
              </div>
            </div>
          </FadeIn>

          <div className="space-y-12">
            {buyerFAQs.map((category) => (
              <FadeIn key={category.sectionTitle}>
                <div className="px-4">
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        value={`buyer-${index}`}
                        key={index}
                        className="border border-brand-dark-blue/10 bg-white px-4 data-[state=open]:bg-brand-light-gray/50 transition-colors"
                      >
                        <AccordionTrigger className="text-left hover:no-underline text-base font-medium text-brand-dark-blue py-4">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-brand-dark-blue/10" />

      {/* Process FAQs */}
      <section className="w-full py-20 md:py-24 bg-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="flex items-center gap-4 mb-12 px-4">
              <Handshake className="h-8 w-8 text-brand-dark-blue" />
              <div>
                <h2 className="text-2xl md:text-3xl font-normal text-brand-dark-blue font-heading">
                  The Deal Process
                </h2>
                <p className="text-muted-foreground mt-1">How M&A transactions work from start to finish.</p>
              </div>
            </div>
          </FadeIn>

          <div className="space-y-12">
            {processFAQs.map((category) => (
              <FadeIn key={category.sectionTitle}>
                <div className="px-4">
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        value={`process-${index}`}
                        key={index}
                        className="border border-brand-dark-blue/10 px-4 data-[state=open]:bg-brand-light-gray/30 transition-colors"
                      >
                        <AccordionTrigger className="text-left hover:no-underline text-base font-medium text-brand-dark-blue py-4">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-brand-dark-blue/10" />

      {/* Trust & Fees FAQs */}
      <section className="w-full py-20 md:py-24 bg-brand-light-gray/30 section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="flex items-center gap-4 mb-12 px-4">
              <ShieldCheck className="h-8 w-8 text-brand-dark-blue" />
              <div>
                <h2 className="text-2xl md:text-3xl font-normal text-brand-dark-blue font-heading">
                  Fees, Confidentiality & Trust
                </h2>
                <p className="text-muted-foreground mt-1">How we charge, protect your information, and build trust.</p>
              </div>
            </div>
          </FadeIn>

          <div className="space-y-12">
            {trustFAQs.map((category) => (
              <FadeIn key={category.sectionTitle}>
                <div className="px-4">
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        value={`trust-${index}`}
                        key={index}
                        className="border border-brand-dark-blue/10 bg-white px-4 data-[state=open]:bg-brand-light-gray/50 transition-colors"
                      >
                        <AccordionTrigger className="text-left hover:no-underline text-base font-medium text-brand-dark-blue py-4">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="border-t border-brand-dark-blue/10" />
      <section className="w-full py-12 md:py-12 bg-brand-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="relative border border-brand-dark-blue/10 bg-brand-dark-blue/5 py-36 md:py-48 px-8 md:px-16 text-center overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-brand-dark-blue mb-4 font-heading">
                  Still Have Questions?
                </h2>
                <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-10 text-center">
                  Book a confidential, no-obligation consultation with our team. We are happy to discuss your specific situation.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 h-11 py-3 px-12 text-base transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
