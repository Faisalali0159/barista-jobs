import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative bg-navy min-h-[600px] flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-orange rounded-full animate-pulse" />
              <span className="text-sm text-white/80">
                Now hiring across Somalia
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Welcome to{" "}
              <span className="text-orange">Barista Job&apos;s</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-lg mx-auto lg:mx-0">
              We provide skilled Baristas, training, and professional services
              for Coffee Shops, Restaurants, Hotels, and other businesses.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#job-seekers"
                className="inline-flex items-center justify-center px-8 py-4 bg-orange hover:bg-orange-dark text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-orange/25 hover:shadow-orange/40 hover:-translate-y-0.5"
              >
                Looking for a Job?
              </a>
              <a
                href="#employers"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 border border-white/20"
              >
                Need Staff?
              </a>
            </div>

            <div className="mt-10 flex items-center gap-8 justify-center lg:justify-start">
              <div>
                <div className="text-2xl font-bold text-orange">500+</div>
                <div className="text-sm text-white/60">Baristas Placed</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-2xl font-bold text-orange">100+</div>
                <div className="text-sm text-white/60">Partner Businesses</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-2xl font-bold text-orange">6</div>
                <div className="text-sm text-white/60">Expert Services</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-gradient-to-br from-orange/20 to-orange/5 rounded-full flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Barista Job's"
                  width={280}
                  height={280}
                  className="w-64 h-64 object-contain drop-shadow-2xl"
                  priority
                />
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange/20 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
