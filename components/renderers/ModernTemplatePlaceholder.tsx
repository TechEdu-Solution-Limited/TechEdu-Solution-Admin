"use client";
import React from "react";
import { TemplateLayout } from "@/types/template";
import { mapFontFamily } from "@/utils/pdfFontMapping";
import { SPACING, FONT_SIZES, LAYOUT } from "@/utils/templateConstants";

export function ModernTemplatePlaceholder({
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
        className="py-8 px-8 text-center"
        style={{
          backgroundColor: template.styles.colors.primary || "#1e40af",
          color: "#ffffff",
        }}
      >
        <div className="flex items-center justify-center space-x-6">
          {/* Profile Image Placeholder */}
          <div
            className="w-20 h-24 bg-gray-300 rounded flex items-center justify-center"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <svg
              className="w-8 h-8 text-white opacity-50"
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

          {/* Name and Title Placeholder */}
          <div className="flex-1 text-left">
            <h1
              className="text-4xl font-bold mb-2"
              style={{
                color: "#ffffff",
                fontFamily: mapFontFamily(template.styles.typography.fontFamily),
              }}
            >
              John Doe
            </h1>
            <p
              className="text-xl mb-4 opacity-90"
              style={{
                color: "#ffffff",
                fontFamily: mapFontFamily(template.styles.typography.fontFamily),
              }}
            >
              Software Engineer
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <span>📧</span>
                <span>john.doe@email.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📞</span>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📍</span>
                <span>New York, NY</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>💼</span>
                <span>linkedin.com/in/johndoe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Placeholder */}
      <div className="py-8 px-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - 35% */}
          <div className="col-span-4 space-y-6">
            {/* Professional Summary Placeholder */}
            <div>
              <h2
                className="text-lg font-bold mb-4 uppercase tracking-wide"
                style={{
                  color: template.styles.colors.primary || "#1e40af",
                  fontFamily: mapFontFamily(template.styles.typography.fontFamily),
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

            {/* Skills Placeholder */}
            <div>
              <h2
                className="text-lg font-bold mb-4 uppercase tracking-wide"
                style={{
                  color: template.styles.colors.primary || "#1e40af",
                  fontFamily: mapFontFamily(template.styles.typography.fontFamily),
                  fontSize: `${template.styles.typography.headingSize}px`,
                }}
              >
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {["JavaScript", "React", "Node.js", "Python", "SQL"].map((skill, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: template.styles.colors.primary || "#1e40af",
                      color: "#ffffff",
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Languages Placeholder */}
            <div>
              <h2
                className="text-lg font-bold mb-4 uppercase tracking-wide"
                style={{
                  color: template.styles.colors.primary || "#1e40af",
                  fontFamily: mapFontFamily(template.styles.typography.fontFamily),
                  fontSize: `${template.styles.typography.headingSize}px`,
                }}
              >
                Languages
              </h2>
              <div className="space-y-2">
                {["English (Native)", "Spanish (Fluent)", "French (Intermediate)"].map((lang, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{lang}</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <div
                          key={dot}
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: dot <= 4 ? template.styles.colors.primary || "#1e40af" : "#e5e7eb",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 65% */}
          <div className="col-span-8 space-y-6">
            {/* Work Experience Placeholder */}
            <div>
              <h2
                className="text-lg font-bold mb-4 uppercase tracking-wide"
                style={{
                  color: template.styles.colors.primary || "#1e40af",
                  fontFamily: mapFontFamily(template.styles.typography.fontFamily),
                  fontSize: `${template.styles.typography.headingSize}px`,
                }}
              >
                Work Experience
              </h2>
              <div className="space-y-4">
                {[1, 2].map((item) => (
                  <div key={item} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">Senior Software Engineer</h3>
                      <span className="text-sm text-gray-600">2020 - Present</span>
                    </div>
                    <p className="text-blue-600 font-medium mb-1">Tech Company Inc.</p>
                    <p className="text-sm text-gray-600 mb-2">San Francisco, CA</p>
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
                className="text-lg font-bold mb-4 uppercase tracking-wide"
                style={{
                  color: template.styles.colors.primary || "#1e40af",
                  fontFamily: mapFontFamily(template.styles.typography.fontFamily),
                  fontSize: `${template.styles.typography.headingSize}px`,
                }}
              >
                Education
              </h2>
              <div className="space-y-3">
                {[1, 2].map((item) => (
                  <div key={item} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-semibold">Bachelor of Computer Science</h3>
                      <span className="text-sm text-gray-600">2016 - 2020</span>
                    </div>
                    <p className="text-blue-600 font-medium">University of Technology</p>
                    <p className="text-sm text-gray-600">GPA: 3.8/4.0</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
