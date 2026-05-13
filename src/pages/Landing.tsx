import "@website/site.css";
import { Navbar } from "@website/components/site/Navbar";
import { Hero } from "@website/components/site/Hero";
import { Features } from "@website/components/site/Features";
import { Sports } from "@website/components/site/Sports";
import { Showcase } from "@website/components/site/Showcase";
import { Pricing } from "@website/components/site/Pricing";
import { CTA } from "@website/components/site/CTA";
import { Footer } from "@website/components/site/Footer";
import { WhatsappButton } from "@website/components/site/WhatsappButton";

const Landing = () => (
  <div className="forgame-site">
    <Navbar />
    <Hero />
    <Features />
    <Sports />
    <Showcase />
    <Pricing />
    <CTA />
    <Footer />
    <WhatsappButton />
  </div>
);

export default Landing;
