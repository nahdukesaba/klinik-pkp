/** Loading state untuk /reset-password. */

import { AuthCardSkeleton } from "@/components/shared";

export default function ResetPasswordLoading() {
  return (
    <AuthCardSkeleton
      titleWidthClass="w-32"
      subtitleWidthClass="w-48"
      fieldCount={2}
    />
  );
}
