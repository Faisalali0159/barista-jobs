"use client";

import { useEffect, useState } from "react";
import { Icon } from "../../../components/icons";
import { ICON_KEYS, type SiteContent } from "@/lib/content-types";
import {
  Card,
  Field,
  PageHeader,
  api,
  btnDanger,
  btnGhost,
  btnPrimary,
  inputCls,
  useAdminUser,
  useFlash,
} from "../../_components/ui";

export default function ContentPage() {
  const user = useAdminUser();
  const [c, setC] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { flash, ok, fail } = useFlash();

  useEffect(() => {
    if (user.role !== "admin") return;
    api<SiteContent>("/api/admin/content")
      .then(setC)
      .catch((e) => fail(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  if (user.role !== "admin") return <p className="text-[var(--gray-500)]">You do not have access to this page.</p>;
  if (!c) return <>{flash}<p className="text-[var(--gray-400)]">Loading...</p></>;

  function update(fn: (draft: SiteContent) => void) {
    setC((prev) => {
      const next = structuredClone(prev!);
      fn(next);
      return next;
    });
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      setC(await api<SiteContent>("/api/admin/content", { method: "PUT", body: JSON.stringify(c) }));
      setDirty(false);
      ok("Published. The website is updated.");
    } catch (e) {
      fail(e instanceof Error ? e.message : "Save failed");
    }
    setSaving(false);
  }

  return (
    <>
      <PageHeader
        title="Site Content"
        subtitle="Everything visitors see on the website. Changes go live when you publish."
        actions={
          <div className="flex gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className={btnGhost}>
              Preview site ↗
            </a>
            <button onClick={save} disabled={saving || !dirty} className={btnPrimary}>
              {saving ? "Publishing..." : dirty ? "Publish changes" : "Published"}
            </button>
          </div>
        }
      />
      <div className="space-y-6">
        {flash}

        <Card title="General">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Business name">
              <input className={inputCls} value={c.siteName} onChange={(e) => update((d) => void (d.siteName = e.target.value))} />
            </Field>
            <Field label="Tagline">
              <input className={inputCls} value={c.tagline} onChange={(e) => update((d) => void (d.tagline = e.target.value))} />
            </Field>
          </div>
        </Card>

        <Card title="Announcement bar" description="A banner pinned to the bottom of the website.">
          <label className="flex items-center gap-2 mb-3 text-sm">
            <input
              type="checkbox"
              checked={c.announcement.enabled}
              onChange={(e) => update((d) => void (d.announcement.enabled = e.target.checked))}
              className="accent-[var(--orange)]"
            />
            Show announcement
          </label>
          <input
            className={inputCls}
            placeholder="e.g. New barista training batch starts next month!"
            value={c.announcement.text}
            onChange={(e) => update((d) => void (d.announcement.text = e.target.value))}
          />
        </Card>

        <Card title="Hero section">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Badge text">
              <input className={inputCls} value={c.hero.badge} onChange={(e) => update((d) => void (d.hero.badge = e.target.value))} />
            </Field>
            <div />
            <Field label="Headline (first part)">
              <input className={inputCls} value={c.hero.titleLead} onChange={(e) => update((d) => void (d.hero.titleLead = e.target.value))} />
            </Field>
            <Field label="Headline (highlighted)">
              <input className={inputCls} value={c.hero.titleHighlight} onChange={(e) => update((d) => void (d.hero.titleHighlight = e.target.value))} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Subtitle">
                <textarea rows={3} className={inputCls} value={c.hero.subtitle} onChange={(e) => update((d) => void (d.hero.subtitle = e.target.value))} />
              </Field>
            </div>
            <Field label="Primary button">
              <input className={inputCls} value={c.hero.primaryCta} onChange={(e) => update((d) => void (d.hero.primaryCta = e.target.value))} />
            </Field>
            <Field label="Secondary button">
              <input className={inputCls} value={c.hero.secondaryCta} onChange={(e) => update((d) => void (d.hero.secondaryCta = e.target.value))} />
            </Field>
          </div>
          <h3 className="text-sm font-semibold text-navy mt-6 mb-2">Highlight numbers</h3>
          <div className="space-y-2">
            {c.hero.stats.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputCls} w-28`} placeholder="500+" value={s.value} onChange={(e) => update((d) => void (d.hero.stats[i].value = e.target.value))} />
                <input className={inputCls} placeholder="Label" value={s.label} onChange={(e) => update((d) => void (d.hero.stats[i].label = e.target.value))} />
                <button className={btnDanger} onClick={() => update((d) => void d.hero.stats.splice(i, 1))}>
                  Remove
                </button>
              </div>
            ))}
            {c.hero.stats.length < 4 && (
              <button className={btnGhost} onClick={() => update((d) => void d.hero.stats.push({ value: "", label: "" }))}>
                + Add number
              </button>
            )}
          </div>
        </Card>

        <Card title="Services" description="Cards shown on the website. They also appear as checkboxes on the business request form.">
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            <Field label="Eyebrow">
              <input className={inputCls} value={c.servicesSection.eyebrow} onChange={(e) => update((d) => void (d.servicesSection.eyebrow = e.target.value))} />
            </Field>
            <Field label="Section title">
              <input className={inputCls} value={c.servicesSection.title} onChange={(e) => update((d) => void (d.servicesSection.title = e.target.value))} />
            </Field>
            <Field label="Section subtitle">
              <input className={inputCls} value={c.servicesSection.subtitle} onChange={(e) => update((d) => void (d.servicesSection.subtitle = e.target.value))} />
            </Field>
          </div>
          <div className="space-y-3">
            {c.services.map((s, i) => (
              <div key={s.id} className="border border-[var(--gray-100)] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange/10 text-orange rounded-lg flex items-center justify-center shrink-0">
                    <Icon name={s.icon} className="w-5 h-5" />
                  </div>
                  <input className={inputCls} placeholder="Service title" value={s.title} onChange={(e) => update((d) => void (d.services[i].title = e.target.value))} />
                  <select className={`${inputCls} w-32 shrink-0`} value={s.icon} onChange={(e) => update((d) => void (d.services[i].icon = e.target.value as typeof s.icon))}>
                    {ICON_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea rows={2} className={inputCls} placeholder="Description" value={s.description} onChange={(e) => update((d) => void (d.services[i].description = e.target.value))} />
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={s.visible} onChange={(e) => update((d) => void (d.services[i].visible = e.target.checked))} className="accent-[var(--orange)]" />
                    Visible on site
                  </label>
                  <div className="flex gap-1">
                    <button className={btnGhost} disabled={i === 0} onClick={() => update((d) => void d.services.splice(i - 1, 2, d.services[i], d.services[i - 1]))}>
                      ↑
                    </button>
                    <button className={btnGhost} disabled={i === c.services.length - 1} onClick={() => update((d) => void d.services.splice(i, 2, d.services[i + 1], d.services[i]))}>
                      ↓
                    </button>
                    <button className={btnDanger} onClick={() => confirm(`Remove "${s.title || "this service"}"?`) && update((d) => void d.services.splice(i, 1))}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              className={btnGhost}
              onClick={() =>
                update((d) =>
                  void d.services.push({ id: `svc-${Date.now().toString(36)}`, icon: "star", title: "", description: "", visible: true })
                )
              }
            >
              + Add service
            </button>
          </div>
        </Card>

        <Card title="Contact section" description="WhatsApp numbers shown to visitors.">
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            <Field label="Eyebrow">
              <input className={inputCls} value={c.contactSection.eyebrow} onChange={(e) => update((d) => void (d.contactSection.eyebrow = e.target.value))} />
            </Field>
            <Field label="Section title">
              <input className={inputCls} value={c.contactSection.title} onChange={(e) => update((d) => void (d.contactSection.title = e.target.value))} />
            </Field>
            <Field label="Section subtitle">
              <input className={inputCls} value={c.contactSection.subtitle} onChange={(e) => update((d) => void (d.contactSection.subtitle = e.target.value))} />
            </Field>
          </div>
          <div className="space-y-3">
            {c.contacts.map((ct, i) => (
              <div key={ct.id} className="border border-[var(--gray-100)] rounded-xl p-4 grid sm:grid-cols-2 gap-3">
                <Field label="Title">
                  <input className={inputCls} value={ct.title} onChange={(e) => update((d) => void (d.contacts[i].title = e.target.value))} />
                </Field>
                <Field label="Style">
                  <select className={inputCls} value={ct.style} onChange={(e) => update((d) => void (d.contacts[i].style = e.target.value as "green" | "navy"))}>
                    <option value="green">Green</option>
                    <option value="navy">Navy</option>
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description">
                    <input className={inputCls} value={ct.description} onChange={(e) => update((d) => void (d.contacts[i].description = e.target.value))} />
                  </Field>
                </div>
                <Field label="Number shown on button">
                  <input className={inputCls} placeholder="+252 61 8270011" value={ct.phoneLabel} onChange={(e) => update((d) => void (d.contacts[i].phoneLabel = e.target.value))} />
                </Field>
                <Field label="WhatsApp number (digits)" hint="With country code, e.g. 252618270011">
                  <input className={inputCls} value={ct.whatsapp} onChange={(e) => update((d) => void (d.contacts[i].whatsapp = e.target.value.replace(/\D/g, "")))} />
                </Field>
                <div className="sm:col-span-2">
                  <button className={btnDanger} onClick={() => update((d) => void d.contacts.splice(i, 1))}>
                    Remove contact
                  </button>
                </div>
              </div>
            ))}
            {c.contacts.length < 6 && (
              <button
                className={btnGhost}
                onClick={() =>
                  update((d) =>
                    void d.contacts.push({ id: `contact-${Date.now().toString(36)}`, title: "", description: "", phoneLabel: "", whatsapp: "", style: "navy" })
                  )
                }
              >
                + Add contact
              </button>
            )}
          </div>
        </Card>

        <Card title="Footer">
          <div className="grid gap-4">
            <Field label="About text">
              <textarea rows={2} className={inputCls} value={c.footer.about} onChange={(e) => update((d) => void (d.footer.about = e.target.value))} />
            </Field>
            <Field label="Copyright line" hint="Shown after the © symbol, e.g. “2026 Barista Job's. All rights reserved.”">
              <input className={inputCls} value={c.footer.copyright} onChange={(e) => update((d) => void (d.footer.copyright = e.target.value))} />
            </Field>
          </div>
        </Card>

        <Card title="Forms" description="Control the public application forms and their dropdown options.">
          <div className="flex flex-wrap gap-6 mb-5 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-[var(--orange)]" checked={c.forms.jobSeekersOpen} onChange={(e) => update((d) => void (d.forms.jobSeekersOpen = e.target.checked))} />
              Accept job seeker applications
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-[var(--orange)]" checked={c.forms.employersOpen} onChange={(e) => update((d) => void (d.forms.employersOpen = e.target.checked))} />
              Accept business requests
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <ListField label="Job positions" value={c.forms.positions} onChange={(v) => update((d) => void (d.forms.positions = v))} />
            <ListField label="Applicant experience levels" value={c.forms.experienceLevels} onChange={(v) => update((d) => void (d.forms.experienceLevels = v))} />
            <ListField label="Staff types businesses can request" value={c.forms.staffTypes} onChange={(v) => update((d) => void (d.forms.staffTypes = v))} />
            <ListField label="Experience businesses can require" value={c.forms.experienceRequired} onChange={(v) => update((d) => void (d.forms.experienceRequired = v))} />
          </div>
        </Card>

        <div className="sticky bottom-4 flex justify-end">
          <button onClick={save} disabled={saving || !dirty} className={`${btnPrimary} shadow-lg`}>
            {saving ? "Publishing..." : dirty ? "Publish changes" : "All changes published"}
          </button>
        </div>
      </div>
    </>
  );
}

/** One option per line. */
function ListField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(value.join("\n"));
  return (
    <Field label={label} hint="One option per line">
      <textarea
        rows={6}
        className={inputCls}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean));
        }}
      />
    </Field>
  );
}
