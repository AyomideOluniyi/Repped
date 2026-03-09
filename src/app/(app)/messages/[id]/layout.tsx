// Conversation is full-screen — escape the app shell's scroll container
export default function ConversationLayout({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 z-30 bg-background">{children}</div>;
}
