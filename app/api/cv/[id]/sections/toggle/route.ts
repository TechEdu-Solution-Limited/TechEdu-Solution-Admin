import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const ToggleSectionSchema = z.object({
  sectionId: z.string(),
  visible: z.boolean(),
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
    const validatedData = ToggleSectionSchema.parse(body);

    // Check if CV exists
    const existingCV = cvs.get(id);
    if (!existingCV) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Find and update the section
    const sectionIndex = existingCV.sections.findIndex(
      (section: any) => section.id === validatedData.sectionId
    );

    if (sectionIndex === -1) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Update the section visibility
    const updatedSections = [...existingCV.sections];
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      visible: validatedData.visible,
    };

    // Update the CV
    const updatedCV = {
      ...existingCV,
      sections: updatedSections,
      updatedAt: new Date().toISOString(),
    };

    // Store in mock database
    cvs.set(id, updatedCV);

    return NextResponse.json({
      message: `Section ${
        validatedData.visible ? "shown" : "hidden"
      } successfully`,
      section: updatedSections[sectionIndex],
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

    console.error("Error toggling section:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

