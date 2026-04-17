/** Loading state untuk /login. */

import { AuthCardSkeleton } from "@/components/shared";

export default function LoginLoading() {
  return (
    <AuthCardSkeleton
      titleWidthClass="w-24"
      subtitleWidthClass="w-20"
      fieldCount={4}
    />
  );
}
