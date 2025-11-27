import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Search, Users, Info, ShieldCheck, MessageSquare } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { FadeIn } from "@/components/ui/fade-in";

const sellerFAQs = [
  {
    sectionTitle: "General & Getting Started",
    icon: <Info className="h-5 w-5 mr-2 text-brand-sky-blue" />,
    questions: [
      {
        q: "What is Nobridge?",
        a: "Nobridge is an online platform designed to help owners of small and medium-sized enterprises (SMEs) in Asia sell their businesses. We connect you with interested buyers and offer support throughout the process to make it simpler and more secure.",
      },
      {
        q: "Who is Nobridge for?",
        a: "Nobridge is for any SME owner in Asia who is considering selling their business and wants to connect with a wide range of potential buyers, such as investors or other companies, in a secure environment.",
      },
      {
        q: "How much does it cost to list my business?",
        a: "It is free to create an anonymous profile and list your business for sale on Nobridge. Fees are only applicable if you choose to formally hire us for our advisory services later in the process.",
      },
      {
        q: "What kind of businesses can I sell on this platform?",
        a: "You can list any legitimate small or medium enterprise located in Asia. Our platform supports advanced filters for industry, region, revenue, and more, so buyers can find businesses like yours.",
      },
      {
        q: "Can I delete my listing if I change my mind?",
        a: "Yes, you have full control over your listing. You can choose to remove it at any time through your account dashboard.",
      },
    ],
  },
  {
    sectionTitle: "How the Platform Works",
    icon: <Briefcase className="h-5 w-5 mr-2 text-brand-sky-blue" />,
    questions: [
      {
        q: "What is an \"anonymous\" listing?",
        a: "An anonymous listing is your first step. It allows you to showcase your business with general details like its category, country, and high-level financials without revealing your company's name or any sensitive data. This protects your confidentiality while attracting initial interest.",
      },
      {
        q: "How do I create a business listing?",
        a: "After signing up, you'll be guided through a simple process to create a profile for your business. You'll enter key details like industry, location, and a general description to get started.",
      },
      {
        q: "What happens when a buyer is interested?",
        a: "When an interested buyer clicks \"inquire\" on your listing, you receive a notification. This message will give you a general idea of who is interested (e.g., \"A private equity company from Indonesia is interested\") and will prompt you to verify your profile to take the next step.",
      },
      {
        q: "How do I communicate with buyers?",
        a: "Direct communication is enabled only after both you and the buyer have verified your profiles. Once verified, a secure chat will open on the platform, allowing you to talk directly.",
      },
      {
        q: "Can I edit my business listing after it's published?",
        a: "Yes, you can log in and edit your listing details at any time. It's a good practice to keep the information current.",
      },
    ],
  },
  {
    sectionTitle: "Verification, Security & Trust",
    icon: <ShieldCheck className="h-5 w-5 mr-2 text-brand-sky-blue" />,
    questions: [
      {
        q: "Why do I need to verify my account?",
        a: "Verification is a crucial security step. It builds trust within the marketplace and protects your confidential business information by ensuring it's only shared with serious, legitimate buyers who have also been vetted.",
      },
      {
        q: "What is the verification process?",
        a: "Verification is a one-time process handled manually by our team. It includes a direct contact call with you and requires signing a standard Non-Disclosure Agreement (NDA) to legally protect your information.",
      },
      {
        q: "How long does verification take?",
        a: "The manual verification process takes approximately 48 hours to complete. Our team will guide you through it.",
      },
      {
        q: "What is a Non-Disclosure Agreement (NDA)?",
        a: "An NDA is a legal contract that obligates the buyer to keep your confidential information private. It prohibits them from sharing your data or discussing the deal outside of the platform. This is a standard and critical tool for your protection.",
      },
      {
        q: "Is my data secure on Nobridge?",
        a: "Absolutely. We prioritize security and confidentiality. Sensitive data is only revealed to verified buyers after an NDA is signed. All interactions are governed by our secure platform rules.",
      },
    ],
  },
  {
    sectionTitle: "Support & Next Steps",
    icon: <MessageSquare className="h-5 w-5 mr-2 text-brand-sky-blue" />,
    questions: [
      {
        q: "What happens after I start talking to a buyer?",
        a: "After you connect via chat, you can discuss the business further. If you both agree that there's a good fit and want to proceed with a potential sale, you can choose to engage Nobridge for more hands-on help.",
      },
      {
        q: "What kind of support does Nobridge offer?",
        a: "Should you choose to hire us, Nobridge acts as your dedicated M&A advisor. We help you prepare your business information, guide you through negotiations , and manage the entire sale process to ensure everything runs smoothly and professionally, helping you get the best possible price.",
      },
      {
        q: "I'm having a problem with my account. How can I get help?",
        a: "We're here to assist you. Please visit the \"Contact Us\" or \"Help\" section on our platform to reach our support team. For any issues specifically related to the verification process, our team will be in direct contact with you.",
      },
      {
        q: "What if I get multiple interested buyers?",
        a: "This is a great position to be in! You can choose to verify and engage in conversations with multiple buyers simultaneously. If you later hire Nobridge as your advisor, we will professionally manage communications with all interested parties to your advantage.",
      },
      {
        q: "Do I have to use Nobridge's advisory service?",
        a: "While our platform is designed to lead into our advisory services for a secure and successful sale, the initial listing and connection phase is obligation-free. The decision to formally hire us is yours to make when you are ready to proceed seriously with a buyer.",
      },
    ],
  },
];

