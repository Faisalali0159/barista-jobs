import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Services from "./components/services";
import JobSeekerForm from "./components/job-seeker-form";
import EmployerForm from "./components/employer-form";
import Contact from "./components/contact";
import Footer from "./components/footer";
import { getSiteContent } from "@/lib/content";

export default async function Home() {
  const content = await getSiteContent();
  const serviceNames = content.services.filter((s) => s.visible && s.title).map((s) => s.title);

  return (
    <div className="min-h-screen">
      {content.announcement.enabled && content.announcement.text && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-orange text-navy-dark text-center text-sm font-medium px-4 py-2">
          {content.announcement.text}
        </div>
      )}
      <Navbar siteName={content.siteName} tagline={content.tagline} />
      <Hero content={content} />
      <Services content={content} />
      <JobSeekerForm options={content.forms} open={content.forms.jobSeekersOpen} />
      <EmployerForm
        options={content.forms}
        serviceNames={serviceNames}
        open={content.forms.employersOpen}
      />
      <Contact content={content} />
      <Footer content={content} />
    </div>
  );
}
