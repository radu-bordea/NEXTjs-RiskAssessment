import type { Metadata } from "next";

import {
  ClerkProvider,
  OrganizationSwitcher,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

import { ThemeProvider } from "@/components/theme-provider";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import Image from "next/image";

import { syncUser } from "./actions/syncUsers";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { getUserRole } from "./actions/getUIserRole";
import { currentUser } from "@clerk/nextjs/server";
import { log } from "console";

import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MarineGuard — Risk Assessment",
  description: "Maritime risk assessment platform for shipping companies",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Sync logged-in Clerk users into Prisma
  await syncUser();

  // Get user role and pass it down via context (optional, can also be done in individual pages)
  const user = await getUserRole();
  log("User role in layout:", user);
  // inside the layout function, after syncUser():
  const clerkUser = await currentUser();

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="flex flex-col md:flex-row md:justify-between md:items-center px-2 md:px-16 py-3 md:h-20 border-b border-zinc-100 dark:border-zinc-800 gap-2 md:gap-0">
              {/* Top row on mobile: logo + auth */}
              <div className="flex justify-between items-center md:contents">
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <ModeToggle />
                </div>

                {/* Auth */}
                <div className="flex items-center gap-2 md:gap-3 order-3 md:order-0">
                  {/* Signed out */}
                  <Show when="signed-out">
                    <SignInButton>
                      <button className="text-sm px-4 py-2 rounded-lg border border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE] dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                        Sign in
                      </button>
                    </SignInButton>
                  </Show>

                  {/* Signed in */}
                  <Show when="signed-in">
                    <div className="flex flex-wrap justify-end items-center gap-2 md:gap-3">
                      {user === "ADMIN" && (
                        <OrganizationSwitcher
                          hidePersonal
                          afterCreateOrganizationUrl="/"
                          afterLeaveOrganizationUrl="/"
                          afterSelectOrganizationUrl="/"
                          appearance={{
                            variables: {
                              colorText: "#ffffff",
                              colorBackground: "#1f1f23",
                              colorInputBackground: "#2a2a30",
                              colorNeutral: "#6d8777",
                            },
                            elements: {
                              rootBox: "w-auto",
                              organizationSwitcherTrigger:
                                "border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-xs md:text-sm md:px-3 md:py-2",
                            },
                          }}
                        />
                      )}

                      <div className="flex flex-wrap justify-end items-center gap-2 md:gap-3">
                        {/* Show user's first name */}
                        {clerkUser?.firstName && (
                          <span className="text-xs md:text-base font-bold tracking-tight text-slate-600 dark:text-white whitespace-nowrap">
                            Vessel: {clerkUser.firstName} {clerkUser.lastName}
                          </span>
                        )}

                        {/* Manage Users link — ADMIN only */}
                        {user === "ADMIN" && (
                          <Link
                            href="/admin/users"
                            className="text-xs px-2.5 py-1.5 md:px-3 rounded-lg border border-[#A8D5B5] text-[#1A7A4A] hover:bg-[#EEF5F0] transition-colors font-medium whitespace-nowrap"
                          >
                            Manage Users
                          </Link>
                        )}

                        <UserButton
                          appearance={{
                            elements: {
                              avatarBox: "w-8 h-8 md:w-9 md:h-9",
                            },
                          }}
                        />
                      </div>
                    </div>
                  </Show>
                </div>
              </div>

              {/* Title: second row on mobile, centered inline on desktop */}
              <Link
                href="/"
                className="flex justify-center md:justify-start items-center gap-3 order-2 md:order-none"
              >
                <h2 className="text-lg md:text-2xl font-bold tracking-tight text-slate-600 dark:text-white text-center">
                  Sustainable Maritime Excellence
                </h2>
              </Link>
            </header>

            {children}
          </ThemeProvider>
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
