import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schemas
const SectionSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  heading: z.string().optional(),
  visible: z.boolean().optional().default(true),
  data: z.record(z.any()).optional(),
});

const ConsentSchema = z.object({
  aiProcessing: z.boolean().optional().default(false),
  aiTraining: z.boolean().optional().default(false),
});

const UpdateDraftSchema = z.object({
  title: z.string().optional(),
  sections: z.array(SectionSchema).min(1, "At least one section is required"),
  consent: ConsentSchema.optional(),
});

// Mock database for drafts - in a real app, this would be a database
const drafts: Map<string, any> = new Map();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const draft = drafts.get(id);

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error("Error fetching draft:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate the request body
    const validatedData = UpdateDraftSchema.parse(body);

    // Check if draft exists
    const existingDraft = drafts.get(id);
    if (!existingDraft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    // Generate IDs for sections that don't have them
    const sectionsWithIds = validatedData.sections.map((section, index) => ({
      ...section,
      id: section.id || `section-${Date.now()}-${index}`,
    }));

    // Update the draft
    const updatedDraft = {
      ...existingDraft,
      title: validatedData.title || existingDraft.title,
      sections: sectionsWithIds,
      consent: validatedData.consent || existingDraft.consent,
      updatedAt: new Date().toISOString(),
    };

    // Store in mock database
    drafts.set(id, updatedDraft);

    return NextResponse.json(updatedDraft);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error updating draft:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const draft = drafts.get(id);

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    // Delete the draft
    drafts.delete(id);

    return NextResponse.json(
      { message: "Draft deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
