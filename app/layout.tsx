import type { Metadata } from "next";

import {
  ClerkProvider,
  OrganizationSwitcher,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { syncUser } from "./actions/syncUsers";
import Link from "next/link";

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

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="flex justify-between items-center px-6 h-16 border-b border-zinc-100 dark:border-zinc-800">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1D9E75]" />

              <span className="font-bold tracking-wide text-sm">
                <Link href="/">MarineGuard</Link>
              </span>
            </div>

            {/* Auth */}
            <div className="flex items-center gap-3">
              {/* Signed out */}
              <Show when="signed-out">
                <SignInButton>
                  <button className="text-sm px-4 py-2 rounded-lg border border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE] transition-colors cursor-pointer">
                    Sign in
                  </button>
                </SignInButton>

                {/* KEEP DURING DEVELOPMENT */}
                {/* REMOVE LATER FOR INVITE-ONLY ACCESS */}

                {/* <SignUpButton>
                  <button className="text-sm px-4 py-2 rounded-lg bg-[#0F6E56] text-[#E1F5EE] hover:bg-[#085041] transition-colors cursor-pointer">
                    Sign up
                  </button>
                </SignUpButton> */}
              </Show>

              {/* Signed in */}
              <Show when="signed-in">
                <div className="flex items-center gap-3">
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
                        colorNeutral: "#BEBEBE",
                      },
                      elements: {
                        rootBox: "w-auto",
                        organizationSwitcherTrigger:
                          "border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2",
                      },
                    }}
                  />

                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9",
                      },
                    }}
                  />
                </div>
              </Show>
            </div>
          </header>

          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
