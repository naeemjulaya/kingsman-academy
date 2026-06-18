import { Suspense } from "react";
import ProfileContent from "./ProfileContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ProfileContent />
    </Suspense>
  );
}