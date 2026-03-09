// Reels is full-screen — no extra padding or scroll wrappers from the shell
export default function ReelsLayout({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 z-30 bg-black">{children}</div>;
}
