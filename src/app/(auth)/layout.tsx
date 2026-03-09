import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent-green/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-orange/5 blur-3xl" />
      </div>

      {/* Logo header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-accent-green flex items-center justify-center shadow-glow">
            <span className="text-xl font-black font-display text-background">R</span>
          </div>
          <span className="text-xl font-black font-display text-text-primary tracking-tight">
            REPPED
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}
