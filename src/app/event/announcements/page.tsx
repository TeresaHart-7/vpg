import { redirect } from "next/navigation";

export default function LegacyAnnouncementsRedirect() {
  redirect("/messages/announcements");
}
