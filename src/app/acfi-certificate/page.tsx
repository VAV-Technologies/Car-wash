import Link from "next/link";
import {
  ShieldCheck,
  Award,
  CheckCircle,
  Globe,
  Users,
  Scale,
  FileCheck,
  TrendingUp,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

const certificationTiers = [
  {
    name: "Certified Member",
    description:
      "Meets baseline professional standards for M&A advisory practice.",
    highlighted: false,
  },
  {
    name: "Gold Certified",
    description:
      "Demonstrates exceptional expertise, strong transaction track records, and superior client outcomes.",
    highlighted: true,
  },
  {
    name: "Founding Member",
    description:
      "Charter members who helped establish ACFI's standards and governance framework.",
    highlighted: false,
  },
];

const evaluationCriteria = [
  {
    icon: TrendingUp,
    title: "Transaction Experience",
    description:
      "Demonstrated track record of successful M&A transactions, assessed through the combined experience of the firm's advisory team from prior engagements.",
  },
  {
    icon: Award,
    title: "Professional Qualifications",
    description:
      "Academic credentials, professional certifications, and ongoing development in corporate finance and M&A advisory.",
  },
  {
    icon: Users,
    title: "Client Satisfaction",
    description:
      "Verified client feedback, referral rates, and engagement completion metrics reflecting service quality.",
  },
  {
    icon: Scale,
    title: "Compliance & Regulatory Standing",
    description:
      "Adherence to local and international regulatory frameworks, clean disciplinary records, and robust internal compliance systems.",
  },
  {
    icon: Globe,
    title: "Cross-Border Deal Experience",
    description:
      "Proven ability to navigate multi-jurisdictional transactions across diverse Asian markets and legal systems.",
  },
  {
    icon: FileCheck,
    title: "Regional Market Presence",
    description:
      "Active engagement and established networks within key Asian economies, with demonstrable local market knowledge.",
  },
];

const assessmentFindings = [
  "Team members bring a combined track record spanning numerous completed M&A transactions from prior advisory roles at established firms",
  "Deep cross-border M&A expertise across Southeast Asian, East Asian, and South Asian markets",
  "Strong compliance framework and adherence to ethical standards in all advisory engagements",
  "High client satisfaction metrics with a focus on long-term relationship building",
  "Technology-enabled advisory approach that enhances deal sourcing, due diligence, and transaction execution",
];

const ethicsCommitments = [
  {
    title: "Integrity",
    description:
      "Conducting all business dealings with honesty, transparency, and fairness to all parties involved.",
  },
  {
    title: "Confidentiality",
    description:
      "Safeguarding client information and sensitive transaction details with the highest standards of discretion.",
  },
  {
    title: "Competence",
    description:
      "Maintaining and continuously developing professional knowledge and skills relevant to M&A advisory.",
  },
  {
    title: "Compliance",
    description:
      "Adhering to all applicable laws, regulations, and professional standards across every jurisdiction of operation.",
  },
  {
    title: "Fair Competition",
    description:
      "Engaging in honest and ethical competitive practices that uphold the reputation of the M&A advisory profession.",
  },
  {
    title: "Client-First Duty",
    description:
      "Prioritizing the interests of clients above all else, providing objective advice free from conflicts of interest.",
  },
];

export default function ACFICertificatePage() {
  return (
    <div className="bg-white">
      {/* Section 1 — Hero */}
      <section className="w-full min-h-[60vh] bg-brand-dark-blue flex items-center py-24 text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={200} className="text-center space-y-6 px-4">
            <div className="flex justify-center mb-4">
              <div className="bg-brand-sky-blue/20 p-5 rounded-full">
                <ShieldCheck className="h-14 w-14 text-brand-sky-blue" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
              ACFI Partner Report
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-light max-w-2xl mx-auto">
              Gold Certified M&A Advisory Firm
            </p>
            <div className="pt-4">
              <a
                href="https://acfi.asia/certification"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-brand-sky-blue hover:text-white transition-colors text-lg"
              >
                Learn about ACFI Certification
                <ExternalLink className="ml-2 h-5 w-5" />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section 2 — Certification Overview */}
      <section className="w-full py-24 md:py-32 bg-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center space-y-6 mb-16 px-4">
              <h2 className="text-3xl md:text-4xl font-normal text-brand-dark-blue font-heading tracking-tight">
                Certification Overview
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                The Asia Corporate Finance Institute (ACFI) is an
                industry body that sets professional standards for corporate
                finance and M&A advisory firms operating across Asia. ACFI
                certification signals to clients, partners, and regulators that
                a firm meets rigorous benchmarks for professional competence,
                ethical conduct, and transaction quality.
              </p>
            </div>
          </FadeIn>

          <div className="flex flex-col md:flex-row">
            {certificationTiers.map((tier, index) => (
              <FadeIn key={tier.name} delay={index * 100} className="flex-1">
                <div className={cn(
                  "border border-brand-dark-blue/10 p-8 h-full flex flex-col items-center text-center",
                  index > 0 && "border-t-0 md:border-t md:border-l-0",
                  tier.highlighted && "bg-brand-dark-blue text-white border-brand-dark-blue"
                )}>
                  <Award className={cn("h-8 w-8 mb-4", tier.highlighted ? "text-brand-sky-blue" : "text-brand-dark-blue/60")} />
                  <h3 className={cn("text-lg font-semibold mb-2", tier.highlighted ? "text-white" : "text-brand-dark-blue")}>
                    {tier.name}
                  </h3>
                  <p className={cn("text-sm leading-relaxed", tier.highlighted ? "text-blue-100" : "text-muted-foreground")}>
                    {tier.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Evaluation Criteria */}
      <section className="w-full py-24 md:py-32 bg-brand-dark-blue text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 px-4">
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight mb-4">
                Evaluation Criteria
              </h2>
              <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
                ACFI evaluates firms across six key dimensions to determine
                certification eligibility and tier placement.
              </p>
            </div>
          </FadeIn>

          <div className="flex flex-col md:flex-row">
            {evaluationCriteria.slice(0, 3).map((criterion, index) => {
              const Icon = criterion.icon;
              return (
                <FadeIn key={criterion.title} delay={index * 100} className="flex-1">
                  <div className={cn(
                    "border border-white/15 p-8 h-full flex flex-col",
                    index > 0 && "border-t-0 md:border-t md:border-l-0"
                  )}>
                    <Icon className="h-6 w-6 text-brand-sky-blue mb-4" />
                    <h4 className="text-lg font-semibold mb-2">{criterion.title}</h4>
                    <p className="text-blue-100 text-sm leading-relaxed">{criterion.description}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
          <div className="flex flex-col md:flex-row">
            {evaluationCriteria.slice(3, 6).map((criterion, index) => {
              const Icon = criterion.icon;
              return (
                <FadeIn key={criterion.title} delay={(index + 3) * 100} className="flex-1">
                  <div className={cn(
                    "border border-white/15 border-t-0 p-8 h-full flex flex-col",
                    index > 0 && "md:border-l-0"
                  )}>
                    <Icon className="h-6 w-6 text-brand-sky-blue mb-4" />
                    <h4 className="text-lg font-semibold mb-2">{criterion.title}</h4>
                    <p className="text-blue-100 text-sm leading-relaxed">{criterion.description}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 4 — Assessment Findings */}
      <section className="w-full py-24 md:py-32 bg-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 px-4">
              <h2 className="text-3xl md:text-4xl font-normal text-brand-dark-blue font-heading tracking-tight mb-4">
                Assessment Findings
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Based on ACFI's comprehensive review, Nobridge has been
                awarded Gold Certification reflecting the following strengths.
              </p>
            </div>
          </FadeIn>

          <div className="flex flex-col">
            {assessmentFindings.map((finding, index) => (
              <FadeIn key={index} delay={index * 80}>
                <div className={cn(
                  "border border-brand-dark-blue/10 p-6 flex items-start gap-4",
                  index > 0 && "border-t-0"
                )}>
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-brand-dark-blue/80 leading-relaxed">{finding}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — Code of Ethics */}
      <section className="w-full py-24 md:py-32 bg-brand-light-gray/30 section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 px-4">
              <h2 className="text-3xl md:text-4xl font-normal text-brand-dark-blue font-heading tracking-tight mb-4">
                Code of Ethics
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                As an ACFI Gold Certified firm, Nobridge is bound by the ACFI
                Code of Ethics, upholding the highest standards of
                professional conduct.
              </p>
            </div>
          </FadeIn>

          <div className="flex flex-col md:flex-row">
            {ethicsCommitments.slice(0, 3).map((commitment, index) => (
              <FadeIn key={commitment.title} delay={index * 100} className="flex-1">
                <div className={cn(
                  "border border-brand-dark-blue/10 bg-white p-8 h-full flex flex-col",
                  index > 0 && "border-t-0 md:border-t md:border-l-0"
                )}>
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="h-5 w-5 text-brand-dark-blue" />
                    <h4 className="text-lg font-semibold text-brand-dark-blue">{commitment.title}</h4>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{commitment.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="flex flex-col md:flex-row">
            {ethicsCommitments.slice(3, 6).map((commitment, index) => (
              <FadeIn key={commitment.title} delay={(index + 3) * 100} className="flex-1">
                <div className={cn(
                  "border border-brand-dark-blue/10 bg-white border-t-0 p-8 h-full flex flex-col",
                  index > 0 && "md:border-l-0"
                )}>
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="h-5 w-5 text-brand-dark-blue" />
                    <h4 className="text-lg font-semibold text-brand-dark-blue">{commitment.title}</h4>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{commitment.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — CTA */}
      <div className="border-t border-brand-dark-blue/10" />
      <section className="w-full py-12 md:py-12 bg-brand-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="relative border border-brand-dark-blue/10 bg-brand-dark-blue/5 py-36 md:py-48 px-8 md:px-16 text-center overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-brand-dark-blue mb-4 font-heading">
                  Verify Our Certification
                </h2>
                <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-10 text-center">
                  Confirm Nobridge's Gold Certified status directly through the ACFI
                  directory, or get in touch with our team to learn more.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <a
                    href="https://acfi.asia/directory/nobridge"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 h-11 py-3 px-12 text-base transition-colors"
                  >
                    Verify on ACFI Directory
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium border border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue/5 h-11 py-3 px-8 text-base transition-colors"
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
