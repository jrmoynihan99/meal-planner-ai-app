import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const { fileId } = params;

  if (!fileId) {
    return NextResponse.json({ error: "File ID required" }, { status: 400 });
  }

  try {
    const base64Buffer = await kv.get(fileId);

    if (!base64Buffer) {
      return NextResponse.json(
        { error: "File not found or expired" },
        { status: 404 }
      );
    }

    const buffer = Buffer.from(base64Buffer, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="meal-plan.xlsx"',
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
