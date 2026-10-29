import TestimonialCard from "./TestimonialCard";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Student, PIEMR",
      quote: "AV-SAFE has helped me avoid multiple phishing attempts. It's fast, accurate and super easy to use!",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
      initials: "PS",
      rating: 5,
    },
    {
      name: "Rahul Verma",
      role: "Software Developer",
      quote: "The detailed analysis and clear explanations make it highly recommended!",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
      initials: "RV",
      rating: 5,
    },
    {
      name: "Amit Malhotra",
      role: "IT Manager",
      quote: "We use AV-SAFE in our organization to keep our team safe from email threats. It's reliable and powerful.",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
      initials: "AM",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 lg:py-24 bg-white border-t border-[#E5ECF5]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header Centered */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F6FE] border border-[#E5ECF5] px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase text-[#1463FF] mb-4">
            TESTIMONIALS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101D36]">
            Trusted by Users Everywhere
          </h2>
        </div>

        {/* 3 Testimonials in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>

      </div>
    </section>
  );
}
