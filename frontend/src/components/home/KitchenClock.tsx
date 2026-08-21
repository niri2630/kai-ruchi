"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { accentOf, cn } from "@/lib/utils";

/**
 * THE KITCHEN CLOCK — this page's signature.
 *
 * The whole pitch of this business is that nothing is stocked ahead: masalas
 * are ground the morning they ship, snacks are fried the day they leave,
 * sweets are only started once you order them. That claim is abstract in a
 * paragraph and obvious in a clock.
 *
 * So this reads the visitor's own wall time and says what the kitchen is doing
 * right now. Land here at 07:30 and coriander is in the kadai; land at
 * midnight and the only thing happening is mango curing on the terrace. It is
 * live, it changes through the day, and it could not be lifted onto any shop
 * that ships from a warehouse.
 *
 * The dial is a 24-hour ring with a dot at every hour — the same kolam grid
 * used as a divider elsewhere on the site, doing real work here.
 */

interface Block {
  start: string;
  end: string;
  short: string;
  title: string;
  note: string;
  accent: string;
  href: string;
  cta: string;
}

const DAY: Block[] = [
  {
    start: "05:40",
    end: "07:00",
    short: "Grinding batter",
    title: "Batter goes on the stone grinder",
    note: "Rice and urad, soaked since midnight, ground wet before the sun is properly up. A mixie would heat it and ruin the ferment.",
    accent: "leaf",
    href: "/categories/fresh-batters",
    cta: "See the fresh batters",
  },
  {
    start: "07:00",
    end: "09:00",
    short: "Roasting spices",
    title: "Whole spices go into the iron kadai",
    note: "Coriander first, cumin about four minutes later, because they are ready at different moments. This is the step a machine gets wrong.",
    accent: "chilli",
    href: "/categories/masalas",
    cta: "See the masalas",
  },
  {
    start: "09:00",
    end: "11:00",
    short: "Grinding masala",
    title: "Grinding, and the date goes on by hand",
    note: "Ground coarse, weighed, sealed, and written on. Whatever is ground this morning is on a courier by this evening.",
    accent: "chilli",
    href: "/categories/masalas",
    cta: "See the masalas",
  },
  {
    start: "11:00",
    end: "13:00",
    short: "Frying snacks",
    title: "The oil goes on for the snack tins",
    note: "Banana slices cut straight over the wok so they hit hot coconut oil within a second. Chakli pressed through a brass mould by hand.",
    accent: "indigo",
    href: "/categories/snacks",
    cta: "See the snacks",
  },
  {
    start: "13:00",
    end: "15:00",
    short: "Making sweets",
    title: "Sweets, only for orders already placed",
    note: "Mysore pak is beaten continuously for twenty minutes and cannot be left alone for any of them. Nothing is made on spec.",
    accent: "rose",
    href: "/categories/sweets",
    cta: "See the sweets",
  },
  {
    start: "15:00",
    end: "16:30",
    short: "Packing",
    title: "Jars wiped, lids taped, boxes padded",
    note: "Newspaper rather than bubble wrap. It has never lost us a jar and it does not end up in anyone's bin as plastic.",
    accent: "turmeric",
    href: "/products",
    cta: "Browse the pantry",
  },
  {
    start: "16:30",
    end: "18:00",
    short: "Courier run",
    title: "The courier takes the day's boxes",
    note: "Anything ordered before noon goes out on this run. After that it waits for tomorrow — we would rather it left fresh than left fast.",
    accent: "turmeric",
    href: "/track",
    cta: "Track an order",
  },
  {
    start: "18:00",
    end: "05:40",
    short: "Closed",
    title: "Closed — but the pickles keep working",
    note: "Nothing is made tonight. The only thing happening is the mango on the terrace, somewhere in its twenty-one days of curing.",
    accent: "leaf",
    href: "/categories/pickles",
    cta: "See the pickles",
  },
];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const DAY_MINUTES = 1440;
const CX = 160;
const CY = 160;
const R_ARC = 130;
const R_DOT = 150;

