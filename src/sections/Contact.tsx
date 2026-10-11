import { useId, useState, type FormEvent } from 'react';
import { ButtonLink } from '../components/Button';
import { ArrowRight, Check, Copy, GitHub, LinkedIn, Mail } from '../components/Icons';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';
import { contact, profile } from '../data/content';

type Field = 'name' | 'email' | 'message';
type Errors = Partial<Record<Field, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v: Record<Field, string>): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = 'Please enter your name.';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address.';
  if (v.message.trim().length < 20) e.message = 'A little more detail, please (20+ characters).';
  else if (v.message.length > 2000) e.message = 'Please keep it under 2000 characters.';
  return e;
}

/**
 * Front-end only: nothing is sent to a server. On submit it validates and opens the
 * visitor's email client with the message prefilled.
 */
function ContactForm() {
  const uid = useId();
  const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState('');

  const update = (field: Field, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    // Once a field has been blurred, validate it live so the error clears as the user fixes it.
    if (touched[field]) setErrors((e) => ({ ...e, [field]: validate(next)[field] }));
  };

  const blur = (field: Field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validate(values)[field] }));
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });
    const firstInvalid = (Object.keys(found) as Field[])[0];
    if (firstInvalid) {
      setStatus('Please fix the highlighted fields.');
      document.getElementById(`${uid}-${firstInvalid}`)?.focus();
      return;
    }
    const subject = encodeURIComponent(`Portfolio enquiry from ${values.name.trim()}`);
    const body = encodeURIComponent(
      `${values.message.trim()}\n\n${values.name.trim()}\n${values.email.trim()}`,
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setStatus('Opening your email app with the message prefilled…');
  };

  const fields: {
    id: Field;
    label: string;
    type?: string;
    autoComplete: string;
    multiline?: boolean;
  }[] = [
    { id: 'name', label: 'Name', autoComplete: 'name' },
    { id: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    { id: 'message', label: 'Message', autoComplete: 'off', multiline: true },
  ];

  const inputCls =
    'bg-bg border-line-strong text-fg placeholder:text-fg-subtle w-full rounded-lg border px-3.5 py-2.5 outline-none transition-colors focus-visible:border-accent aria-[invalid=true]:border-down';

  return (
    <form
      onSubmit={submit}
      noValidate
      className="panel space-y-5 p-6 sm:p-8"
      aria-describedby={`${uid}-note`}
    >
      {fields.map((f) => {
        const id = `${uid}-${f.id}`;
        const err = errors[f.id];
        const common = {
          id,
          name: f.id,
          value: values[f.id],
          autoComplete: f.autoComplete,
          required: true,
          'aria-invalid': !!err,
          'aria-describedby': err ? `${id}-err` : undefined,
          onBlur: () => blur(f.id),
          className: inputCls,
        };
        return (
          <div key={f.id}>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
              {f.label}
            </label>
            {f.multiline ? (
              <textarea
                {...common}
                rows={5}
                maxLength={2000}
                onChange={(e) => update(f.id, e.target.value)}
                className={`${inputCls} resize-y`}
              />
            ) : (
              <input
                {...common}
                type={f.type ?? 'text'}
                onChange={(e) => update(f.id, e.target.value)}
              />
            )}
            {err && (
              <p id={`${id}-err`} className="text-down mt-1.5 text-sm">
                {err}
              </p>
            )}
          </div>
        );
      })}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p id={`${uid}-note`} className="text-fg-subtle text-xs">
          No data is stored. Sending opens your own email app.
        </p>
        <button
          type="submit"
          className="bg-accent text-accent-fg group inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-[filter] hover:brightness-110"
        >
          Send message
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      <p role="status" aria-live="polite" className="text-fg-muted text-sm empty:hidden">
        {status}
      </p>
    </form>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the mailto link is still available.
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="text-fg-muted hover:text-fg hover:bg-surface-strong grid size-11 place-items-center rounded-full transition-colors"
      aria-label={copied ? 'Email copied' : 'Copy email address'}
      title="Copy email"
    >
      {copied ? <Check className="text-up" /> : <Copy />}
      <span className="sr-only" role="status">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </button>
  );
}

export function Contact() {
  const links = [
    { href: profile.linkedin, label: 'LinkedIn', icon: <LinkedIn /> },
    { href: profile.github, label: 'GitHub', icon: <GitHub /> },
  ];

  return (
    <section id="contact" aria-labelledby="contact-title" className="container-page py-24 sm:py-32">
      <SectionHeading
        id="contact-title"
        index="07"
        eyebrow="Contact"
        title={contact.heading}
        lede={contact.sub}
      />
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <Reveal className="space-y-8">
          <div>
            <p className="text-fg-subtle mb-2 font-mono text-xs tracking-wider uppercase">Email</p>
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${profile.email}`}
                className="hover:text-accent-text text-2xl font-semibold tracking-tight break-all underline-offset-4 transition-colors hover:underline sm:text-3xl"
              >
                {profile.email}
              </a>
              <CopyEmail />
            </div>
          </div>
          <ul className="flex flex-wrap gap-3">
            {links.map((l) => (
              <li key={l.label}>
                <ButtonLink href={l.href} variant="ghost" target="_blank" rel="noreferrer">
                  {l.icon}
                  {l.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </ButtonLink>
              </li>
            ))}
            <li>
              <ButtonLink href={`mailto:${profile.email}`} variant="ghost">
                <Mail />
                Email me
              </ButtonLink>
            </li>
          </ul>
          <p className="text-fg-subtle text-sm">
            Based in {profile.location}. Open to remote and on-site roles.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
