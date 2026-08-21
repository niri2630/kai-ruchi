import { ButtonLink } from "@/components/ui/Button";
import { KolamMark } from "@/components/ui/Kolam";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-lg flex-col items-center justify-center px-6 py-32 text-center">
      <KolamMark size={48} className="text-chilli" />
      <p className="tabular mt-8 font-display text-[8rem] font-extrabold leading-none tracking-tight text-turmeric">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
        Nothing on this shelf
      </h1>
      <p className="mt-3 text-ash">
        The page you were after has moved, or never existed. The pantry is still where you
        left it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/products" size="lg">
          Open the pantry
        </ButtonLink>
        <ButtonLink href="/" variant="glass" size="lg">
          Back home
        </ButtonLink>
      </div>
    </div>
  );
}
