"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Clock, Mail, MapPin, Phone } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/States";
import { Reveal } from "@/components/ui/Reveal";

const SUBJECTS = [
  "A question about a product",
  "Something wrong with my order",
  "Bulk or wedding order",
  "Wholesale / stocking Kai Ruchi",
  "Something else",
];

const FAQ = [
  {
    q: "How long does delivery take?",
    a: "Two to four days across India for masalas, pickles and snacks. Fresh batter and sweets ship on a shorter route and reach metro addresses in under 48 hours.",
  },
  {
    q: "Why is something out of stock?",
    a: "Because that batch is finished. We do not grind more to fill a gap and sell it under the same date. Most things come back within a week; mango pickle comes back in May.",
  },
  {
    q: "Can I return something?",
    a: "Food, so no — but if a jar arrives broken, leaking, or tasting wrong, write to us with a photo and we replace it. No form to fill in.",
  },
  {
    q: "Is the payment on this site real?",
    a: "No. This is a college project, so checkout runs on a simulated gateway. It never contacts a bank and never asks for a card number or UPI ID.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: SUBJECTS[0],
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.message.trim().length < 10) {
      toast.error("Give us a little more to go on.");
      return;
    }
    setSending(true);
    try {
      const res = await api.contact({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
        subject: form.subject,
        message: form.message.trim(),
      });
      setSent(true);
      toast.success(res.message);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't send that message.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Talk to us"
        title="Ask us anything"
        blurb="One person reads this inbox. Replies usually land the same day, and always within one."
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-6 pb-24 lg:grid-cols-[1fr_20rem]">
        {/* --------------------------------------------------------- form */}
        <div>
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-deep rounded-[var(--radius-jar)] p-12 text-center"
            >
              <motion.span
                className="mx-auto grid size-20 place-items-center rounded-full bg-leaf text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 16 }}
              >
                <Check className="size-10" strokeWidth={3} />
              </motion.span>
              <h2 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
                Message sent
              </h2>
              <p className="mt-3 text-ash">
                It's in the inbox. We reply within a day, usually sooner.
              </p>
              <Button
                onClick={() => {
                  setSent(false);
                  setForm({ ...form, message: "" });
                }}
                variant="glass"
                size="md"
                className="mt-7"
              >
                Send another
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="glass rounded-[var(--radius-jar)] p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name">
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Who are we replying to?"
                    required
                    minLength={2}
                    autoComplete="name"
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </Field>
                <Field label="Phone" hint="Optional">
                  <Input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+91 98450 00000"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </Field>
                <Field label="What's this about?">
                  <select
                    value={form.subject}
                    onChange={(e) => set("subject", e.target.value)}
                    className="clay-inset w-full cursor-pointer appearance-none rounded-2xl px-4 py-3 text-base outline-none sm:text-[0.9375rem]"
                  >
                    {SUBJECTS.map((subject) => (
                      <option key={subject}>{subject}</option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Message"
                  hint={`${form.message.length}/4000`}
                  className="sm:col-span-2"
                >
                  <Textarea
                    rows={6}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value.slice(0, 4000))}
                    placeholder="Order number if it's about a delivery, or just ask."
                    required
                  />
                </Field>
              </div>

              <Button
                type="submit"
                variant="ink"
                size="lg"
                loading={sending}
                className="mt-6 w-full sm:w-auto"
              >
                Send message
              </Button>
            </form>
          )}

          {/* ---------------------------------------------------- faq --- */}
          <section className="mt-10">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              Answered before you ask
            </h2>
            <div className="mt-5 space-y-3">
              {FAQ.map((item, i) => (
                <Reveal key={item.q} delay={i * 0.06}>
                  <details className="group glass rounded-2xl px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                      {item.q}
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-kaadige/8 text-lg leading-none transition-transform duration-300 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-ash">{item.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </section>
        </div>

        {/* -------------------------------------------------------- aside */}
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="glass rounded-[var(--radius-jar)] p-6">
            <p className="eyebrow text-chilli">The kitchen</p>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-turmeric-deep" />
                <span>
                  2nd Cross, Car Street
                  <br />
                  Udupi, Karnataka 576101
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-turmeric-deep" />
                <span>+91 98450 00000</span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-turmeric-deep" />
                <span>hello@kairuchi.in</span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-turmeric-deep" />
                <span>
                  Mon–Sat, 9am to 7pm
                  <br />
                  <span className="text-ash">Grinding stops at 11am</span>
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-[var(--radius-jar)] bg-leaf p-6 text-mallige">
            <p className="font-display text-xl font-extrabold tracking-tight">
              Ordering for a wedding?
            </p>
            <p className="mt-2 text-sm text-mallige/80">
              Anything above five kilos needs about ten days' notice. Tell us the date and
              we will work backwards from it.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
