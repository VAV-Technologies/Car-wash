import { ChatPane } from '@/components/ai/ChatPane'

export default async function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params
  return <ChatPane threadId={threadId} />
}
