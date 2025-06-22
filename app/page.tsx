export const dynamic = "force-dynamic";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import ProtectedHome from "@/components/ProtectedHome";

export default function Page() {
  return (
    <main>
      <SignedIn>
        <ProtectedHome />
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="mb-4 text-2xl font-semibold">Please sign in to continue</h2>
          <SignInButton mode="modal" />
        </div>
      </SignedOut>
    </main>
  );
}