const pointAt = (minutes: number, radius: number) => {
  const angle = ((minutes / DAY_MINUTES) * 360 - 90) * (Math.PI / 180);
  return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)] as const;
};

/** One arc along the ring. Segments that cross midnight are drawn as two. */
function arcPath(fromM: number, toM: number) {
  const [x1, y1] = pointAt(fromM, R_ARC);
  const [x2, y2] = pointAt(toM, R_ARC);
  const sweep = toM - fromM;
  const largeArc = sweep > DAY_MINUTES / 2 ? 1 : 0;
  return `M ${x1} ${y1} A ${R_ARC} ${R_ARC} 0 ${largeArc} 1 ${x2} ${y2}`;
}

function segmentsFor(block: Block) {
  const start = toMinutes(block.start);
  const end = toMinutes(block.end);
  return end > start
    ? [[start, end] as const]
    : ([
        [start, DAY_MINUTES - 0.01],
        [0, end],
      ] as const);
}

function isActive(block: Block, nowM: number) {
  const start = toMinutes(block.start);
  const end = toMinutes(block.end);
  return end > start ? nowM >= start && nowM < end : nowM >= start || nowM < end;
}

function untilNext(nowM: number) {
  const starts = DAY.map((b) => toMinutes(b.start)).sort((a, b) => a - b);
  const next = starts.find((s) => s > nowM) ?? starts[0] + DAY_MINUTES;
  const delta = next - nowM;
  const hours = Math.floor(delta / 60);
  const mins = Math.round(delta % 60);
  const at = DAY.find((b) => toMinutes(b.start) === next % DAY_MINUTES);
  return { hours, mins, at };
}

