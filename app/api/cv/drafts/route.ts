import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schemas
const SectionSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  heading: z.string().optional(),
  visible: z.boolean().optional().default(true),
  data: z.union([z.record(z.any()), z.array(z.any())]).optional(),
});

const ConsentSchema = z.object({
  aiProcessing: z.boolean().optional().default(false),
  aiTraining: z.boolean().optional().default(false),
});

const DraftCVSchema = z.object({
  id: z.string().optional(), // Optional for create, required for update
  title: z.string().optional(),
  sections: z.array(SectionSchema).min(1, "At least one section is required"),
  consent: ConsentSchema.optional(),
});

// Mock database for drafts - in a real app, this would be a database
const drafts: Map<string, any> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Draft API received:", JSON.stringify(body, null, 2));

    // Validate the request body
    const validatedData = DraftCVSchema.parse(body);

    // Generate ID if not provided
    const draftId = validatedData.id || `draft-${Date.now()}`;

    // Generate IDs for sections that don't have them
    const sectionsWithIds = validatedData.sections.map((section, index) => ({
      ...section,
      id: section.id || `section-${Date.now()}-${index}`,
    }));

    // Create or update the draft
    const draft = {
      id: draftId,
      title: validatedData.title || "Untitled CV",
      sections: sectionsWithIds,
      consent: validatedData.consent || {
        aiProcessing: false,
        aiTraining: false,
      },
      createdAt: drafts.has(draftId)
        ? drafts.get(draftId).createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDraft: true,
    };

    // Store in mock database
    drafts.set(draftId, draft);

    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation failed:", error.errors);
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error creating/updating draft:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const allDrafts = Array.from(drafts.values());
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedDrafts = allDrafts.slice(startIndex, endIndex);

    return NextResponse.json({
      drafts: paginatedDrafts,
      pagination: {
        page,
        limit,
        total: allDrafts.length,
        totalPages: Math.ceil(allDrafts.length / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
