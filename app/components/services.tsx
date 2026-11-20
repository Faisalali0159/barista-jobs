import { Icon } from "./icons";
import type { SiteContent } from "@/lib/content-types";

export default function Services({ content }: { content: SiteContent }) {
  const { servicesSection: sec } = content;
  const services = content.services.filter((x) => x.visible && x.title);
  return (
    <section id="services" className="py-20 sm:py-28 bg-[var(--gray-50)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-orange uppercase tracking-wider mb-3">
            {sec.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
            {sec.title}
          </h2>
          <p className="text-lg text-[var(--gray-500)] max-w-2xl mx-auto">
            {sec.subtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-[var(--gray-100)] hover:border-orange/20 hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-orange/10 text-orange rounded-xl flex items-center justify-center mb-5 group-hover:bg-orange group-hover:text-white transition-colors duration-300">
                <Icon name={service.icon} />
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">
                {service.title}
              </h3>
              <p className="text-[var(--gray-500)] leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
