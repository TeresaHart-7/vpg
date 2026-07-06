import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ type?: string }>;
};

export default async function LegacyNewChatRedirect({ searchParams }: Props) {
  const { type } = await searchParams;
  const query = type ? `?type=${type}` : "";
  redirect(`/messages/chat/new${query}`);
}
