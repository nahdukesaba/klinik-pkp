/** Loading state untuk /login/forgot-password. */

import { AuthCardSkeleton } from "@/components/shared";

export default function ForgotPasswordLoading() {
  return (
    <AuthCardSkeleton
      titleWidthClass="w-32"
      subtitleWidthClass="w-48"
      fieldCount={3}
    />
  );
}
