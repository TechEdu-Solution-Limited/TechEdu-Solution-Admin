"use client";
import React from "react";
import { TemplateLayout } from "@/types/template";
import { mapFontFamily } from "@/utils/pdfFontMapping";
import { SPACING, FONT_SIZES, LAYOUT } from "@/utils/templateConstants";

export function ClassicTemplatePlaceholder({
  template,
}: {
  template: TemplateLayout;
}) {
  return (
    <div
      className="mx-auto bg-white shadow-lg"
      style={
        {
          width: LAYOUT.a4Width,
          minHeight: LAYOUT.a4Height,
          maxWidth: LAYOUT.maxWidth,
          pageBreakInside: "avoid",
          breakInside: "avoid",
          transform: `scale(${LAYOUT.scale})`,
          transformOrigin: "top center",
          marginBottom: `${SPACING.xl}px`,
        } as React.CSSProperties
      }
    >
      {/* Header Placeholder */}
      <div
        className="flex justify-between items-start p-8"
        style={{
          backgroundColor: template.styles.colors.headerBackground || "#f8fafc",
          borderBottom: `2px solid ${
            template.styles.colors.primary || "#dc2626"
          }`,
        }}
      >
        {/* Left Side - Image, Name, Title, Contact */}
        <div className="flex items-start space-x-4">
          {/* Profile Image Placeholder */}
          <div
            className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "#e5e7eb",
            }}
          >
            <svg
              className="w-8 h-8 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Name and Title */}
          <div className="flex flex-col">
            <h1
              className="text-4xl font-bold mb-2"
              style={{
                color: template.styles.colors.text || "#000000",
                fontFamily: mapFontFamily(
                  template.styles.typography.fontFamily
                ),
              }}
            >
              John Doe
            </h1>
            <p
              className="text-xl text-gray-600 mb-4"
              style={{
                color: template.styles.colors.secondary || "#666666",
                fontFamily: mapFontFamily(
                  template.styles.typography.fontFamily
                ),
              }}
            >
              Software Engineer
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Email:</span>
                <span>john.doe@email.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Phone:</span>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Location:</span>
                <span>New York, NY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Social Links */}
        <div className="flex flex-col space-y-2 text-right">
          <div className="space-y-1">
            <div className="text-sm">
              <span className="font-semibold">LinkedIn: </span>
              <span className="text-blue-600">linkedin.com/in/johndoe</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold">GitHub: </span>
              <span className="text-gray-600">github.com/johndoe</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold">Website: </span>
              <span className="text-blue-600">johndoe.dev</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Placeholder */}
      <div className="py-8 px-8">
        <div className="space-y-6">
          {/* Professional Summary Placeholder */}
          <div>
            <h2
              className="font-bold uppercase text-sm tracking-wide bg-gray-100 p-3 w-full border-l-4 mb-4"
              style={{
                borderLeftColor: template.styles.colors.primary || "#dc2626",
                color: template.styles.colors.text || "#000000",
                fontFamily: mapFontFamily(
                  template.styles.typography.fontFamily
                ),
                fontSize: `${template.styles.typography.headingSize}px`,
              }}
            >
              Professional Summary
            </h2>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>

          {/* Work Experience Placeholder */}
          <div>
            <h2
              className="font-bold uppercase text-sm tracking-wide bg-gray-100 p-3 w-full border-l-4 mb-4"
              style={{
                borderLeftColor: template.styles.colors.primary || "#dc2626",
                color: template.styles.colors.text || "#000000",
                fontFamily: mapFontFamily(
                  template.styles.typography.fontFamily
                ),
                fontSize: `${template.styles.typography.headingSize}px`,
              }}
            >
              Work Experience
            </h2>
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">
                      Senior Software Engineer
                    </h3>
                    <span className="text-sm text-gray-600">
                      2020 - Present
                    </span>
                  </div>
                  <p className="text-blue-600 font-medium mb-1">
                    Tech Company Inc.
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    San Francisco, CA
                  </p>
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Placeholder */}
          <div>
            <h2
              className="font-bold uppercase text-sm tracking-wide bg-gray-100 p-3 w-full border-l-4 mb-4"
              style={{
                borderLeftColor: template.styles.colors.primary || "#dc2626",
                color: template.styles.colors.text || "#000000",
                fontFamily: mapFontFamily(
                  template.styles.typography.fontFamily
                ),
                fontSize: `${template.styles.typography.headingSize}px`,
              }}
            >
              Education
            </h2>
            <div className="space-y-3">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-semibold">
                      Bachelor of Computer Science
                    </h3>
                    <span className="text-sm text-gray-600">2016 - 2020</span>
                  </div>
                  <p className="text-blue-600 font-medium">
                    University of Technology
                  </p>
                  <p className="text-sm text-gray-600">GPA: 3.8/4.0</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Placeholder */}
          <div>
            <h2
              className="font-bold uppercase text-sm tracking-wide bg-gray-100 p-3 w-full border-l-4 mb-4"
              style={{
                borderLeftColor: template.styles.colors.primary || "#dc2626",
                color: template.styles.colors.text || "#000000",
                fontFamily: mapFontFamily(
                  template.styles.typography.fontFamily
                ),
                fontSize: `${template.styles.typography.headingSize}px`,
              }}
            >
              Skills
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                "JavaScript",
                "React",
                "Node.js",
                "Python",
                "SQL",
                "AWS",
                "Docker",
                "Git",
              ].map((skill, index) => (
                <div
                  key={index}
                  className="px-3 py-2 rounded-md text-sm font-medium shadow-sm"
                  style={{
                    backgroundColor:
                      template.styles.colors.primary || "#dc2626",
                    color: "#ffffff",
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
