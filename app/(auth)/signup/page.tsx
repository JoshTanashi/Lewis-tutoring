import { redirect } from "next/navigation";

/** Signup IS the onboarding now — one friendly wizard, account created right
 *  before payment so no dead accounts pile up. */
export default async function SignupRedirect({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const { package: pkg } = await searchParams;
  redirect(pkg ? `/onboarding?package=${pkg}` : "/onboarding");
}
