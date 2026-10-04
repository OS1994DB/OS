import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatRoom } from "@/components/ChatRoom";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Chat</h1>
        <p className="mt-1 text-sm text-ink-600">Team chat for all staff. Don&apos;t put care records here — use daily notes for those.</p>
      </div>
      <ChatRoom meId={session!.user.id} />
    </div>
  );
}
