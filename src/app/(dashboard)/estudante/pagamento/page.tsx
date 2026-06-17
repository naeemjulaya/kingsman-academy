import { Suspense } from "react";
import CheckoutContent from "./CheckoutContent";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF48FF] border-t-transparent" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}