import { NextRequest } from "next/server";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import { uploadImage } from "@/lib/supabase";

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image types
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// POST /api/v1/uploads - Upload images (requires auth)
export async function POST(request: NextRequest) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return errorResponse("No files provided. Use 'files' field in form data.");
    }

    if (files.length > 10) {
      return errorResponse("Maximum 10 files allowed per upload");
    }

    const uploadResults: { url: string; filename: string }[] = [];
    const errors: { filename: string; error: string }[] = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push({
          filename: file.name,
          error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}`,
        });
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push({
          filename: file.name,
          error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: 5MB`,
        });
        continue;
      }

      // Generate unique path: {agentId}/{timestamp}-{sanitizedFilename}
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `${agent.id}/${timestamp}-${sanitizedName}`;

      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Supabase Storage
      const result = await uploadImage(buffer, path, file.type);

      if ("error" in result) {
        errors.push({
          filename: file.name,
          error: result.error,
        });
      } else {
        uploadResults.push({
          url: result.url,
          filename: file.name,
        });
      }
    }

    if (uploadResults.length === 0 && errors.length > 0) {
      return errorResponse(`All uploads failed: ${errors.map((e) => e.error).join("; ")}`);
    }

    return successResponse(
      {
        uploaded: uploadResults,
        errors: errors.length > 0 ? errors : undefined,
      },
      `${uploadResults.length} file(s) uploaded successfully`
    );
  } catch (error) {
    console.error("Upload error:", error);
    return errorResponse("Failed to upload files", 500);
  }
}
