import Image from "next/image";
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Services from "./components/services";
import JobSeekerForm from "./components/job-seeker-form";
import EmployerForm from "./components/employer-form";
import Contact from "./components/contact";
import Footer from "./components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <JobSeekerForm />
      <EmployerForm />
      <Contact />
      <Footer />
    </div>
  );
}
