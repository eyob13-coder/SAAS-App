"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionList";
import CTA from "@/components/CTA";
import { getAllCompanions } from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";

export default function ProtectedHome() {
  const { isSignedIn } = useUser();
  const [companions, setCompanions] = useState<any[]>([]);

  useEffect(() => {
    if (isSignedIn) {
      getAllCompanions({ limit: 3 }).then(res => setCompanions(res.data));
    }
  }, [isSignedIn]);

  if (!isSignedIn) return null;

  return (
    <>
      <h1>Popular Companions</h1>
      <section className="home-section">
        {companions.map((companion: any) => (
          <CompanionCard
            key={companion.id}
            {...companion}
            color={getSubjectColor(companion.subject)}
          />
        ))}
      </section>
      <section className="home-section">
        <CompanionsList
          title="Recently completed sessions"
          companions={[]}
          classNames="w-2/3 max-lg:w-full"
        />
        <CTA />
      </section>
    </>
  );
} 