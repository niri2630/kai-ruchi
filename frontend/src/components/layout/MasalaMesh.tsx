/**
 * The masala mesh — five spice-coloured blobs drifting behind the whole site.
 * Every glass surface on the page is showing you this, blurred, the way a
 * pickle jar shows you what is inside it.
 *
 * Pure CSS animation: no main-thread JS, no canvas, no scroll listener.
 */
const BLOBS = [
  { color: "#f5a31a", size: 46, top: -4, left: 4, anim: "drift-a", duration: 26, delay: 0 },
  { color: "#e23e2e", size: 40, top: 18, left: 58, anim: "drift-b", duration: 32, delay: -6 },
  { color: "#1e7a54", size: 38, top: 58, left: 12, anim: "drift-c", duration: 29, delay: -12 },
  { color: "#4b2e83", size: 34, top: 70, left: 64, anim: "drift-a", duration: 36, delay: -18 },
  { color: "#e0457b", size: 30, top: 34, left: 34, anim: "drift-b", duration: 24, delay: -3 },
];

export default function MasalaMesh() {
  return (
    <>
      <div className="masala-mesh" aria-hidden>
        {BLOBS.map((blob, i) => (
          <div
            key={i}
            className="masala-blob"
            style={{
              width: `${blob.size}vmax`,
              height: `${blob.size}vmax`,
              top: `${blob.top}%`,
              left: `${blob.left}%`,
              background: `radial-gradient(circle at 35% 35%, ${blob.color}, transparent 68%)`,
              animation: `${blob.anim} ${blob.duration}s ease-in-out ${blob.delay}s infinite`,
            }}
          />
        ))}
      </div>
      <div className="grain" aria-hidden />
    </>
  );
}
