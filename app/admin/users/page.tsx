import { redirect } from "next/navigation";

/** Roles live in Settings now. */
export default function UsersRedirect() {
  redirect("/admin/settings");
}
