import FAQAccordion from "./FAQAccordion";

export default function FAQSection() {
  const faqItems = [
    {
      question: "What is AV-SAFE and how does it work?",
      answer:
        "AV-SAFE is an AI-powered phishing and threat detection system. It extracts 25 structural signals from URLs and email headers—evaluating entropy, brand lookalikes, SSL status, and DNS records in real time to neutralize threats.",
    },
    {
      question: "Is AV-SAFE free to use?",
      answer:
        "Yes, AV-SAFE offers free instant URL and email scanning for individuals and developers, with enterprise-grade dedicated monitoring consoles available for security teams.",
    },
    {
      question: "Can I use AV-SAFE on mobile devices?",
      answer:
        "Yes! AV-SAFE is available as an Android application with offline QR scanning and link inspection, plus full responsive web support on any smartphone browser.",
    },
    {
      question: "How accurate is the threat detection?",
      answer:
        "Our lightweight on-device logistic regression and heuristic model achieves a 98.7% accuracy benchmark on zero-day phishing datasets without requiring continuous cloud telemetry.",
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-24 bg-white border-t border-[#E5ECF5]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Heading & Subtitle */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#F0F6FE] border border-[#E5ECF5] px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase text-[#1463FF] mb-4">
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101D36] leading-[1.18]">
              Frequently Asked Questions
            </h2>
            <p className="mt-3.5 text-sm sm:text-base text-[#64748B] leading-relaxed max-w-sm">
              Everything you need to know about AV-SAFE.
            </p>
          </div>

          {/* Right Column: 4 Accordion Questions */}
          <div className="lg:col-span-7">
            <FAQAccordion items={faqItems} />
          </div>

        </div>
      </div>
    </section>
  );
}
