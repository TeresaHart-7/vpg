import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ threadId: string }>;
};

export default async function LegacyChatRedirect({ params }: Props) {
  const { threadId } = await params;
  redirect(`/messages/chat/${threadId}`);
}
