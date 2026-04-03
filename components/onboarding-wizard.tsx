"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Home,
  Truck,
  MapPin,
  Camera,
  ChevronLeft,
  Recycle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/lib/upload-image";
import { completeOnboarding } from "../app/onboarding/actions";

const TOTAL_STEPS = 4;

type Role = "resident" | "driver";

interface Props {
  userId: string;
  userEmail: string;
}

export default function OnboardingWizard({ userId, userEmail }: Props) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canContinue = () => {
    if (step === 1) return role !== null;
    if (step === 2) return fullName.trim().length >= 2;
    return true;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    setError(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleFinish = () => {
    setError(null);
    startTransition(async () => {
      try {
        let avatarUrl: string | null = null;
        if (avatarFile) {
          const ext = avatarFile.name.split(".").pop();
          avatarUrl = await uploadImage(
            avatarFile,
            "avatars",
            `${userId}/avatar.${ext}`,
          );
        }
        await completeOnboarding({
          role: role!,
          full_name: fullName.trim(),
          avatar_url: avatarUrl,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  return (
    <div className="min-h-svh bg-background flex flex-col">
      <div className="w-full max-w-lg mx-auto flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-center gap-3 px-6 py-5">
          <Recycle className="size-6 text-primary" strokeWidth={2.5} />
          <span className="font-bold text-xl tracking-tight text-foreground">
            HakotLahat
          </span>
        </header>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 pb-6">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i < step ? "bg-primary" : "bg-border",
                i === step - 1 ? "flex-[2]" : "flex-1",
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 flex flex-col px-6 pb-8">
          {step === 1 && (
            <StepRole role={role} onSelect={setRole} email={userEmail} />
          )}
          {step === 2 && (
            <StepName value={fullName} onChange={setFullName} />
          )}
          {step === 3 && <StepLocation />}
          {step === 4 && (
            <StepPhoto
              preview={avatarPreview}
              fileInputRef={fileInputRef}
              onChange={handleAvatarChange}
            />
          )}

          {error && (
            <p className="mt-4 text-sm text-destructive text-center">{error}</p>
          )}

          {/* Navigation */}
          <div className="mt-auto pt-8 flex flex-col gap-3">
            {step < TOTAL_STEPS ? (
              <Button
                className="w-full rounded-full py-6 text-base font-semibold"
                disabled={!canContinue()}
                onClick={handleNext}
              >
                Continue
              </Button>
            ) : (
              <Button
                className="w-full rounded-full py-6 text-base font-semibold"
                disabled={isPending}
                onClick={handleFinish}
              >
                {isPending ? "Setting up your account..." : "Get Started"}
              </Button>
            )}
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isPending}
                className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="size-4" />
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step 1: Role ────────────────────────────────────────────────────── */
function StepRole({
  role,
  onSelect,
  email,
}: {
  role: Role | null;
  onSelect: (r: Role) => void;
  email: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{email}</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          What&apos;s your role?
        </h1>
        <p className="text-muted-foreground mt-1">
          Choose how you&apos;ll use HakotLahat.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <RoleCard
          selected={role === "resident"}
          onSelect={() => onSelect("resident")}
          icon={<Home className="size-7" />}
          label="Resident"
          description="Request waste pickups and track your collections."
        />
        <RoleCard
          selected={role === "driver"}
          onSelect={() => onSelect("driver")}
          icon={<Truck className="size-7" />}
          label="Driver"
          description="Navigate optimized routes and manage your pickups."
        />
      </div>
    </div>
  );
}

function RoleCard({
  selected,
  onSelect,
  icon,
  label,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left bg-card rounded-3xl p-5 flex items-start gap-4 transition-all border-2",
        selected
          ? "border-primary shadow-sm"
          : "border-transparent shadow-xs",
      )}
    >
      <div
        className={cn(
          "rounded-2xl p-3 shrink-0 transition-colors",
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </div>
      <div className="pt-0.5">
        <p className="font-semibold text-base text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </button>
  );
}

/* ── Step 2: Name ────────────────────────────────────────────────────── */
function StepName({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          What&apos;s your name?
        </h1>
        <p className="text-muted-foreground mt-1">
          This is how you&apos;ll appear in the app.
        </p>
      </div>
      <div className="bg-card rounded-3xl p-5 flex flex-col gap-3">
        <Label htmlFor="full-name" className="text-sm font-semibold">
          Full name
        </Label>
        <Input
          id="full-name"
          placeholder="e.g. Maria Santos"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl bg-muted border-0 h-12 text-base"
          autoFocus
        />
      </div>
    </div>
  );
}

/* ── Step 3: Location ────────────────────────────────────────────────── */
function StepLocation() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Where are you located?
        </h1>
        <p className="text-muted-foreground mt-1">
          Your location helps us route pickups efficiently.
        </p>
      </div>
      <div className="bg-card rounded-3xl p-5 flex flex-col gap-4">
        <div className="bg-muted rounded-2xl h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <MapPin className="size-8 text-primary" />
          <p className="text-sm font-medium">Map coming soon</p>
          <p className="text-xs text-center px-4">
            You&apos;ll be able to pin your exact location on a map here.
          </p>
        </div>
        <div className="flex items-center gap-2 px-1">
          <div className="size-2 rounded-full bg-primary/60 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your pickup address will be set up after launch.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Step 4: Profile picture ─────────────────────────────────────────── */
function StepPhoto({
  preview,
  fileInputRef,
  onChange,
}: {
  preview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Add a profile photo
        </h1>
        <p className="text-muted-foreground mt-1">
          Help others recognise you. You can skip this for now.
        </p>
      </div>

      <div className="bg-card rounded-3xl p-6 flex flex-col items-center gap-5">
        {/* Avatar preview */}
        <div className="relative">
          <div className="size-28 rounded-full bg-muted overflow-hidden flex items-center justify-center">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Profile preview"
                className="size-full object-cover"
              />
            ) : (
              <User className="size-12 text-muted-foreground" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2.5 border-4 border-card shadow-sm"
          >
            <Camera className="size-4" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
        />

        <Button
          type="button"
          variant="outline"
          className="rounded-full px-6"
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? "Change photo" : "Upload photo"}
        </Button>
      </div>
    </div>
  );
}
