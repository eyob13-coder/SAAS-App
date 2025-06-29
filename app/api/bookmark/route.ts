import { NextRequest, NextResponse } from "next/server";
import { addBookmark, removeBookmark } from "@/lib/actions/companion.actions";

export async function POST(req: NextRequest) {
  try {
    const { companionId, action, path } = await req.json();
    if (!companionId || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
    if (action === "add") {
      await addBookmark(companionId, path || "/");
      return NextResponse.json({ success: true });
    } else if (action === "remove") {
      await removeBookmark(companionId, path || "/");
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
