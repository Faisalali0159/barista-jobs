"use client";

import { useState } from "react";

export default function EmployerForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/employers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Something went wrong");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to submit");
    }
  }

  return (
    <section id="employers" className="py-20 sm:py-28 bg-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-28 order-1 lg:order-1">
            <span className="inline-block text-sm font-semibold text-orange uppercase tracking-wider mb-3">
              For Businesses
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Need Staff?
            </h2>
            <p className="text-lg text-white/70 mb-8">
              Tell us what you need and we&apos;ll provide the right barista
              talent for your business. Quick, professional, and reliable.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange/20 text-orange flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-white/70">Pre-screened, skilled baristas ready to work</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange/20 text-orange flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-white/70">Fast placement within your city</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange/20 text-orange flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-white/70">Ongoing support and replacement guarantee</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 order-2 lg:order-2">
            {status === "success" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">Request Submitted!</h3>
                <p className="text-[var(--gray-500)]">We&apos;ll contact you soon to discuss your staffing needs.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-orange hover:text-orange-dark font-medium"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-xl font-bold text-navy mb-2">Staff Request Form</h3>

                <div>
                  <label htmlFor="emp-business" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    Business Name *
                  </label>
                  <input
                    id="emp-business"
                    name="businessName"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                    placeholder="Your business name"
                  />
                </div>

                <div>
                  <label htmlFor="emp-contact" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    Contact Person *
                  </label>
                  <input
                    id="emp-contact"
                    name="contactPerson"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="emp-phone" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    id="emp-phone"
                    name="phone"
                    type="tel"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                    placeholder="+252 61 XXXXXXX"
                  />
                </div>

                <div>
                  <label htmlFor="emp-city" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    City *
                  </label>
                  <input
                    id="emp-city"
                    name="city"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                    placeholder="e.g. Mogadishu, Hargeisa"
                  />
                </div>

                <div>
                  <label htmlFor="emp-type" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    Staff Type Needed *
                  </label>
                  <select
                    id="emp-type"
                    name="staffType"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                  >
                    <option value="">Select staff type</option>
                    <option value="Barista">Barista</option>
                    <option value="Senior Barista">Senior Barista</option>
                    <option value="Head Barista">Head Barista</option>
                    <option value="Barista Trainer">Barista Trainer</option>
                    <option value="Coffee Shop Manager">Coffee Shop Manager</option>
                    <option value="Multiple Roles">Multiple Roles</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="emp-count" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    Number of Staff *
                  </label>
                  <input
                    id="emp-count"
                    name="staffCount"
                    type="number"
                    min="1"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                    placeholder="How many staff do you need?"
                  />
                </div>

                <div>
                  <label htmlFor="emp-exp" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    Experience Required
                  </label>
                  <select
                    id="emp-exp"
                    name="experienceRequired"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors"
                  >
                    <option value="">Select experience level</option>
                    <option value="No experience needed">No experience needed</option>
                    <option value="1+ year">1+ year</option>
                    <option value="2+ years">2+ years</option>
                    <option value="3+ years">3+ years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="emp-details" className="block text-sm font-medium text-[var(--gray-700)] mb-1.5">
                    Additional Details
                  </label>
                  <textarea
                    id="emp-details"
                    name="details"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--gray-200)] bg-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange transition-colors resize-none"
                    placeholder="Tell us more about your staffing needs..."
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
                  {status === "loading" ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
