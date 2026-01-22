import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["new", "read", "resolved"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("Feedback update error:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}
