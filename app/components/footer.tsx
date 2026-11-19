import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white/70 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="Barista Job's"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div>
                <div className="text-white font-bold">BARISTA JOB&apos;S</div>
                <div className="text-xs text-orange">
                  Great Barista, Better Business
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Connecting skilled baristas with the best coffee businesses across
              Somalia.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#services" className="hover:text-orange transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#job-seekers" className="hover:text-orange transition-colors">
                  Find a Job
                </a>
              </li>
              <li>
                <a href="#employers" className="hover:text-orange transition-colors">
                  Hire Staff
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-orange transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>Barista Supply</li>
              <li>Barista Training</li>
              <li>Customer Service Training</li>
              <li>Coffee Shop Consultation</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-white/50">Job Seekers:</span>
                <br />
                WhatsApp: 618270011
              </li>
              <li>
                <span className="text-white/50">Businesses:</span>
                <br />
                Call/WhatsApp: +252 61 6983751
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 text-center text-sm">
          &copy; 2024 Barista Job&apos;s. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
