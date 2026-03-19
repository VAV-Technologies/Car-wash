import { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Coverage Area",
  description:
    "Castudio serves all of JABODETABEK with zone-based scheduling. Jakarta, Bogor, Depok, Tangerang, and Bekasi — check your zone day and book your premium mobile car wash.",
};

const zones = [
  {
    day: "Monday",
    zone: "South Zone",
    areas:
      "Jakarta Selatan, Depok, Cinere, Pondok Indah, Cilandak, Lebak Bulus, Fatmawati",
  },
  {
    day: "Tuesday",
    zone: "West Zone",
    areas:
      "Jakarta Barat, Tangerang, BSD City, Alam Sutera, Gading Serpong, Karawaci",
  },
  {
    day: "Wednesday",
    zone: "Central & North Zone",
    areas:
      "Jakarta Pusat, Jakarta Utara, Kelapa Gading, Menteng, Sudirman, Thamrin",
  },
  {
    day: "Thursday",
    zone: "East Zone",
    areas:
      "Bekasi, Jakarta Timur, Cibubur, Jatibening, Pondok Gede, Rawalumbu",
  },
  {
    day: "Friday",
    zone: "Flex Zone",
    areas:
      "Open to all areas. Priority for Elite bookings and subscription clients.",
  },
  {
    day: "Saturday",
    zone: "Premium Only",
    areas:
      "Half-day availability for Elite washes and overflow.",
  },
];

const howItWorks = [
  {
    title: "Why zones?",
    body: "Clustering reduces travel time from 35\u201345 minutes to 15\u201325 minutes between appointments. That means more time spent on your car and less time stuck in traffic.",
  },
  {
    title: "Subscription clients",
    body: "You are assigned to your zone day for recurring appointments. Same day, same time, every week or month.",
  },
  {
    title: "Flexibility",
    body: "Need a different day? Message us. Friday is our flex day, and we accommodate where possible.",
  },
];

export default function CoveragePage() {
  return (
    <div className="bg-brand-black">
      {/* Hero */}
      <section className="w-full min-h-[50vh] flex items-center justify-center bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={200}>
            <div className="text-center space-y-6 px-4">
              <p className="text-brand-orange text-sm md:text-base font-medium uppercase tracking-widest">
                Coverage Area
              </p>
              <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                We Cover All of JABODETABEK
              </h1>
              <p className="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto">
                Jakarta, Bogor, Depok, Tangerang, and Bekasi. We serve specific
                zones on specific days to ensure prompt service and minimal wait
                times.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Zone Schedule */}
      <div className="border-t border-white/10" />
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="flex items-center gap-4 mb-12">
              <MapPin className="h-8 w-8 text-brand-orange" />
              <h2 className="text-2xl md:text-3xl font-normal text-white font-heading">
                Zone Schedule
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {zones.map((zone, index) => (
              <FadeIn key={zone.day} delay={index * 80}>
                <div className="border border-white/10 p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                    <span className="text-white font-bold text-lg md:min-w-[120px]">
                      {zone.day}
                    </span>
                    <span className="text-brand-orange font-medium md:min-w-[200px]">
                      {zone.zone}
                    </span>
                    <span className="text-white/60">{zone.areas}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How Zone Scheduling Works */}
      <div className="border-t border-white/10" />
      <section className="w-full py-20 md:py-24 bg-brand-black section-lines-dark">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <h2 className="text-2xl md:text-3xl font-normal text-white font-heading mb-12">
              How Zone Scheduling Works
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {howItWorks.map((item, index) => (
              <FadeIn key={item.title} delay={index * 100}>
                <div className="border border-white/10 p-8 h-full">
                  <h3 className="text-white font-bold text-lg mb-4">
                    {item.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">{item.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Don't see your area? */}
      <div className="border-t border-white/10" />
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-normal text-white font-heading mb-6">
                Don&apos;t see your area listed?
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-10">
                Message us on WhatsApp and we&apos;ll check if we can reach you.
                We&apos;re expanding coverage regularly.
              </p>
              <Link
                href="https://wa.me/62816104334?text=Halo%2C%20saya%20ingin%20cek%20apakah%20area%20saya%20tercover."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-12 text-base transition-colors"
              >
                Check My Area
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
