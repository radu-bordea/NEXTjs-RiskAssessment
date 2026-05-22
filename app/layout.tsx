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
            <header className="flex justify-between items-center px-2 md:px-16 h-20 border-b border-zinc-100 dark:border-zinc-800">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <ModeToggle />
              </div>

              <Link href="/" className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-slate-600 dark:text-white">
                  Sustainable Maritime Excellence
                </h2>
              </Link>

              {/* Auth */}
              <div className="flex items-center gap-3">
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
                  <div className="flex items-center gap-3">
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
                              "border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2",
                          },
                        }}
                      />
                    )}

                    <div className="flex items-center gap-3">
                      {/* Show user's first name */}
                      {clerkUser?.firstName && (
                        <span className="font-bold tracking-tight text-slate-600 dark:text-white">
                         Vessel: {clerkUser.firstName} {clerkUser.lastName}
                        </span>
                      )}
                      <UserButton
                        appearance={{
                          elements: {
                            avatarBox: "w-9 h-9",
                          },
                        }}
                      />
                    </div>
                  </div>
                </Show>
              </div>
            </header>

            {children}
          </ThemeProvider>
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
