import Navbar from "./components/landing/Navbar";
import Hero from "./components/landing/Hero";
import TrustedLogos from "./components/landing/TrustedLogos";
import FeaturesSection from "./components/landing/FeaturesSection";
import HowItWorksSection from "./components/landing/HowItWorksSection";
import ThreatDashboard from "./components/landing/ThreatDashboard";
import Statistics from "./components/landing/Statistics";
import TestimonialsSection from "./components/landing/TestimonialsSection";
import PricingSection from "./components/landing/PricingSection";
import FAQSection from "./components/landing/FAQSection";
import MobileAppCTA from "./components/landing/MobileAppCTA";
import Footer from "./components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#101D36] selection:bg-[#1463FF]/20 selection:text-[#1463FF]">
      {/* Navigation Bar */}
      <Navbar />

      <main>
        {/* Hero Section */}
        <Hero />

        {/* Trusted By Organizations */}
        <TrustedLogos />

        {/* Feature Cards Grid */}
        <FeaturesSection />

        {/* How It Works Workflow */}
        <HowItWorksSection />

        {/* Real-Time Protection Split Section */}
        <ThreatDashboard />

        {/* Platform Statistics */}
        <Statistics />

        {/* Customer Testimonials */}
        <TestimonialsSection />

        {/* Pricing Plans */}
        <PricingSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Mobile Application CTA */}
        <MobileAppCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
