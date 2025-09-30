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

const UpdateCVSchema = z.object({
  title: z.string().optional(),
  sections: z.array(SectionSchema).optional(),
  consent: ConsentSchema.optional(),
});

// Mock database - in a real app, this would be a database
const cvs: Map<string, any> = new Map();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const cv = cvs.get(id);

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    return NextResponse.json(cv);
  } catch (error) {
    console.error("Error fetching CV:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate the request body
    const validatedData = UpdateCVSchema.parse(body);

    // Check if CV exists
    const existingCV = cvs.get(id);
    if (!existingCV) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Generate IDs for sections that don't have them
    const sectionsWithIds = validatedData.sections?.map((section, index) => ({
      ...section,
      id: section.id || `section-${Date.now()}-${index}`,
    }));

    // Update the CV
    const updatedCV = {
      ...existingCV,
      title: validatedData.title || existingCV.title,
      sections: sectionsWithIds || existingCV.sections,
      consent: validatedData.consent || existingCV.consent,
      updatedAt: new Date().toISOString(),
    };

    // Store in mock database
    cvs.set(id, updatedCV);

    return NextResponse.json(updatedCV);
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

    console.error("Error updating CV:", error);
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

    const cv = cvs.get(id);

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Delete the CV
    cvs.delete(id);

    return NextResponse.json(
      { message: "CV deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting CV:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

