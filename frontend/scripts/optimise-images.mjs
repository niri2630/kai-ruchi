/**
 * Squash the generated 4K PNGs into web-sized WebP.
 *
 * Higgsfield returns ~10 MB PNGs, which is fine as a master and hopeless as a
 * page asset. This rewrites each one at the size it is actually displayed at,
 * then removes the original.
 *
 *   node scripts/optimise-images.mjs
 */
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PUBLIC = path.join(process.cwd(), "public");

const JOBS = [
  { dir: "images/products", width: 1000, height: 1250, quality: 80 },
  { dir: "images/categories", width: 1600, height: 900, quality: 78 },
  { dir: "images/about", width: 2000, height: 858, quality: 78 },
];

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

let before = 0;
let after = 0;

for (const job of JOBS) {
  const dir = path.join(PUBLIC, job.dir);
  let files;
  try {
    files = await readdir(dir);
  } catch {
    continue;
  }

  for (const file of files.filter((f) => f.endsWith(".png"))) {
    const from = path.join(dir, file);
    const to = from.replace(/\.png$/, ".webp");

    const original = (await stat(from)).size;
    await sharp(from)
      .resize(job.width, job.height, { fit: "cover", position: "attention" })
      .webp({ quality: job.quality, effort: 6 })
      .toFile(to);
    const size = (await stat(to)).size;

    before += original;
    after += size;
    await unlink(from);
    console.log(`${job.dir}/${file.replace(".png", ".webp")}  ${kb(original)} -> ${kb(size)}`);
  }
}

// The video poster stays JPEG: <video poster> is the one place where broad
// format support still matters more than a few kilobytes.
const heroSource = path.join(PUBLIC, "images/hero-source.png");
try {
  await stat(heroSource);
  const original = (await stat(heroSource)).size;
  await sharp(heroSource)
    .resize(1920, 1080, { fit: "cover" })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(path.join(PUBLIC, "images/hero-poster.jpg"));
  const size = (await stat(path.join(PUBLIC, "images/hero-poster.jpg"))).size;
  before += original;
  after += size;
  await unlink(heroSource);
  console.log(`images/hero-poster.jpg  ${kb(original)} -> ${kb(size)}`);
} catch {
  // Already processed.
}

console.log(
  `\nTotal ${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024 / 1024).toFixed(1)} MB` +
    ` (${Math.round((1 - after / before) * 100)}% smaller)`,
);
