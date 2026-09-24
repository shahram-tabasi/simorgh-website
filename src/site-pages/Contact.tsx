'use client';

import React, { useState } from 'react';
import { CheckIcon, MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Button } from '../components/ui/Button';
import { TextField, TextArea } from '../components/forms/Field';
import { useContent } from '../content/ContentProvider';

const enquiries = ['General', 'Sales', 'Enterprise', 'Partnership', 'Support'] as const;

export function Contact() {
  const { pages, settings } = useContent();
  const [kind, setKind] = useState<(typeof enquiries)[number]>('General');
  const [form, setForm] = useState({ name: '', email: '', organisation: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const [trap, setTrap] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.message.trim()) next.message = 'Tell us what you need';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSending(true);
    setFailed(false);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact', website: trap, fields: { kind, ...form } }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSent(true);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="CONTACT"
        title="Talk to the team building it"
        lead="Enquiries are routed directly to the relevant engineering or commercial group — there is no general inbox."
        crumbs={[{ label: 'Contact' }]}
        image={pages.contact.heroImage}
        flip={pages.contact.heroFlip} />
      

      <section className="bg-space-0">
        <div className="mx-auto grid max-w-shell gap-14 px-5 py-20 lg:grid-cols-[1.3fr_1fr] lg:gap-20 lg:px-10 lg:py-24">
          <div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Enquiry type">
              {enquiries.map((e) =>
              <button
                key={e}
                onClick={() => setKind(e)}
                aria-pressed={kind === e}
                className={`border px-3.5 py-2 font-mono text-[10.5px] tracking-label transition-colors duration-150 ease-sim ${
                kind === e ? 'border-cyan/60 text-cyan' : 'border-line text-ink-faint hover:text-ink-muted'}`
                }>
                
                  {e.toUpperCase()}
                </button>
              )}
            </div>

            {sent ?
            <div className="mt-10 border border-cyan/40 bg-space-1 p-10" role="status">
                <CheckIcon className="h-6 w-6 text-cyan" strokeWidth={1.6} aria-hidden="true" />
                <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">Message sent</h2>
                <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-ink-muted">
                  {`Your ${kind.toLowerCase()} enquiry has been routed to the responsible team. Expect a reply at ${form.email} within one working day.`}
                </p>
              </div> :

            <form onSubmit={submit} noValidate className="mt-10">
                {/* Left empty by people; bots fill it in. */}
                <input type="text" name="website" value={trap} onChange={(e) => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField label="Name" name="c-name" required value={form.name} onChange={set('name')} error={errors.name} />
                  <TextField label="Email" name="c-email" type="email" required value={form.email} onChange={set('email')} error={errors.email} />
                  <TextField label="Organisation" name="c-org" value={form.organisation} onChange={set('organisation')} className="sm:col-span-2" />
                  <TextArea label={`${kind} enquiry`} name="c-message" required value={form.message} onChange={set('message')} error={errors.message} className="sm:col-span-2" />
                </div>
                <Button type="submit" size="lg" disabled={sending} className="mt-10">
                  Send message
                </Button>
                {failed && <p className="mt-5 text-[13.5px] text-red-300" role="alert">The message could not be sent. Please try again, or email us directly.</p>}
              </form>
            }
          </div>

          <aside className="flex flex-col gap-px border border-line bg-line">
            {[
            { icon: MailIcon, label: 'Email', value: settings.email },
            { icon: PhoneIcon, label: 'Phone', value: settings.phone },
            { icon: MapPinIcon, label: 'Head office', value: settings.address }].filter((item) => item.value).
            map((item) =>
            <div key={item.label} className="flex items-start gap-4 bg-space-1 p-7">
                <item.icon className="mt-0.5 h-4 w-4 text-cyan" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <div className="font-mono text-[10px] tracking-label text-ink-faint">{item.label.toUpperCase()}</div>
                  <div className="mt-2 text-[14.5px] text-ink">{item.value}</div>
                </div>
              </div>
            )}
            <div className="bg-space-1 p-7">
              <div className="font-mono text-[10px] tracking-label text-ink-faint">RESPONSE</div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">
                Enterprise and partnership enquiries are answered by a named solution architect, in any of the ten
                languages the platform supports.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>);

}