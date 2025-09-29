"use client";
import React from "react";
import { TemplateLayout } from "@/types/template";
import { mapFontFamily } from "@/utils/pdfFontMapping";
import { SPACING, FONT_SIZES, LAYOUT } from "@/utils/templateConstants";

export function MinimalTemplatePlaceholder({
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
        className="py-8 px-8"
        style={{
          backgroundColor: template.styles.colors.headerBackground || "#f8fafc",
          borderBottom: `2px solid ${
            template.styles.colors.primary || "#059669"
          }`,
        }}
      >
        <div className="text-center">
          <h1
            className="text-5xl font-bold mb-2"
            style={{
              color: template.styles.colors.text || "#000000",
              fontFamily: mapFontFamily(template.styles.typography.fontFamily),
            }}
          >
            John Doe
          </h1>
          <p
            className="text-2xl text-gray-600 mb-4"
            style={{
              color: template.styles.colors.secondary || "#666666",
              fontFamily: mapFontFamily(template.styles.typography.fontFamily),
            }}
          >
            Software Engineer
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            <div className="flex items-center justify-center space-x-1 min-w-0 flex-shrink-0">
              <span>📧</span>
              <span className="text-xs truncate">john.doe@email.com</span>
            </div>
            <div className="flex items-center justify-center space-x-1 min-w-0 flex-shrink-0">
              <span>📞</span>
              <span className="text-xs truncate">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center justify-center space-x-1 min-w-0 flex-shrink-0">
              <span>📍</span>
              <span className="text-xs truncate">New York, NY</span>
            </div>
            <div className="flex items-center justify-center space-x-1 min-w-0 flex-shrink-0">
              <span>💼</span>
              <span className="text-xs truncate">linkedin.com/in/johndoe</span>
            </div>
            <div className="flex items-center justify-center space-x-1 min-w-0 flex-shrink-0">
              <span>💻</span>
              <span className="text-xs truncate">github.com/johndoe</span>
            </div>
            <div className="flex items-center justify-center space-x-1 min-w-0 flex-shrink-0">
              <span>🌐</span>
              <span className="text-xs truncate">johndoe.dev</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Placeholder */}
      <div className="py-8 px-8">
        <div className="space-y-8">
          {/* Professional Summary Placeholder */}
          <div
            className="bg-gray-50 p-6 rounded-lg border-l-4"
            style={{
              borderLeftColor: template.styles.colors.primary || "#059669",
            }}
          >
            <h2
              className="text-xl font-bold mb-4 uppercase tracking-wide"
              style={{
                color: template.styles.colors.primary || "#059669",
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
              className="text-xl font-bold mb-6 uppercase tracking-wide"
              style={{
                color: template.styles.colors.primary || "#059669",
                fontFamily: mapFontFamily(
                  template.styles.typography.fontFamily
                ),
                fontSize: `${template.styles.typography.headingSize}px`,
              }}
            >
              Work Experience
            </h2>
            <div className="space-y-6">
              {[1, 2].map((item) => (
                <div key={item} className="border-l-4 border-blue-500 pl-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">
                      Senior Software Engineer
                    </h3>
                    <span className="text-sm text-gray-600">
                      2020 - Present
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-blue-600 font-medium">
                      Tech Company Inc.
                    </span>
                    <span className="text-gray-500">📍</span>
                    <span className="text-sm text-gray-600">
                      San Francisco, CA
                    </span>
                  </div>
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
              className="text-xl font-bold mb-6 uppercase tracking-wide"
              style={{
                color: template.styles.colors.primary || "#059669",
                fontFamily: mapFontFamily(
                  template.styles.typography.fontFamily
                ),
                fontSize: `${template.styles.typography.headingSize}px`,
              }}
            >
              Education
            </h2>
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="border-l-4 border-blue-500 pl-6">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-semibold">
                      Bachelor of Computer Science
                    </h3>
                    <span className="text-sm text-gray-600">2016 - 2020</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 font-medium">
                      University of Technology
                    </span>
                    <span className="text-gray-500">📍</span>
                    <span className="text-sm text-gray-600">Boston, MA</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">GPA: 3.8/4.0</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Placeholder */}
          <div>
            <h2
              className="text-xl font-bold mb-6 uppercase tracking-wide"
              style={{
                color: template.styles.colors.primary || "#059669",
                fontFamily: mapFontFamily(
                  template.styles.typography.fontFamily
                ),
                fontSize: `${template.styles.typography.headingSize}px`,
              }}
            >
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                "JavaScript",
                "React",
                "Node.js",
                "Python",
                "SQL",
                "AWS",
                "Docker",
                "Git",
                "TypeScript",
                "MongoDB",
              ].map((skill, index) => (
                <div
                  key={index}
                  className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Languages Placeholder */}
          <div>
            <h2
              className="text-xl font-bold mb-6 uppercase tracking-wide"
              style={{
                color: template.styles.colors.primary || "#059669",
                fontFamily: mapFontFamily(
                  template.styles.typography.fontFamily
                ),
                fontSize: `${template.styles.typography.headingSize}px`,
              }}
            >
              Languages
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                "English (Native)",
                "Spanish (Fluent)",
                "French (Intermediate)",
              ].map((lang, index) => (
                <div
                  key={index}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor:
                      template.styles.colors.primary || "#059669",
                    color: "#ffffff",
                  }}
                >
                  {lang}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