export default function KitchenClock() {
  // Rendered only after mount: the server has no idea what time it is where
  // the reader is, and guessing would hydrate wrong.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const nowM = now ? now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60 : 0;
  const active = now ? DAY.find((b) => isActive(b, nowM)) ?? DAY[DAY.length - 1] : null;
  const tone = accentOf(active?.accent);
  const next = now ? untilNext(nowM) : null;

  const clock = now
    ? now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "--:--";

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-kaadige px-6 py-16 text-mallige sm:px-12 sm:py-20">
      {/* The colour of whatever is happening bleeds into the room. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 size-[32rem] rounded-full blur-3xl"
        animate={{ backgroundColor: `${tone.hex}33` }}
        transition={{ duration: 1.2 }}
      />

      <div className="relative grid items-center gap-12 lg:grid-cols-[22rem_1fr] lg:gap-16">
        {/* ------------------------------------------------------- the dial */}
        <div className="mx-auto w-full max-w-[22rem]">
          <svg viewBox="0 0 320 320" className="w-full" role="img"
               aria-label={`Kitchen schedule dial. It is ${clock} and the kitchen is: ${active?.short ?? "loading"}.`}>
            {/* Unlit ring */}
            <circle
              cx={CX}
              cy={CY}
              r={R_ARC}
              fill="none"
              stroke="rgba(255,246,233,.09)"
              strokeWidth="14"
            />

            {/* Each block of the day, in its own colour */}
            {DAY.map((block) =>
              segmentsFor(block).map(([from, to], i) => {
                const on = now ? isActive(block, nowM) : false;
                return (
                  <motion.path
                    key={`${block.start}-${i}`}
                    d={arcPath(from, to)}
                    fill="none"
                    stroke={accentOf(block.accent).hex}
                    strokeWidth={on ? 16 : 10}
                    strokeLinecap="butt"
                    initial={{ opacity: 0.22 }}
                    animate={{ opacity: on ? 1 : 0.22 }}
                    transition={{ duration: 0.6 }}
                  />
                );
              }),
            )}

            {/* An hour dot every hour — the kolam grid, doing real work */}
            {Array.from({ length: 24 }).map((_, hour) => {
              const [x, y] = pointAt(hour * 60, R_DOT);
              const major = hour % 6 === 0;
              return (
                <circle
                  key={hour}
                  cx={x}
                  cy={y}
                  r={major ? 2.8 : 1.5}
                  fill="#fff6e9"
                  opacity={major ? 0.75 : 0.3}
                />
              );
            })}

            {/* Noon and midnight, so the ring is readable at a glance */}
            <text x={CX} y="26" textAnchor="middle" className="fill-mallige/45"
                  style={{ fontSize: 10, letterSpacing: "0.18em" }}>
              00
            </text>
            <text x={CX} y="304" textAnchor="middle" className="fill-mallige/45"
                  style={{ fontSize: 10, letterSpacing: "0.18em" }}>
              12
            </text>

            {/* The hand */}
            {now && (
              <g>
                <motion.line
                  x1={CX}
                  y1={CY}
                  x2={pointAt(nowM, R_ARC - 16)[0]}
                  y2={pointAt(nowM, R_ARC - 16)[1]}
                  stroke="#fff6e9"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity={0.8}
                />
                <motion.circle
                  cx={pointAt(nowM, R_ARC)[0]}
                  cy={pointAt(nowM, R_ARC)[1]}
                  r="7"
                  fill={tone.hex}
                  stroke="#fff6e9"
                  strokeWidth="2.5"
                />
                <motion.circle
                  cx={pointAt(nowM, R_ARC)[0]}
                  cy={pointAt(nowM, R_ARC)[1]}
                  r="7"
                  fill="none"
                  stroke={tone.hex}
                  strokeWidth="2"
                  animate={{ r: [7, 17], opacity: [0.6, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                />
              </g>
            )}

            {/* The time itself */}
            <text
              x={CX}
              y={CY - 4}
              textAnchor="middle"
              className="fill-mallige"
              style={{
                fontSize: 46,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {clock}
            </text>
            <text
              x={CX}
              y={CY + 20}
              textAnchor="middle"
              className="fill-mallige/45"
              style={{ fontSize: 9, letterSpacing: "0.22em" }}
            >
              YOUR TIME
            </text>
          </svg>
        </div>

        {/* -------------------------------------------------- what's happening */}
        <div>
          <p className="eyebrow flex items-center gap-2.5 text-turmeric">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-turmeric opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-turmeric" />
            </span>
            In the kitchen right now
          </p>

          <div className="mt-5 min-h-[10rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active?.start ?? "loading"}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="font-display text-[clamp(1.875rem,4.2vw,3.25rem)] font-extrabold leading-[0.98] tracking-tight">
                  {active ? active.title : "Checking the kitchen…"}
                </h2>
                <p className="mt-4 max-w-xl leading-relaxed text-mallige/70">
                  {active?.note}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            {active && (
              <Link
                href={active.href}
                className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
                style={{ background: tone.hex, color: tone.text }}
              >
                {active.cta}
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            )}
            {next && (
              <p className="text-sm text-mallige/55">
                Next:{" "}
                <span className="font-semibold text-mallige/85">{next.at?.short}</span>
                {" in "}
                <span className="tabular font-semibold text-turmeric">
                  {next.hours > 0 ? `${next.hours}h ` : ""}
                  {next.mins}m
                </span>
              </p>
            )}
          </div>

          {/* The whole day, so you can see where you landed in it */}
          <ol className="mt-10 grid gap-px border-t border-mallige/12 pt-6 sm:grid-cols-2">
            {DAY.map((block) => {
              const on = now ? isActive(block, nowM) : false;
              return (
                <li key={block.start}>
                  <Link
                    href={block.href}
                    className={cn(
                      "flex items-baseline gap-3 rounded-xl px-3 py-2 transition-colors",
                      on ? "bg-mallige/10" : "hover:bg-mallige/5",
                    )}
                  >
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full transition-opacity"
                      style={{
                        background: accentOf(block.accent).hex,
                        opacity: on ? 1 : 0.4,
                      }}
                    />
                    <span className="tabular text-xs font-bold text-mallige/45">
                      {block.start}
                    </span>
                    <span
                      className={cn(
                        "text-sm transition-colors",
                        on ? "font-bold text-mallige" : "text-mallige/55",
                      )}
                    >
                      {block.short}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
