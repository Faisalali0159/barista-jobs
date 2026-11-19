"use client";

import { useState } from "react";

export default function JobSeekerForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/job-seekers", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to submit");
    }
  }

  return (
    <section id="job-seekers" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-28">
            <span className="inline-block text-sm font-semibold text-orange uppercase tracking-wider mb-3">
              For Job Seekers
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              Looking for a Job?
            </h2>
            <p className="text-lg text-[var(--gray-500)] mb-8">
              Join our network of professional baristas. Fill out the form and
              we&apos;ll connect you with the best coffee businesses in your
              city.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange/10 text-orange flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-[var(--gray-600)]">Get matched with top coffee shops, restaurants, and hotels</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange/10 text-orange flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-[var(--gray-600)]">Free registration — no fees for job seekers</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange/10 text-orange flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-[var(--gray-600)]">Support and training opportunities available</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--gray-50)] rounded-2xl p-6 sm:p-8 border border-[var(--gray-100)]">
            {status === "success" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">Application Submitted!</h3>
                <p className="text-[var(--gray-500)]">We&apos;ll review your application and get back to you soon.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-orange hover:text-orange-dark font-medium"
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-xl font-bold text-navy mb-2">Application Form</h3>

                <div>
                  <label htmlFor="js-name" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    id="js-name"
                    name="fullName"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="js-phone" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    id="js-phone"
                    name="phone"
                    type="tel"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                    placeholder="+252 61 XXXXXXX"
                  />
                </div>

                <div>
                  <label htmlFor="js-city" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    City *
                  </label>
                  <input
                    id="js-city"
                    name="city"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                    placeholder="e.g. Mogadishu, Hargeisa"
                  />
                </div>

                <div>
                  <label htmlFor="js-position" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    Position Applying For *
                  </label>
                  <select
                    id="js-position"
                    name="position"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                  >
                    <option value="">Select a position</option>
                    <option value="Barista">Barista</option>
                    <option value="Senior Barista">Senior Barista</option>
                    <option value="Head Barista">Head Barista</option>
                    <option value="Barista Trainer">Barista Trainer</option>
                    <option value="Coffee Shop Manager">Coffee Shop Manager</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="js-experience" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    Experience *
                  </label>
                  <select
                    id="js-experience"
                    name="experience"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                  >
                    <option value="">Select your experience</option>
                    <option value="No experience">No experience</option>
                    <option value="Less than 1 year">Less than 1 year</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="js-cv" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    Upload CV
                  </label>
                  <input
                    id="js-cv"
                    name="cv"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange/10 file:text-orange hover:file:bg-orange/20 focus:outline-none focus:ring-2 focus:ring-orange/50 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="js-photo" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    Photo
                  </label>
                  <input
                    id="js-photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange/10 file:text-orange hover:file:bg-orange/20 focus:outline-none focus:ring-2 focus:ring-orange/50 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="js-message" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    Additional Information
                  </label>
                  <textarea
                    id="js-message"
                    name="message"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors resize-none"
                    placeholder="Tell us more about yourself..."
                  />
                </div>

                {status === "error" && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3.5 bg-orange hover:bg-orange-dark text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-orange/25 hover:shadow-orange/40 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
