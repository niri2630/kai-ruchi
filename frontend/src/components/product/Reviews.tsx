"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, PenLine, Star } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/store/useAuth";
import type { Review } from "@/lib/types";
import { cn, formatDate, initials } from "@/lib/utils";
import { Stars } from "@/components/ui/Bits";
import { Button } from "@/components/ui/Button";

function RatingPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const LABELS = ["", "Not for me", "It was fine", "Good", "Really good", "Would reorder"];

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            className="transition-transform hover:scale-125"
          >
            <Star
              className={cn(
                "size-7 transition-colors",
                star <= shown ? "fill-turmeric text-turmeric" : "text-kaadige/20",
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-sm font-semibold text-ash">{LABELS[shown]}</span>
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="glass rounded-[var(--radius-jar)] p-6"
    >
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-indigo text-sm font-bold text-white">
            {initials(review.author_name)}
          </span>
          <div>
            <p className="font-bold leading-tight">{review.author_name}</p>
            <p className="text-xs text-ash">{formatDate(review.created_at)}</p>
          </div>
        </div>
        {review.is_verified_purchase && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-leaf/12 px-2.5 py-1 text-[0.6875rem] font-bold text-leaf">
            <BadgeCheck className="size-3.5" />
            Verified
          </span>
        )}
      </header>

      <Stars value={review.rating} className="mt-4" size={15} />
      {review.title && (
        <h4 className="mt-2 font-display text-xl font-extrabold tracking-tight">
          {review.title}
        </h4>
      )}
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-kaadige/85">{review.body}</p>
    </motion.article>
  );
}

export default function Reviews({ slug }: { slug: string }) {
  const user = useAuth((s) => s.user);
  const [sort, setSort] = useState<"newest" | "highest" | "lowest">("newest");
  const [writing, setWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const reviews = useApi(() => api.productReviews(slug, sort), [slug, sort]);
  const summary = useApi(() => api.reviewSummary(slug), [slug]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (body.trim().length < 4) {
      toast.error("Tell us a little more than that.");
      return;
    }
    setSaving(true);
    try {
      await api.writeReview(slug, {
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
      });
      toast.success("Thanks — your review is up.");
      setWriting(false);
      setTitle("");
      setBody("");
      reviews.reload();
      summary.reload();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't post that review.",
      );
    } finally {
      setSaving(false);
    }
  };

  const stats = summary.data;
  const list = reviews.data ?? [];

  return (
    <section id="reviews" className="scroll-mt-28">
      <div className="grid gap-10 lg:grid-cols-[20rem_1fr]">
        {/* ---------------------------------------------------- summary --- */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">
            What shoppers said
          </h2>

          {stats && stats.count > 0 ? (
            <div className="glass mt-5 rounded-[var(--radius-jar)] p-6">
              <div className="flex items-end gap-3">
                <span className="tabular font-display text-6xl font-extrabold leading-none">
                  {stats.average.toFixed(1)}
                </span>
                <div className="pb-1.5">
                  <Stars value={stats.average} size={16} />
                  <p className="mt-1 text-xs text-ash">
                    {stats.count} review{stats.count === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.breakdown[String(star)] ?? 0;
                  const pct = stats.count ? (count / stats.count) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2.5 text-xs">
                      <span className="tabular w-3 font-bold text-ash">{star}</span>
                      <Star className="size-3 fill-turmeric text-turmeric" />
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-kaadige/10">
                        <motion.div
                          className="h-full rounded-full bg-turmeric"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                        />
                      </div>
                      <span className="tabular w-4 text-right text-ash">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ash">
              No reviews yet. If you have cooked with it, you would be the first.
            </p>
          )}

          <div className="mt-5">
            {user ? (
              <Button
                onClick={() => setWriting((open) => !open)}
                variant="clay"
                size="md"
                className="w-full"
                icon={<PenLine className="size-4" />}
              >
                {writing ? "Close" : "Write a review"}
              </Button>
            ) : (
              <p className="text-sm text-ash">
                <Link
                  href="/login"
                  className="font-bold text-chilli underline underline-offset-4"
                >
                  Sign in
                </Link>{" "}
                to leave a review.
              </p>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------ list --- */}
        <div>
          <AnimatePresence>
            {writing && user && (
              <motion.form
                onSubmit={submit}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-deep mb-6 overflow-hidden rounded-[var(--radius-jar)]"
              >
                <div className="space-y-4 p-6">
                  <RatingPicker value={rating} onChange={setRating} />
                  <div className="clay-inset rounded-2xl px-4 py-3">
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Sum it up in a few words (optional)"
                      maxLength={120}
                      className="w-full bg-transparent font-display text-lg font-bold outline-none placeholder:font-body placeholder:text-sm placeholder:font-normal placeholder:text-ash"
                    />
                  </div>
                  <div className="clay-inset rounded-2xl px-4 py-3">
                    <textarea
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                      placeholder="How did it cook? What did you make with it?"
                      rows={4}
                      maxLength={2000}
                      className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-ash"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setWriting(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="ink" size="sm" loading={saving}>
                      Post review
                    </Button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {list.length > 1 && (
            <div className="mb-5 flex gap-2">
              {(["newest", "highest", "lowest"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition",
                    sort === key
                      ? "bg-kaadige text-mallige"
                      : "bg-white/55 text-ash hover:bg-white/85 hover:text-kaadige",
                  )}
                >
                  {key === "newest" ? "Newest" : key === "highest" ? "Highest first" : "Lowest first"}
                </button>
              ))}
            </div>
          )}

          {reviews.loading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="skeleton h-40 rounded-[var(--radius-jar)]" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="glass rounded-[var(--radius-jar)] p-10 text-center">
              <p className="font-display text-xl font-bold">Nothing here yet</p>
              <p className="mt-1.5 text-sm text-ash">
                Be the first to say how it turned out.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {list.map((review, i) => (
                <ReviewCard key={review.id} review={review} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
