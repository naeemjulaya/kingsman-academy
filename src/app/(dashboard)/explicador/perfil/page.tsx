import { Suspense } from "react";
import ProfilePage from "../../estudante/perfil/page";

export const dynamic = "force-dynamic";

export default function TutorProfilePage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF48FF] border-t-transparent" />
            </div>
        }>
            <ProfilePage />
        </Suspense>
    );
}