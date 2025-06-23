import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { currentUser } from "@clerk/nextjs/server";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import {
  getUserCompanions,
  getUserSessions,
  getBookmarkedCompanions,
} from "@/lib/actions/companion.actions";
import Image from "next/image";
import CompanionsList from "@/components/CompanionList";

const Profile = async () => {
  const user = await currentUser();

  return (
    <main className="min-lg:w-3/4">
      <SignedIn>
        {user && (
          <>
            <section className="flex justify-between gap-4 max-sm:flex-col items-center">
              <div className="flex gap-4 items-center">
                <Image
                  src={user.imageUrl}
                  alt={user.firstName!}
                  width={110}
                  height={110}
                />
                <div className="flex flex-col gap-2">
                  <h1 className="font-bold text-2xl">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {user.emailAddresses[0].emailAddress}
                  </p>
                </div>
              </div>
              <UserStats userId={user.id} />
            </section>
            <UserAccordion userId={user.id} />
          </>
        )}
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="mb-4 text-2xl font-semibold">Please sign in to view your journey</h2>
          <SignInButton mode="modal" />
        </div>
      </SignedOut>
    </main>
  );
};

// Helper component for user stats
const UserStats = async ({ userId }: { userId: string }) => {
  const companions = await getUserCompanions(userId);
  const sessionHistory = await getUserSessions(userId);
  return (
    <div className="flex gap-4">
      <div className="border border-black rouded-lg p-3 gap-2 flex flex-col h-fit">
        <div className="flex gap-2 items-center">
          <Image
            src="/icons/check.svg"
            alt="checkmark"
            width={22}
            height={22}
          />
          <p className="text-2xl font-bold">{sessionHistory.length}</p>
        </div>
        <div>Lessons completed</div>
      </div>
      <div className="border border-black rouded-lg p-3 gap-2 flex flex-col h-fit">
        <div className="flex gap-2 items-center">
          <Image src="/icons/cap.svg" alt="cap" width={22} height={22} />
          <p className="text-2xl font-bold">{companions.length}</p>
        </div>
        <div>Companions created</div>
      </div>
    </div>
  );
};

// Helper component for user accordion
const UserAccordion = async ({ userId }: { userId: string }) => {
  const companions = await getUserCompanions(userId);
  const sessionHistory = await getUserSessions(userId);
  const bookmarkedCompanions = await getBookmarkedCompanions(userId);
  return (
    <Accordion type="multiple">
      <AccordionItem value="bookmarks">
        <AccordionTrigger className="text-2xl font-bold">
          Bookmarked Companions {`(${bookmarkedCompanions.length})`}
        </AccordionTrigger>
        <AccordionContent>
          <CompanionsList
            companions={bookmarkedCompanions}
            title="Bookmarked Companions"
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="recent">
        <AccordionTrigger className="text-2xl font-bold">
          Recent Sessions
        </AccordionTrigger>
        <AccordionContent>
          <CompanionsList
            title="Recent Sessions"
            companions={sessionHistory}
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="companions">
        <AccordionTrigger className="text-2xl font-bold">
          My Companions {`(${companions.length})`}
        </AccordionTrigger>
        <AccordionContent>
          <CompanionsList title="My Companions" companions={companions} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
export default Profile;
