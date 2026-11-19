"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

interface JobSeeker {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  position: string;
  experience: string;
  cvPath?: string;
  photoPath?: string;
  message?: string;
  createdAt: string;
}

interface Employer {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  city: string;
  staffType: string;
  staffCount: number;
  experienceRequired?: string;
  details?: string;
  createdAt: string;
}

type Tab = "job-seekers" | "employers";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("job-seekers");
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [jsRes, empRes] = await Promise.all([
        fetch("/api/job-seekers"),
        fetch("/api/employers"),
      ]);
      if (jsRes.ok) setJobSeekers(await jsRes.json());
      if (empRes.ok) setEmployers(await empRes.json());
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      <header className="bg-navy text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Barista Job's"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div>
                <div className="font-bold text-lg">BARISTA JOB&apos;S</div>
                <div className="text-xs text-orange">Admin Dashboard</div>
              </div>
            </a>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Job Seekers" value={jobSeekers.length} color="orange" />
          <StatCard label="Business Requests" value={employers.length} color="navy" />
          <StatCard
            label="Total Staff Needed"
            value={employers.reduce((sum, e) => sum + e.staffCount, 0)}
            color="green"
          />
          <StatCard
            label="Cities"
            value={new Set([...jobSeekers.map((j) => j.city), ...employers.map((e) => e.city)]).size}
            color="blue"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[var(--gray-100)] overflow-hidden">
          <div className="flex border-b border-[var(--gray-100)]">
            <button
              onClick={() => setTab("job-seekers")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                tab === "job-seekers"
                  ? "text-orange border-b-2 border-orange bg-orange/5"
                  : "text-[var(--gray-500)] hover:text-navy"
              }`}
            >
              Job Seekers ({jobSeekers.length})
            </button>
            <button
              onClick={() => setTab("employers")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                tab === "employers"
                  ? "text-orange border-b-2 border-orange bg-orange/5"
                  : "text-[var(--gray-500)] hover:text-navy"
              }`}
            >
              Business Requests ({employers.length})
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="text-center py-12 text-[var(--gray-400)]">
                Loading...
              </div>
            ) : tab === "job-seekers" ? (
              jobSeekers.length === 0 ? (
                <EmptyState text="No job seeker applications yet" />
              ) : (
                <div className="space-y-4">
                  {jobSeekers.map((seeker) => (
                    <div
                      key={seeker.id}
                      className="border border-[var(--gray-100)] rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {seeker.photoPath && (
                          <Image
                            src={seeker.photoPath}
                            alt={seeker.fullName}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h3 className="font-bold text-navy text-lg">
                              {seeker.fullName}
                            </h3>
                            <span className="text-xs text-[var(--gray-400)]">
                              {new Date(seeker.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <InfoPill label="Phone" value={seeker.phone} />
                            <InfoPill label="City" value={seeker.city} />
                            <InfoPill label="Position" value={seeker.position} />
                            <InfoPill label="Experience" value={seeker.experience} />
                          </div>
                          {seeker.message && (
                            <p className="mt-3 text-sm text-[var(--gray-500)] bg-[var(--gray-50)] rounded-lg p-3">
                              {seeker.message}
                            </p>
                          )}
                          {seeker.cvPath && (
                            <a
                              href={seeker.cvPath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-3 text-sm text-orange hover:text-orange-dark font-medium"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download CV
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : employers.length === 0 ? (
              <EmptyState text="No business requests yet" />
            ) : (
              <div className="space-y-4">
                {employers.map((employer) => (
                  <div
                    key={employer.id}
                    className="border border-[var(--gray-100)] rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-bold text-navy text-lg">
                          {employer.businessName}
                        </h3>
                        <p className="text-sm text-[var(--gray-500)]">
                          Contact: {employer.contactPerson}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--gray-400)]">
                        {new Date(employer.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <InfoPill label="Phone" value={employer.phone} />
                      <InfoPill label="City" value={employer.city} />
                      <InfoPill label="Staff Type" value={employer.staffType} />
                      <InfoPill label="Staff Needed" value={String(employer.staffCount)} />
                    </div>
                    {employer.experienceRequired && (
                      <div className="mt-2">
                        <InfoPill label="Experience Required" value={employer.experienceRequired} />
                      </div>
                    )}
                    {employer.details && (
                      <p className="mt-3 text-sm text-[var(--gray-500)] bg-[var(--gray-50)] rounded-lg p-3">
                        {employer.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const bgMap: Record<string, string> = {
    orange: "bg-orange/10 text-orange",
    navy: "bg-navy/10 text-navy",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-[var(--gray-100)]">
      <div className={`text-3xl font-bold ${bgMap[color]?.split(" ")[1] || "text-navy"}`}>
        {value}
      </div>
      <div className="text-sm text-[var(--gray-500)] mt-1">{label}</div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[var(--gray-400)] text-xs">{label}</span>
      <div className="font-medium text-navy">{value}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-[var(--gray-100)] rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-[var(--gray-300)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-[var(--gray-400)]">{text}</p>
    </div>
  );
}
