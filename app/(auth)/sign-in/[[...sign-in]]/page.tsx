import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* Left panel */}
      <div className="bg-[#04342C] flex flex-col justify-between p-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1D9E75]" />
            <span className="font-bold text-[#9FE1CB] tracking-wide text-sm">
              MarineGuard
            </span>
          </div>
          <p className="text-[#5DCAA5] text-xs tracking-widest uppercase mt-1">
            Risk Assessment Platform
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <h1 className="text-[#E1F5EE] text-3xl font-bold leading-tight">
            Welcome <br />
            <em className="font-light text-[#5DCAA5] not-italic">
              back aboard.
            </em>
          </h1>
          <p className="text-[#5DCAA5] text-sm leading-relaxed max-w-[220px]">
            Sign in to access your fleet's risk register and assessment
            dashboard.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { icon: "🚢", text: "Fleet-wide risk visibility" },
              { icon: "🛡️", text: "Role-based access control" },
              { icon: "📊", text: "Real-time dashboard & filters" },
            ].map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-3 text-[#9FE1CB] text-sm"
              >
                <span className="w-7 h-7 rounded-md bg-[#085041] border border-[#0F6E56] flex items-center justify-center text-xs">
                  {f.icon}
                </span>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-[#085041] text-xs">
          © 2025 MarineGuard. All rights reserved.
        </p>
      </div>

      {/* Right panel — Clerk handles the form */}
      <div className="flex items-center justify-center p-8 bg-white dark:bg-zinc-950">
        <SignIn
          forceRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full max-w-sm",
              card: "shadow-none border border-zinc-200 dark:border-zinc-800 rounded-xl p-6",
              headerTitle: "text-lg font-semibold",
              formButtonPrimary:
                "bg-[#0F6E56] hover:bg-[#085041] text-white text-sm",
              footerActionLink: "text-[#1D9E75] hover:text-[#0F6E56]",
            },
          }}
        />
      </div>
    </div>
  );
}