const buyerFAQs = [
  {
    sectionTitle: "General & Getting Started",
    icon: <Info className="h-5 w-5 mr-2 text-brand-sky-blue" />,
    questions: [
      {
        q: "What is Nobridge?",
        a: "Nobridge is a marketplace connecting you with owners of small and medium-sized enterprises (SMEs) across Asia who are looking to sell their businesses.",
      },
      {
        q: "What kind of investment opportunities are on the platform?",
        a: "You will find a wide range of SMEs from various industries and countries across Asia. You can use our search and filter tools to narrow down opportunities based on your specific criteria, such as industry, revenue, or region.",
      },
      {
        q: "Is there a fee for me to use Nobridge?",
        a: "No. Nobridge is free for buyers to use. You can browse listings, create a profile, and connect with sellers at no cost. Our advisory fees are paid by the seller upon the successful sale of their business.",
      },
      {
        q: "How do I find businesses that match my interests?",
        a: "You can use our marketplace filters to search for businesses by category, location, asking price, revenue, and more. This helps you quickly find relevant acquisition opportunities.",
      },
    ],
  },
  {
    sectionTitle: "How the Platform Works",
    icon: <Search className="h-5 w-5 mr-2 text-brand-sky-blue" />,
    questions: [
      {
        q: "What is an \"anonymous\" listing?",
        a: "Sellers first list their businesses anonymously to protect their confidentiality. You will see key details like the business type and financial highlights, but not the company's name.",
      },
      {
        q: "How do I show interest in a business?",
        a: "If a listing interests you, simply click the \"Inquire\" or \"Request to Connect\" button. This sends a notification to the seller, letting them know you'd like to learn more.",
      },
      {
        q: "How do I communicate with a seller?",
        a: "Direct communication through our secure on-platform chat is enabled only after both you and the seller have completed the verification process.",
      },
      {
        q: "Why can't I contact a seller directly?",
        a: "This process is designed to protect both parties. It ensures that sellers are not overwhelmed by non-serious inquiries and that you are only connected when the seller is genuinely ready and willing to engage in a confidential conversation.",
      },
    ],
  },
  {
    sectionTitle: "Verification, Security & Trust",
    icon: <ShieldCheck className="h-5 w-5 mr-2 text-brand-sky-blue" />,
    questions: [
      {
        q: "Why do I need to verify my profile?",
        a: "Verification is essential to building a trusted community. It proves to sellers that you are a serious and legitimate buyer, which gives them the confidence to share sensitive business information with you. You cannot access detailed profiles or speak to sellers without being verified.",
      },
      {
        q: "What does the verification process involve for me?",
        a: "Once a seller you've inquired about becomes verified, you will be prompted to do the same. Our team will contact you directly to confirm your identity. The key step is signing a Non-Disclosure Agreement (NDA) to ensure you handle the seller's information with confidentiality.",
      },
      {
        q: "How long does my verification take?",
        a: "The process typically takes around 48 hours, as our team handles it manually to ensure quality and security.",
      },
      {
        q: "What am I agreeing to in the Non-Disclosure Agreement (NDA)?",
        a: "The NDA is a standard legal agreement where you promise to keep the seller's confidential information private. It prevents the sharing of data or deal discussions outside the platform. This is a requirement to access any sensitive deal information.",
      },
      {
        q: "How do I know the business information is accurate?",
        a: "While sellers provide the initial information, our process is designed to bring clarity. Once a seller engages Nobridge as an advisor for a serious transaction, we work with them to prepare professional and detailed materials for your review.",
      },
    ],
  },
  {
    sectionTitle: "Support & Next Steps",
    icon: <MessageSquare className="h-5 w-5 mr-2 text-brand-sky-blue" />,
    questions: [
      {
        q: "What are the next steps after I connect with a seller?",
        a: "The secure chat allows you to ask more detailed questions and understand the business better. If you both find there is a potential fit, you can discuss how to best move forward toward a potential acquisition.",
      },
      {
        q: "Who does Nobridge represent in a transaction?",
        a: "It is very important to understand that Nobridge is exclusively a seller-side M&A advisor. Our professional duty and focus is to represent the best interests of the seller. We facilitate a fair and professional process for all, but our client is the seller.",
      },
      {
        q: "I am having technical issues. Who do I contact?",
        a: "For any help with your account or technical problems on the platform, please use the \"Contact Us\" or \"Support\" link. Our team will be happy to assist you.",
      },
      {
        q: "Can I save or \"watch\" listings that I'm interested in?",
        a: "Yes, our platform includes features to help you track opportunities. You can save interesting listings to your dashboard to easily review them later.",
      },
      {
        q: "What if a deal doesn't work out after I've connected with a seller?",
        a: "This can happen for many reasons. You are free to end discussions professionally at any time. Your NDA obligations regarding any confidential information you received will still apply. You can then continue to browse and connect with other business owners on the platform.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AnimatedBackground position="fixed" className="z-0" />

      {/* Header Section */}
      <section className="relative z-10 w-full pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 text-center">
          <FadeIn direction="up" delay={200} className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold font-heading tracking-tight text-white drop-shadow-lg">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl font-light leading-relaxed text-blue-100 drop-shadow-md max-w-2xl mx-auto">
              Find answers to common questions about using Nobridge.
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="relative z-10 container mx-auto px-4 md:px-6 pb-24 md:pb-32">
        <FadeIn delay={400}>
          <Card className="shadow-2xl bg-white/10 backdrop-blur-xl border-white/20 text-white overflow-hidden">
            <CardContent className="max-w-4xl mx-auto p-8 md:p-12 space-y-16">

              {/* Seller FAQs */}
              <div>
                <div className="flex items-center mb-8 border-b border-white/10 pb-4">
                  <div className="p-3 bg-brand-sky-blue/20 rounded-full mr-4 backdrop-blur-sm">
                    <Briefcase className="h-8 w-8 text-brand-sky-blue" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white font-heading">
                      FAQ for Business Sellers
                    </h2>
                    <p className="text-blue-100 mt-1">Everything you need to know about selling your business.</p>
                  </div>
                </div>

                {sellerFAQs.map((category) => (
                  <div key={category.sectionTitle} className="mb-10 last:mb-0">
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-white/90 font-heading">
                      {category.icon}
                      {category.sectionTitle}
                    </h3>
                    <Accordion type="single" collapsible className="w-full space-y-3">
                      {category.questions.map((faq, index) => (
                        <AccordionItem
                          value={`seller-${category.sectionTitle}-${index}`}
                          key={index}
                          className="border border-white/10 rounded-lg bg-white/5 px-4 data-[state=open]:bg-white/10 transition-colors"
                        >
                          <AccordionTrigger className="text-left hover:no-underline text-base font-medium text-white py-4">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-blue-100 text-base leading-relaxed pb-4">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-12" />

              {/* Buyer FAQs */}
              <div>
                <div className="flex items-center mb-8 border-b border-white/10 pb-4">
                  <div className="p-3 bg-brand-sky-blue/20 rounded-full mr-4 backdrop-blur-sm">
                    <Users className="h-8 w-8 text-brand-sky-blue" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white font-heading">
                      FAQ for Business Buyers
                    </h2>
                    <p className="text-blue-100 mt-1">Everything you need to know about buying a business.</p>
                  </div>
                </div>

                {buyerFAQs.map((category) => (
                  <div key={category.sectionTitle} className="mb-10 last:mb-0">
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-white/90 font-heading">
                      {category.icon}
                      {category.sectionTitle}
                    </h3>
                    <Accordion type="single" collapsible className="w-full space-y-3">
                      {category.questions.map((faq, index) => (
                        <AccordionItem
                          value={`buyer-${category.sectionTitle}-${index}`}
                          key={index}
                          className="border border-white/10 rounded-lg bg-white/5 px-4 data-[state=open]:bg-white/10 transition-colors"
                        >
                          <AccordionTrigger className="text-left hover:no-underline text-base font-medium text-white py-4">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-blue-100 text-base leading-relaxed pb-4">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>

              <div className="mt-20 text-center border-t border-white/10 pt-12">
                <h3 className="text-2xl font-semibold mb-4 font-heading text-white">Still have questions?</h3>
                <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                  If you can't find the answer you're looking for, please don't hesitate to reach out to our support team.
                </p>
                <Button asChild size="lg" className="bg-brand-sky-blue text-brand-dark-blue hover:bg-white hover:text-brand-dark-blue font-semibold px-8 shadow-lg shadow-brand-sky-blue/20">
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}

