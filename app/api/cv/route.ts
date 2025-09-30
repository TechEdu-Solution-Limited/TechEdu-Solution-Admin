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

const CreateCVSchema = z.object({
  title: z.string().optional(),
  sections: z.array(SectionSchema).min(1, "At least one section is required"),
  consent: ConsentSchema.optional(),
});

// Mock database - in a real app, this would be a database
const cvs: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = CreateCVSchema.parse(body);

    // Generate IDs for sections that don't have them
    const sectionsWithIds = validatedData.sections.map((section, index) => ({
      ...section,
      id: section.id || `section-${Date.now()}-${index}`,
    }));

    // Create the CV object
    const cv = {
      id: `cv-${Date.now()}`,
      title: validatedData.title || "Untitled CV",
      sections: sectionsWithIds,
      consent: validatedData.consent || {
        aiProcessing: false,
        aiTraining: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in mock database
    cvs.push(cv);

    return NextResponse.json(cv, { status: 201 });
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

    console.error("Error creating CV:", error);
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

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedCVs = cvs.slice(startIndex, endIndex);

    return NextResponse.json({
      cvs: paginatedCVs,
      pagination: {
        page,
        limit,
        total: cvs.length,
        totalPages: Math.ceil(cvs.length / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching CVs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
