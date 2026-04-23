"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PasswordInput,
  PasswordInputStrengthChecker,
} from "@/components/ui/password-input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

interface AccountContentProps {
  userId: string;
  email: string;
  initialFullName: string | null;
  initialAvatarUrl: string | null;
}

export function AccountContent({
  userId,
  email,
  initialFullName,
  initialAvatarUrl,
}: AccountContentProps) {
  const supabase = createClient();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialFullName ?? "");
  const [draftName, setDraftName] = useState(initialFullName ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialAvatarUrl,
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);

  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isNameOpen, setIsNameOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const initials =
    (displayName || email || "U").trim().charAt(0).toUpperCase() || "U";

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
    setAvatarError(null);
    setAvatarSuccess(null);
  };

  const handleSaveAvatar = async () => {
    setAvatarError(null);
    setAvatarSuccess(null);

    if (!avatarFile) {
      setAvatarError("Select an image to upload.");
      return;
    }

    setIsSavingAvatar(true);
    try {
      const ext = avatarFile.name.split(".").pop() ?? "jpg";
      const avatarUrl = await uploadImage(
        avatarFile,
        "avatars",
        `${userId}/avatar.${ext}`,
      );

      const { error } = await supabase
        .from("users")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId);

      if (error) throw error;

      setAvatarSuccess("Profile picture updated.");
      setAvatarFile(null);
      setAvatarUrl(avatarUrl);
      setAvatarPreview(avatarUrl);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setIsAvatarOpen(false);
    } catch (err) {
      setAvatarError(
        err instanceof Error
          ? err.message
          : "Failed to update profile picture.",
      );
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleSaveName = async () => {
    setNameError(null);
    setNameSuccess(null);

    const trimmed = draftName.trim();
    if (trimmed.length < 2) {
      setNameError("Username must be at least 2 characters.");
      return;
    }

    setIsSavingName(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ full_name: trimmed })
        .eq("id", userId);

      if (error) throw error;

      setNameSuccess("Username updated.");
      setDisplayName(trimmed);
      setIsNameOpen(false);
    } catch (err) {
      setNameError(
        err instanceof Error ? err.message : "Failed to update username.",
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSavePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setPasswordSuccess("Password updated.");
      setPassword("");
      setConfirmPassword("");
      setIsPasswordOpen(false);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to update password.",
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
        <div className="flex items-start gap-3">
          <div className="w-1 rounded-full bg-primary self-stretch" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Account</h1>
            <p className="text-muted-foreground">
              Manage your profile details and security settings.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Profile picture</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (objectUrlRef.current) {
                      URL.revokeObjectURL(objectUrlRef.current);
                      objectUrlRef.current = null;
                    }
                    setAvatarPreview(avatarUrl);
                    setAvatarFile(null);
                    setAvatarError(null);
                    setAvatarSuccess(null);
                    setIsAvatarOpen(true);
                  }}
                >
                  Change photo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-muted flex items-center justify-center text-xl font-semibold text-muted-foreground">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Upload a new profile picture
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG or JPG, recommended 400x400.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Username</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDraftName(displayName);
                    setNameError(null);
                    setNameSuccess(null);
                    setIsNameOpen(true);
                  }}
                >
                  Change username
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Current username</p>
              <p className="text-lg font-semibold text-foreground">
                {displayName || "Not set"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Signed-in email</p>
              <p className="text-lg font-semibold text-foreground">{email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Password</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPassword("");
                    setConfirmPassword("");
                    setPasswordError(null);
                    setPasswordSuccess(null);
                    setIsPasswordOpen(true);
                  }}
                >
                  Change password
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use a strong password to keep your account secure.
              </p>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Sign out</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You will be redirected to the login page after signing out.
              </p>
              <Button
                type="button"
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={isAvatarOpen}
        onOpenChange={(open) => {
          setIsAvatarOpen(open);
          if (!open) {
            setAvatarError(null);
            setAvatarSuccess(null);
            setAvatarFile(null);
            if (objectUrlRef.current) {
              URL.revokeObjectURL(objectUrlRef.current);
              objectUrlRef.current = null;
            }
            setAvatarPreview(avatarUrl);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update profile picture</DialogTitle>
            <DialogDescription>
              Choose a new photo to personalize your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-muted flex items-center justify-center text-xl font-semibold text-muted-foreground">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="avatar">Profile picture</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>
            {avatarError && (
              <p className="text-sm text-destructive">{avatarError}</p>
            )}
            {avatarSuccess && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {avatarSuccess}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSaveAvatar}
              disabled={isSavingAvatar}
            >
              {isSavingAvatar ? "Updating..." : "Save photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isNameOpen}
        onOpenChange={(open) => {
          setIsNameOpen(open);
          if (!open) {
            setNameError(null);
            setNameSuccess(null);
            setDraftName(displayName);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change username</DialogTitle>
            <DialogDescription>
              Update the name shown on your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Your name"
            />
            {nameError && (
              <p className="text-sm text-destructive">{nameError}</p>
            )}
            {nameSuccess && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {nameSuccess}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSaveName}
              disabled={isSavingName}
            >
              {isSavingName ? "Saving..." : "Save username"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPasswordOpen}
        onOpenChange={(open) => {
          setIsPasswordOpen(open);
          if (!open) {
            setPassword("");
            setConfirmPassword("");
            setPasswordError(null);
            setPasswordSuccess(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Create a strong password with at least 8 characters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">New password</Label>
              <TooltipProvider>
                <PasswordInput
                  id="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a new password"
                >
                  <PasswordInputStrengthChecker />
                </PasswordInput>
              </TooltipProvider>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
              />
            </div>
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {passwordSuccess}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSavePassword}
              disabled={isSavingPassword}
            >
              {isSavingPassword ? "Updating..." : "Update password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
