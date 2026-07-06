import { Hero } from "@/components/marketing/hero";
import { MarketingNav } from "@/components/marketing/nav";
import { Previews } from "@/components/marketing/previews";
import {
  About,
  ComingSoon,
  Faq,
  FooterCta,
  HowItWorks,
  Marquee,
  Pricing,
} from "@/components/marketing/sections";

export default function Home() {
  return (
    <div className="flex flex-col">
      <MarketingNav />
      <main>
        <Hero />
        <Previews />
        <Marquee />
        <About />
        <HowItWorks />
        <Pricing />
        <ComingSoon />
        <Faq />
        <FooterCta />
      </main>
    </div>
  );
}
