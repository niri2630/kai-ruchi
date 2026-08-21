"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { LogOut, MapPin, Package, Plus, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/store/useAuth";
import { useCart } from "@/store/useCart";
import { formatDate, initials } from "@/lib/utils";
import { Field, Input, INDIAN_STATES, Select } from "@/components/ui/Field";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/States";

const BLANK_ADDRESS = {
  label: "Home",
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "Karnataka",
  pincode: "",
  is_default: false,
};

export default function AccountPage() {
  const router = useRouter();
  const { user, ready, setUser, logout } = useAuth();
  const resetCart = useCart((s) => s.reset);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(BLANK_ADDRESS);
  const [savingAddress, setSavingAddress] = useState(false);

  const addresses = useApi(() => api.addresses(), [user?.id], { skip: !user });
  const orders = useApi(() => api.orders(), [user?.id], { skip: !user });

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/account");
  }, [ready, user, router]);

  useEffect(() => {
    if (!user) return;
    setName(user.full_name);
    setPhone(user.phone ?? "");
    setDraft((current) => ({
      ...current,
      full_name: current.full_name || user.full_name,
      phone: current.phone || user.phone || "",
    }));
  }, [user]);

  if (!ready || !user) return <div className="px-6 pt-40" />;

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      setUser(await api.updateProfile({ full_name: name.trim(), phone: phone.trim() }));
      toast.success("Saved.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't save that.");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingAddress(true);
    try {
      await api.addAddress(draft);
      toast.success("Address saved.");
      setAdding(false);
      setDraft(BLANK_ADDRESS);
      addresses.reload();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't save that address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const removeAddress = async (id: number) => {
    try {
      await api.deleteAddress(id);
      addresses.reload();
      toast("Address removed.");
    } catch {
      toast.error("Couldn't remove that address.");
    }
  };

  const signOut = () => {
    logout();
    resetCart();
    toast("Signed out.");
    router.push("/");
  };

  const recent = orders.data?.slice(0, 3) ?? [];

  return (
    <>
      <PageHeader eyebrow="Your account" title={user.full_name}>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span className="grid size-16 place-items-center rounded-full bg-indigo text-xl font-bold text-white">
            {initials(user.full_name)}
          </span>
          <div className="text-sm text-ash">
            <p className="font-semibold text-kaadige">{user.email}</p>
            <p>Shopping here since {formatDate(user.created_at)}</p>
          </div>
          <Button
            onClick={signOut}
            variant="glass"
            size="sm"
            className="ml-auto"
            icon={<LogOut className="size-4" />}
          >
            Sign out
          </Button>
        </div>
      </PageHeader>

      <div className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 lg:grid-cols-2">
        {/* ------------------------------------------------------ profile */}
        <form onSubmit={saveProfile} className="glass rounded-[var(--radius-jar)] p-6 sm:p-8">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Your details</h2>
          <div className="mt-5 space-y-4">
            <Field label="Full name">
              <Input value={name} onChange={(e) => setName(e.target.value)} minLength={2} />
            </Field>
            <Field label="Phone" hint="For delivery updates">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 00000"
                inputMode="tel"
              />
            </Field>
            <Field label="Email" hint="Can't be changed">
              <Input value={user.email} disabled className="opacity-60" />
            </Field>
          </div>
          <Button type="submit" loading={savingProfile} variant="clay" size="md" className="mt-5">
            Save changes
          </Button>
        </form>

        {/* ---------------------------------------------------- addresses */}
        <section className="glass rounded-[var(--radius-jar)] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              Saved addresses
            </h2>
            <Button
              onClick={() => setAdding((open) => !open)}
              variant="ghost"
              size="sm"
              icon={<Plus className="size-4" />}
            >
              {adding ? "Cancel" : "Add"}
            </Button>
          </div>

          <AnimatePresence>
            {adding && (
              <motion.form
                onSubmit={saveAddress}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Field label="Label">
                    <Input
                      value={draft.label}
                      onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                      placeholder="Home, Hostel, Office"
                    />
                  </Field>
                  <Field label="Name">
                    <Input
                      value={draft.full_name}
                      onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
                      required
                    />
                  </Field>
                  <Field label="Phone" className="sm:col-span-2">
                    <Input
                      value={draft.phone}
                      onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                      required
                    />
                  </Field>
                  <Field label="Address" className="sm:col-span-2">
                    <Input
                      value={draft.line1}
                      onChange={(e) => setDraft({ ...draft, line1: e.target.value })}
                      required
                    />
                  </Field>
                  <Field label="Landmark" hint="Optional" className="sm:col-span-2">
                    <Input
                      value={draft.line2}
                      onChange={(e) => setDraft({ ...draft, line2: e.target.value })}
                    />
                  </Field>
                  <Field label="City">
                    <Input
                      value={draft.city}
                      onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                      required
                    />
                  </Field>
                  <Field label="PIN code">
                    <Input
                      value={draft.pincode}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                        })
                      }
                      inputMode="numeric"
                      required
                    />
                  </Field>
                  <Field label="State" className="sm:col-span-2">
                    <Select
                      value={draft.state}
                      onChange={(e) => setDraft({ ...draft, state: e.target.value })}
                    >
                      {INDIAN_STATES.map((state) => (
                        <option key={state}>{state}</option>
                      ))}
                    </Select>
                  </Field>
                  <label className="flex items-center gap-2.5 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={draft.is_default}
                      onChange={(e) => setDraft({ ...draft, is_default: e.target.checked })}
                      className="size-4 accent-[var(--color-chilli)]"
                    />
                    Use this one by default at checkout
                  </label>
                </div>
                <Button
                  type="submit"
                  loading={savingAddress}
                  variant="leaf"
                  size="md"
                  className="mt-4 w-full"
                >
                  Save address
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-5 space-y-3">
            {addresses.loading ? (
              <div className="skeleton h-24 rounded-2xl" />
            ) : (addresses.data?.length ?? 0) === 0 ? (
              <p className="rounded-2xl bg-kaadige/5 p-5 text-center text-sm text-ash">
                No addresses saved. Add one and checkout gets a lot shorter.
              </p>
            ) : (
              addresses.data!.map((address) => (
                <motion.div
                  key={address.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 rounded-2xl border border-hairline/70 bg-white/45 p-4"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-chilli" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="flex items-center gap-2 font-bold">
                      {address.label}
                      {address.is_default && (
                        <span className="rounded-full bg-leaf/12 px-2 py-0.5 text-[0.625rem] font-black uppercase tracking-widest text-leaf">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-ash">
                      {address.full_name} · {address.phone}
                      <br />
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}
                      <br />
                      {address.city}, {address.state} {address.pincode}
                    </p>
                  </div>
                  <button
                    onClick={() => removeAddress(address.id)}
                    aria-label="Remove address"
                    className="grid size-8 shrink-0 place-items-center rounded-full text-ash transition hover:bg-chilli/10 hover:text-chilli"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* ------------------------------------------------------- orders */}
        <section className="glass rounded-[var(--radius-jar)] p-6 sm:p-8 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              Recent orders
            </h2>
            <ButtonLink href="/orders" variant="ghost" size="sm">
              See all
            </ButtonLink>
          </div>

          {recent.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-kaadige/5 p-8 text-center">
              <Package className="mx-auto size-6 text-ash" />
              <p className="mt-3 text-sm text-ash">Nothing ordered yet.</p>
              <ButtonLink href="/products" variant="clay" size="sm" className="mt-4">
                Open the pantry
              </ButtonLink>
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-hairline/60">
              {recent.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.order_number}`}
                    className="flex items-center justify-between gap-4 py-4 transition hover:opacity-70"
                  >
                    <div>
                      <p className="tabular font-display text-lg font-extrabold tracking-tight">
                        {order.order_number}
                      </p>
                      <p className="text-xs capitalize text-ash">
                        {formatDate(order.placed_at)} · {order.status.replace(/_/g, " ")}
                      </p>
                    </div>
                    <span className="tabular font-display text-lg font-extrabold">
                      ₹{Number(order.total).toLocaleString("en-IN")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
