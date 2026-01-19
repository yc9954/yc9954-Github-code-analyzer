"use client";

import * as React from "react";
import { Github } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGitHubSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

export function SignInPage({
  heroImageSrc = "https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80",
  testimonials = [],
  onSignIn,
  onGitHubSignIn,
  onResetPassword,
  onCreateAccount,
}: SignInPageProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-black">
      {/* Left side - Sign in form */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-black">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-white/60">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={onSignIn} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#7aa2f7] focus:ring-[#7aa2f7]/20"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <button
                    type="button"
                    onClick={onResetPassword}
                    className="text-sm font-medium text-[#7aa2f7] hover:text-[#7dcfff] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#7aa2f7] focus:ring-[#7aa2f7]/20"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#7aa2f7] focus:ring-[#7aa2f7]/20"
              />
              <Label htmlFor="remember-me" className="ml-2 text-sm text-white/60">
                Remember me
              </Label>
            </div>

            <div className="space-y-3">
              <Button type="submit" className="w-full bg-[#238636] hover:bg-[#2ea043] text-white border-0" size="lg">
                Sign in
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                size="lg"
                onClick={onGitHubSignIn}
              >
                <Github className="mr-2 h-4 w-4" />
                Continue with GitHub
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-white/60">Don't have an account? </span>
              <button
                type="button"
                onClick={onCreateAccount}
                className="font-medium text-[#7aa2f7] hover:text-[#7dcfff] hover:underline"
              >
                Create account
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Hero image */}
      <div className="hidden lg:block relative bg-muted">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImageSrc})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
    </div>
  );
}
