import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, username, type, message, rating } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        username,
        type: type || "other",
        message: message.slice(0, 500), // Limit to 500 chars
        rating: rating ? Math.max(1, Math.min(5, rating)) : null,
        status: "new",
      },
    });

    return NextResponse.json({ success: true, id: feedback.id });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "new";
    const limit = parseInt(searchParams.get("limit") || "50");

    const feedbacks = await prisma.feedback.findMany({
      where: status !== "all" ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error("Feedback fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 },
    );
  }
}
