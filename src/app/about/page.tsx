import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

const values = [
  {
    num: "01",
    title: "Confidentiality first, always",
    body: "Every engagement begins with strict confidentiality protocols. Anonymous teasers, NDA-gated information flow, and controlled buyer access ensure your business and your intentions are never exposed prematurely.",
  },
  {
    num: "02",
    title: "Aligned incentives, no exceptions",
    body: "We succeed when you do. Our success-fee model means we are only compensated when a transaction closes, eliminating any incentive to rush, inflate, or misrepresent a deal.",
  },
  {
    num: "03",
    title: "Regional depth, global reach",
    body: "We are not a global firm applying a generic playbook to Asia. We are a regional firm with deep cultural fluency, regulatory knowledge, and local relationships, connected to a global buyer network.",
  },
  {
    num: "04",
    title: "Process over improvisation",
    body: "Every deal follows a disciplined, repeatable process from initial positioning through final close. Our structured approach reduces execution risk, keeps timelines on track, and protects both parties throughout.",
  },
  {
    num: "05",
    title: "Technology as an advantage",
    body: "As an AI-enabled firm, we move faster and cover more ground than traditional advisory. Technology gives us the ability to reach more qualified buyers, manage larger pipelines, and deliver better market coverage without compromising on quality.",
  },
  {
    num: "06",
    title: "Honest counsel, not flattery",
    body: "We tell clients what they need to hear, not what they want to hear. If a business isn't ready for market, we say so and we help fix it. Our reputation depends on deals that close, not engagements that start.",
  },
];

const team = [
  {
    name: "Vilca",
    role: "Founder and Managing Director",
    bio: "Leads business development, deal origination, and client advisory across Nobridge's Asian engagements. Specialises in sell-side mandates for SMEs in consumer, industrial, and services sectors.",
    tags: ["Asia", "Sell-Side", "Deal Origination", "Client Advisory"],
  },
  {
    name: "Advisory Team",
    role: "Deal Execution and Due Diligence",
    bio: "Experienced deal professionals managing CIM preparation, buyer coordination, financial analysis, and transaction structuring from LOI through close.",
    tags: ["Financial Analysis", "Due Diligence", "Structuring"],
  },
  {
    name: "Network Partners",
    role: "Legal, Tax and Cross-Border",
    bio: "A trusted network of legal, tax, and regulatory advisors across Asia who integrate into our deal teams on every transaction.",
    tags: ["Legal", "Tax Advisory", "Cross-Border", "Regulatory"],
  },
];

const steps = [
  {
    num: "01",
    title: "We prepare before we go to market",
    body: "A business that isn't positioned well won't attract the right buyers, regardless of how good the outreach is. We invest time upfront in valuation, financial normalisation, and narrative so that when we go to market, we go with conviction.",
  },
  {
    num: "02",
    title: "We reach the right buyers at scale",
    body: "Being AI-enabled means we can cover the market more thoroughly than any traditional firm. We identify and prioritise the specific buyers, strategic acquirers, holding companies, family offices, and PE funds, most likely to close on a given opportunity.",
  },
  {
    num: "03",
    title: "We manage the process end-to-end",
    body: "Owners shouldn't have to become M&A experts to execute a good exit. We run the process, coordinating buyers, managing information flow, and navigating due diligence, so you stay focused on the business.",
  },
  {
    num: "04",
    title: "We stay at the table through close",
    body: "Many deals fall apart between LOI and close. We stay deeply involved through due diligence, legal negotiation, and final sign-off, protecting your interests and keeping momentum when it matters most.",
  },
];

const regions = [
  { region: "Asia", sub: "Our home market with deep operational presence and local expertise across the region", type: "Primary Market" },
  { region: "Asia-Pacific", sub: "Extended network of strategic buyers, PE firms, and family offices", type: "Secondary Market" },
  { region: "Europe", sub: "Active acquirer network across the UK, Western and Northern Europe", type: "Acquirer Network" },
  { region: "North America", sub: "PE funds, family offices, and strategic buyers seeking Asian exposure", type: "Acquirer Network" },
];

const buyerTypes = [
  "Strategic Acquirers",
  "PE Funds",
  "Family Offices",
  "Holding Companies",
  "Search Funds",
  "Independent Sponsors",
  "HNW Individuals",
  "Aggregators",
];

