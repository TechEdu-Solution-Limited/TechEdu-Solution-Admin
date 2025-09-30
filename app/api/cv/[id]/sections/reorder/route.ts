import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const ReorderSectionsSchema = z.object({
  sectionIds: z.array(z.string()).min(1, "At least one section ID is required"),
});

// Mock database - in a real app, this would be a database
const cvs: Map<string, any> = new Map();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate the request body
    const validatedData = ReorderSectionsSchema.parse(body);

    // Check if CV exists
    const existingCV = cvs.get(id);
    if (!existingCV) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Validate that all provided section IDs exist in the CV
    const existingSectionIds = existingCV.sections.map(
      (section: any) => section.id
    );
    const invalidSectionIds = validatedData.sectionIds.filter(
      (sectionId) => !existingSectionIds.includes(sectionId)
    );

    if (invalidSectionIds.length > 0) {
      return NextResponse.json(
        {
          error: "Invalid section IDs",
          invalidIds: invalidSectionIds,
        },
        { status: 400 }
      );
    }

    // Validate that all existing sections are included in the reorder request
    const missingSectionIds = existingSectionIds.filter(
      (sectionId) => !validatedData.sectionIds.includes(sectionId)
    );

    if (missingSectionIds.length > 0) {
      return NextResponse.json(
        {
          error: "All sections must be included in the reorder request",
          missingIds: missingSectionIds,
        },
        { status: 400 }
      );
    }

    // Reorder sections based on the provided order
    const reorderedSections = validatedData.sectionIds.map((sectionId) =>
      existingCV.sections.find((section: any) => section.id === sectionId)
    );

    // Update the CV
    const updatedCV = {
      ...existingCV,
      sections: reorderedSections,
      updatedAt: new Date().toISOString(),
    };

    // Store in mock database
    cvs.set(id, updatedCV);

    return NextResponse.json({
      message: "Sections reordered successfully",
      sections: reorderedSections,
    });
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

    console.error("Error reordering sections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

