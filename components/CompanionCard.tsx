"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { usePathname } from "next/navigation";

interface CompanionComponentProps {
    id: string;
    name: string;
    topic: string;
    subject: string;
    duration: number;
    color: string;
    bookmarked?: boolean;
}

const CompanionCard = ({id, name, topic, subject, duration, color, bookmarked = false}:CompanionComponentProps ) => {
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const handleBookmark = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          companionId: id, 
          action: isBookmarked ? "remove" : "add",
          path: pathname
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsBookmarked((prev) => !prev);
        toast.success(isBookmarked ? "Bookmark removed!" : "Bookmarked!");
      } else {
        toast.error(data.error || "Failed to update bookmark.");
      }
    } catch (e) {
      toast.error("Something went wrong!");
      console.error("Bookmark error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="companion-card" style={{ backgroundColor: color}}>
       <div className="flex justify-between items-center">
        <div className="subjet-badge">{subject}</div>
        <button className="companion-bookmark" onClick={handleBookmark} disabled={loading} aria-pressed={isBookmarked}>
            <img
            src={isBookmarked ? "/icons/bookmark-filled.svg" : "/icons/bookmark.svg"}
            alt={isBookmarked ? "bookmarked" : "bookmark"}
            width={12.5}
            height={15}
            />
        </button>
       </div>
       <h2 className="text-2xl font-bold">{name}</h2>
       <p className="text-sm">{topic}</p>

       <div className="flex items-center gap-2">
        <img
        src="/icons/clock.svg"
        alt="duration"
        width={13.5}
        height={13.5}
        loading="lazy"
        />
        <p className="text-sm">{duration} minutes</p>
       </div>
       <Link href={`/companions/${id}`} className="w-full">
        <button className="btn-primary w-full justify-center">
          Lauch Lesson
        </button>
       </Link>
    </article>
  )
}

export default CompanionCard