const techBullets = [
  "Broader buyer coverage than traditional firms",
  "Faster time from mandate to market",
  "Real-time pipeline tracking and reporting",
  "Multi-market reach across multiple regions",
  "Efficient CIM and teaser distribution",
  "Data-driven engagement and follow-up",
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* ── 1. Hero ── */}
      <section className="w-full min-h-[60vh] bg-brand-dark-blue flex items-center py-24 text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={200} className="text-center space-y-6 px-4 max-w-4xl mx-auto">
            <p className="text-sm uppercase tracking-wider text-brand-sky-blue font-heading">
              About Nobridge
            </p>
            <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
              We exist because this market deserved a better firm.
            </h1>
            <p className="text-lg md:text-xl text-blue-100 font-light max-w-3xl mx-auto leading-relaxed">
              Nobridge was built to serve the businesses that global advisory firms overlook and local brokers can&apos;t properly represent. Asian SMEs with real value, real businesses, and no real exit path. Until now.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="border-t border-brand-dark-blue/10" />

      {/* ── 2. Our Origin ── */}
      <section className="w-full py-20 md:py-24 bg-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-sky-blue mb-3 font-heading">
                Our Origin
              </p>
              <h2 className="text-3xl md:text-4xl font-normal text-brand-dark-blue font-heading tracking-tight">
                Built from a gap no one was filling
              </h2>
            </div>
          </FadeIn>

          {/* Full-width image above content */}
          <FadeIn delay={50}>
            <div className="border border-brand-dark-blue/10 overflow-hidden">
              <div
                className="w-full h-[28rem] md:h-[36rem] bg-brand-dark-blue/5 flex items-center justify-center"
                data-ai-hint="office team meeting"
              >
                <span className="text-sm text-muted-foreground">Image placeholder</span>
              </div>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row">
            {/* Left column: paragraphs */}
            <FadeIn delay={100} className="flex-1">
              <div className="border border-brand-dark-blue/10 border-t-0 p-8 md:p-10 h-full space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  The M&amp;A advisory industry has a blind spot. Global firms won&apos;t touch deals under $100M. Local brokers lack the buyer networks, process discipline, and cross-border capability to execute with any consistency. The middle market in Asia was and largely still is underserved.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Nobridge was founded to fix that. We built an advisory firm specifically for Asian SMEs doing between $2M and $50M in enterprise value. Businesses with strong fundamentals, loyal customers, and owners ready for their next chapter.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We combine the rigour of institutional M&amp;A with the speed and access that only a technology-enabled, regionally-embedded firm can offer. The result is faster deals, better outcomes, and a market that finally works for the businesses that power this region&apos;s economy.
                </p>
              </div>
            </FadeIn>

            {/* Right column: pull quote + metrics */}
            <FadeIn delay={200} className="flex-1">
              <div className="border border-brand-dark-blue/10 border-t-0 lg:border-l-0 p-8 md:p-10 h-full flex flex-col justify-between">
                {/* Pull quote */}
                <div className="border-l-2 border-brand-sky-blue pl-6 mb-8">
                  <p className="text-xl md:text-2xl font-heading text-brand-dark-blue leading-snug mb-3">
                    &ldquo;The SMEs that built Asia deserve an exit process that respects what they&apos;ve built.&rdquo;
                  </p>
                  <p className="text-sm text-muted-foreground">Nobridge Founding Team</p>
                </div>

                {/* 2x2 metrics grid */}
                <div className="grid grid-cols-2">
                  {[
                    { value: "$2M", label: "Minimum deal size" },
                    { value: "$50M", label: "Maximum deal size" },
                    { value: "APAC", label: "Primary markets" },
                    { value: "AI", label: "Enabled infrastructure" },
                  ].map((metric, index) => (
                    <div
                      key={metric.value}
                      className={cn(
                        "border border-brand-dark-blue/10 p-5 text-center",
                        index === 1 && "border-l-0",
                        index === 2 && "border-t-0",
                        index === 3 && "border-t-0 border-l-0"
                      )}
                    >
                      <p className="text-2xl md:text-3xl font-heading text-brand-dark-blue mb-1">{metric.value}</p>
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="border-t border-brand-dark-blue/10" />

      {/* ── 3. What We Stand For ── */}
      <section className="w-full py-20 md:py-24 bg-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-sky-blue mb-3 font-heading">
                What We Stand For
              </p>
              <h2 className="text-3xl md:text-4xl font-normal text-brand-dark-blue font-heading tracking-tight mb-4">
                The principles that guide every engagement
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
                M&amp;A is a high-stakes, high-trust business. The principles we operate by aren&apos;t marketing. They&apos;re the reason clients come back and refer others.
              </p>
            </div>
          </FadeIn>

          {/* Row 1: cards 01-03 */}
          <div className="flex flex-col md:flex-row">
            {values.slice(0, 3).map((card, index) => (
              <FadeIn key={card.num} delay={index * 100} className="flex-1">
                <div className={cn(
                  "border border-brand-dark-blue/10 p-8 h-full flex flex-col",
                  index > 0 && "border-t-0 md:border-t md:border-l-0"
                )}>
                  <span className="text-sm font-heading text-brand-sky-blue mb-4">{card.num}</span>
                  <h4 className="text-lg font-medium text-brand-dark-blue mb-2">{card.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{card.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Row 2: cards 04-06 */}
          <div className="flex flex-col md:flex-row">
            {values.slice(3, 6).map((card, index) => (
              <FadeIn key={card.num} delay={(index + 3) * 100} className="flex-1">
                <div className={cn(
                  "border border-brand-dark-blue/10 border-t-0 p-8 h-full flex flex-col",
                  index > 0 && "md:border-l-0"
                )}>
                  <span className="text-sm font-heading text-brand-sky-blue mb-4">{card.num}</span>
                  <h4 className="text-lg font-medium text-brand-dark-blue mb-2">{card.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{card.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="border-t border-brand-dark-blue/10" />

      {/* ── 4. The Team ── */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-blue text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center space-y-4 mb-16 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-sky-blue font-heading">
                The Team
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight">
                Practitioners, not intermediaries
              </h2>
              <p className="text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Our team has operated businesses, structured deals, and navigated the specific complexities of Asian markets. We advise from experience, not theory.
              </p>
            </div>
          </FadeIn>

          <div className="flex flex-col md:flex-row">
            {team.map((member, index) => (
              <FadeIn key={member.name} delay={index * 100} className="flex-1">
                <div className={cn(
                  "border border-white/15 h-full flex flex-col",
                  index > 0 && "border-t-0 md:border-t md:border-l-0"
                )}>
                  {/* Image placeholder */}
                  <div
                    className="aspect-[3/2.5] bg-white/5 flex items-center justify-center"
                    data-ai-hint="professional headshot"
                  >
                    <span className="text-sm text-white/30">Photo</span>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h4 className="text-lg font-heading">{member.name}</h4>
                    <p className="text-sm text-brand-sky-blue mb-3">{member.role}</p>
                    <p className="text-blue-100/80 text-sm leading-relaxed mb-4 flex-grow">{member.bio}</p>
                    <div className="border-t border-white/15 pt-4 flex flex-wrap gap-2">
                      {member.tags.map((tag) => (
                        <span key={tag} className="text-xs px-3 py-1 border border-white/15 text-white/70">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="border-t border-brand-dark-blue/10" />

      {/* ── 5. Our Approach ── */}
      <section className="w-full py-20 md:py-24 bg-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-sky-blue mb-3 font-heading">
                Our Approach
              </p>
              <h2 className="text-3xl md:text-4xl font-normal text-brand-dark-blue font-heading tracking-tight">
                How we think about every deal
              </h2>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-0">
            {/* Left: Steps */}
            <div className="flex-1">
              {steps.map((step, index) => (
                <FadeIn key={step.num} delay={index * 100}>
                  <div className={cn(
                    "border border-brand-dark-blue/10 p-8 md:p-10 flex items-start gap-8",
                    index > 0 && "border-t-0"
                  )}>
                    <span className="text-5xl md:text-6xl font-heading font-medium text-brand-dark-blue/10 leading-none shrink-0">
                      {step.num}
                    </span>
                    <div>
                      <h3 className="text-lg font-normal text-brand-dark-blue font-heading mb-2">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Right: Sticky Technology Edge card */}
            <FadeIn delay={200} className="lg:w-[400px] xl:w-[440px]">
              <div className="border border-brand-dark-blue/10 border-t-0 lg:border-t lg:border-l-0 bg-brand-dark-blue text-white p-8 md:p-10 sticky top-24 h-fit">
                <p className="text-sm uppercase tracking-wider text-brand-sky-blue mb-3 font-heading">
                  Technology Edge
                </p>
                <h3 className="text-xl font-heading mb-4">
                  Better coverage, faster execution
                </h3>
                <p className="text-blue-100/80 leading-relaxed mb-6 text-sm">
                  As an AI-enabled firm, we deliver the market coverage and execution speed that traditional advisory simply cannot match. Our technology infrastructure lets us reach more buyers, manage more opportunities, and move deals forward faster.
                </p>
                <ul className="space-y-3">
                  {techBullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm text-blue-100/80">
                      <span className="text-brand-sky-blue mt-1 text-xs">&#x25C6;</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="border-t border-brand-dark-blue/10" />

      {/* ── 6. Where We Operate ── */}
      <section className="w-full py-20 md:py-24 bg-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-sky-blue mb-3 font-heading">
                Where We Operate
              </p>
              <h2 className="text-3xl md:text-4xl font-normal text-brand-dark-blue font-heading tracking-tight">
                Rooted in the region, connected globally
              </h2>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row">
            {/* Left: Region table */}
            <FadeIn delay={100} className="flex-1">
              <div className="border border-brand-dark-blue/10 h-full">
                {regions.map((r, index) => (
                  <div
                    key={r.region}
                    className={cn(
                      "flex items-center gap-4 px-6 py-5",
                      index > 0 && "border-t border-brand-dark-blue/10"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-dark-blue">{r.region}</p>
                      <p className="text-xs text-muted-foreground mt-1">{r.sub}</p>
                    </div>
                    <span className={cn(
                      "text-xs px-3 py-1 border shrink-0",
                      r.type === "Primary Market"
                        ? "border-brand-sky-blue/30 text-brand-sky-blue bg-brand-sky-blue/5"
                        : r.type === "Secondary Market"
                          ? "border-brand-dark-blue/20 text-brand-dark-blue/70 bg-brand-dark-blue/5"
                          : "border-brand-dark-blue/10 text-muted-foreground"
                    )}>
                      {r.type}
                    </span>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Right: Body text */}
            <FadeIn delay={200} className="flex-1">
              <div className="border border-brand-dark-blue/10 border-t-0 lg:border-t lg:border-l-0 p-8 md:p-10 h-full space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Asia is our primary market. We have deep operational presence, local expertise, and cultural fluency across the region, giving our clients an advisory partner that truly understands how business gets done here.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  On the buy side, we connect sellers to a curated network of global acquirers spanning Europe, North America, and the broader Asia-Pacific. Our reach covers strategic buyers, private equity funds, family offices, and high-net-worth individuals actively seeking opportunities in Asia.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The result is a genuinely cross-border deal process, with local expertise on one side and global capital on the other.
                </p>
              </div>
            </FadeIn>
          </div>

          {/* Buyer network tag cloud */}
          <FadeIn delay={300}>
            <div className="border border-brand-dark-blue/10 border-t-0 p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-heading">
                Buyer Types in Our Network
              </p>
              <div className="flex flex-wrap gap-2">
                {buyerTypes.map((type) => (
                  <span key={type} className="text-xs px-3 py-1 border border-brand-dark-blue/10 text-brand-dark-blue/70">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="border-t border-brand-dark-blue/10" />

      {/* ── 7. CTA ── */}
      <section className="w-full py-12 md:py-12 bg-brand-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="border border-brand-dark-blue/10">
              <div className="relative px-8 md:px-16 text-center overflow-hidden" style={{ backgroundImage: 'url(/assets/cta-cityscape-light.png)', backgroundSize: '100% 100%', backgroundPosition: 'center', aspectRatio: '21/9' }}>
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <div className="border border-brand-dark-blue/20 bg-white/50 backdrop-blur-sm px-10 md:px-16 py-10 md:py-14">
                    <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-brand-dark-blue mb-4 font-heading">
                      Ready to start a conversation?
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-10 text-center">
                      Whether you&apos;re considering an exit, looking to acquire in Asia, or want to understand what your business is worth, we start with a confidential, no-obligation conversation.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 h-11 py-3 px-12 text-base transition-colors"
                      >
                        Book a Consultation
                      </Link>
                      <Link
                        href="/marketplace"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium border border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue/5 h-11 py-3 px-8 text-base transition-colors"
                      >
                        Browse the Marketplace
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
