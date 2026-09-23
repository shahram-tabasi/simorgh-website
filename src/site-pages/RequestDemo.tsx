'use client';

import React, { useState } from 'react';
import { CheckIcon, Loader2Icon } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Button } from '../components/ui/Button';
import { TextField, SelectField, TextArea } from '../components/forms/Field';
import { products } from '../data/products';
import { industries, REF_IMAGE_PLANET } from '../data/site';

type Status = 'idle' | 'submitting' | 'done' | 'error';

const initial = {
  name: '',
  company: '',
  position: '',
  country: '',
  email: '',
  phone: '',
  product: '',
  industry: '',
  message: ''
};

const workflow = ['New', 'Contacted', 'Qualified', 'Demo Scheduled', 'Completed', 'Closed'];

export function RequestDemo() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');

  const set = (key: keyof typeof initial) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Required';
    if (!form.company.trim()) next.company = 'Required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Enter a valid work email';
    if (!form.product) next.product = 'Select a product';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('submitting');
    window.setTimeout(() => setStatus('done'), 900);
  };

  return (
    <>
      <PageHero
        eyebrow="REQUEST A DEMO"
        title="See the platform against your own data"
        lead="Demonstrations are run on a representative sample of your documentation, telemetry or spatial data — never on a canned dataset."
        crumbs={[{ label: 'Request Demo' }]}
        image={REF_IMAGE_PLANET} />
      

      <section className="bg-space-0">
        <div className="mx-auto grid max-w-shell gap-14 px-5 py-20 lg:grid-cols-[1.4fr_1fr] lg:gap-20 lg:px-10 lg:py-24">
          <div>
            {status === 'done' ?
            <div className="border border-cyan/40 bg-space-1 p-10" role="status">
                <CheckIcon className="h-6 w-6 text-cyan" strokeWidth={1.6} aria-hidden="true" />
                <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">Request received</h2>
                <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-ink-muted">
                  A solution architect from the {form.product || 'platform'} team will contact {form.email} within one
                  working day to agree the sample data and scope of the session.
                </p>
                <Button variant="outline" className="mt-8" onClick={() => {setForm(initial);setStatus('idle');}}>
                  Submit another request
                </Button>
              </div> :

            <form onSubmit={submit} noValidate>
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField label="Name" name="name" required value={form.name} onChange={set('name')} error={errors.name} />
                  <TextField label="Company" name="company" required value={form.company} onChange={set('company')} error={errors.company} />
                  <TextField label="Position" name="position" value={form.position} onChange={set('position')} />
                  <TextField label="Country" name="country" value={form.country} onChange={set('country')} />
                  <TextField label="Work email" name="email" type="email" required value={form.email} onChange={set('email')} error={errors.email} />
                  <TextField label="Phone" name="phone" type="tel" value={form.phone} onChange={set('phone')} />
                  <SelectField
                  label="Product"
                  name="product"
                  required
                  value={form.product}
                  onChange={set('product')}
                  error={errors.product}
                  options={products.map((p) => p.name)} />
                
                  <SelectField
                  label="Industry"
                  name="industry"
                  value={form.industry}
                  onChange={set('industry')}
                  options={industries.map((i) => i.name)} />
                
                  <TextArea
                  label="What would you like to see?"
                  name="message"
                  value={form.message}
                  onChange={set('message')}
                  className="sm:col-span-2" />
                
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-5">
                  <Button type="submit" size="lg">
                    {status === 'submitting' ?
                  <>
                        <Loader2Icon className="h-4 w-4 animate-spin" strokeWidth={1.8} aria-hidden="true" />
                        Sending
                      </> :

                  'Submit request'
                  }
                  </Button>
                  <p className="max-w-xs text-[12px] leading-relaxed text-ink-faint">
                    Submitted requests enter the sales workflow and are answered by an engineer, not a queue.
                  </p>
                </div>
              </form>
            }
          </div>

          <aside className="border border-line bg-space-1 p-8 lg:p-10">
            <span className="font-mono text-[10px] tracking-label text-cyan/80">WHAT HAPPENS NEXT</span>
            <ol className="mt-8">
              {workflow.map((step, i) =>
              <li key={step} className="flex items-start gap-4 pb-6 last:pb-0">
                  <span className="flex flex-col items-center self-stretch">
                    <span className={`mt-1.5 h-2 w-2 rotate-45 ${i === 0 ? 'bg-cyan' : 'bg-ink-faint/40'}`} />
                    {i < workflow.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
                  </span>
                  <span>
                    <span className="block text-[14px] text-ink">{step}</span>
                    <span className="mt-1 block font-mono text-[10px] text-ink-faint">
                      STAGE {String(i + 1).padStart(2, '0')}
                    </span>
                  </span>
                </li>
              )}
            </ol>
            <p className="mt-8 border-t border-line pt-6 text-[13px] leading-relaxed text-ink-faint">
              Every request is tracked through these stages in the SIMORGH console, with ownership and response times
              visible to the commercial team.
            </p>
          </aside>
        </div>
      </section>
    </>);

}