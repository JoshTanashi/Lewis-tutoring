export type Role = "student" | "parent" | "tutor" | "super_admin";

/** Where each role lands after signing in. Safe for client & server. */
export function homePathFor(role: Role): string {
  switch (role) {
    case "student":
      return "/student";
    case "parent":
      return "/parent";
    case "tutor":
      return "/tutor";
    case "super_admin":
      return "/admin";
  }
}
