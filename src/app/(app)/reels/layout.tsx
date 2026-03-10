// Reels is full-screen — accounts for desktop sidebar
export default function ReelsLayout({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 z-30 bg-black">{children}</div>;
}
