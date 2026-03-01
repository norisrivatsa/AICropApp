import { NextRequest, NextResponse } from "next/server";
import { createUploadUrl } from "@/lib/aws/s3";
import { isMockMode } from "@/lib/mock/mockMode";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fileName = String(body?.fileName || "image.jpg");
    const contentType = String(body?.contentType || "image/jpeg");

    if (isMockMode()) {
      return NextResponse.json({
        uploadUrl: "https://example.com/mock-upload",
        fileUrl: `https://example.com/uploads/${Date.now()}-${fileName}`
      });
    }

    const data = await createUploadUrl(fileName, contentType);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
