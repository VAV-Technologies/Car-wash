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
} from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { Card, CardContent } from "@/components/ui/card";

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
      <section className="w-full min-h-[60vh] bg-brand-dark-blue flex items-center py-24 text-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <FadeIn direction="up" delay={200} className="text-center space-y-6">
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
      <section className="w-full py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <FadeIn direction="up">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-6">
                <h2 className="text-3xl md:text-5xl font-normal text-brand-dark-blue font-heading tracking-tight">
                  Certification Overview
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-justify">
                  The Asia Corporate Finance Institute (ACFI) is an
                  industry body that sets professional standards for corporate
                  finance and M&A advisory firms operating across Asia. ACFI
                  certification signals to clients, partners, and regulators that
                  a firm meets rigorous benchmarks for professional competence,
                  ethical conduct, and transaction quality.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {certificationTiers.map((tier) => (
                  <Card
                    key={tier.name}
                    className={
                      tier.highlighted
                        ? "border-2 border-brand-dark-blue bg-brand-dark-blue text-white shadow-lg"
                        : "border border-gray-200"
                    }
                  >
                    <CardContent className="pt-6 text-center space-y-3">
                      <Award
                        className={`h-8 w-8 mx-auto ${tier.highlighted ? "text-brand-sky-blue" : "text-brand-dark-blue/60"}`}
                      />
                      <h3
                        className={`text-lg font-semibold ${tier.highlighted ? "text-white" : "text-brand-dark-blue"}`}
                      >
                        {tier.name}
                      </h3>
                      <p
                        className={`text-sm leading-relaxed ${tier.highlighted ? "text-blue-100" : "text-muted-foreground"}`}
                      >
                        {tier.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section 3 — Evaluation Criteria */}
      <section className="w-full py-24 md:py-32 bg-brand-dark-blue text-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-5xl font-normal text-center font-heading tracking-tight mb-4">
              Evaluation Criteria
            </h2>
            <p className="text-lg text-blue-100 text-center max-w-3xl mx-auto mb-16">
              ACFI evaluates firms across six key dimensions to determine
              certification eligibility and tier placement.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {evaluationCriteria.map((criterion, index) => {
                const Icon = criterion.icon;
                return (
                  <FadeIn key={criterion.title} delay={index * 100}>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 bg-brand-sky-blue/15 p-3 rounded-full">
                        <Icon className="h-6 w-6 text-brand-sky-blue" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold mb-2">
                          {criterion.title}
                        </h4>
                        <p className="text-blue-100 text-sm leading-relaxed">
                          {criterion.description}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section 4 — Report Summary */}
      <section className="w-full py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <FadeIn direction="up">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-5xl font-normal text-brand-dark-blue font-heading tracking-tight">
                  Assessment Findings
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Based on ACFI's comprehensive review, Nobridge has been
                  awarded Gold Certification reflecting the following strengths.
                </p>
              </div>

              <div className="space-y-4">
                {assessmentFindings.map((finding, index) => (
                  <FadeIn key={index} delay={index * 80}>
                    <div className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:border-brand-dark-blue/20 transition-colors">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-brand-dark-blue/80 leading-relaxed">
                        {finding}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section 5 — Code of Ethics */}
      <section className="w-full py-24 md:py-32 bg-brand-light-gray/30">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <FadeIn direction="up">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-5xl font-normal text-brand-dark-blue font-heading tracking-tight">
                  Code of Ethics
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  As an ACFI Gold Certified firm, Nobridge is bound by the ACFI
                  Code of Ethics, upholding the highest standards of
                  professional conduct.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {ethicsCommitments.map((commitment, index) => (
                  <FadeIn key={commitment.title} delay={index * 100}>
                    <Card className="border border-gray-200 h-full">
                      <CardContent className="pt-6 space-y-2">
                        <div className="flex items-center space-x-3">
                          <ShieldCheck className="h-5 w-5 text-brand-dark-blue" />
                          <h4 className="text-lg font-semibold text-brand-dark-blue">
                            {commitment.title}
                          </h4>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {commitment.description}
                        </p>
                      </CardContent>
                    </Card>
                  </FadeIn>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section 6 — CTA */}
      <section className="w-full py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 text-center">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-4xl font-normal text-brand-dark-blue font-heading mb-4">
              Verify Our Certification
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Confirm Nobridge's Gold Certified status directly through the ACFI
              directory, or get in touch with our team to learn more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://acfi.asia/directory/nobridge"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-normal text-white bg-brand-dark-blue hover:bg-brand-dark-blue/90 rounded-md transition-colors"
              >
                <ShieldCheck className="mr-2 h-5 w-5" />
                Verify on ACFI Directory
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-normal text-brand-dark-blue bg-white border-2 border-brand-dark-blue hover:bg-brand-light-gray rounded-md transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
