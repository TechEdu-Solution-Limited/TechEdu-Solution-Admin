"use client";
import React from "react";
import { TemplateLayout } from "@/types/template";
import { mapFontFamily } from "@/utils/pdfFontMapping";
import { SPACING, FONT_SIZES, LAYOUT } from "@/utils/templateConstants";

export function TwoColumnTemplatePlaceholder({
  template,
}: {
  template: TemplateLayout;
}) {
  const leftColumn = template.columns?.find((col) => col.id === "left");
  const rightColumn = template.columns?.find((col) => col.id === "right");

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
          backgroundColor: template.styles.colors.headerBackground || "#60a5fa",
        }}
      >
        <h1
          className="text-5xl font-bold"
          style={{
            color: template.styles.colors.text || "#ffffff",
            fontFamily: mapFontFamily(template.styles.typography.fontFamily),
          }}
        >
          John Doe
        </h1>
        <p
          className="text-xl text-gray-200 mt-2"
          style={{
            color: template.styles.colors.secondary || "#e5e7eb",
            fontFamily: mapFontFamily(template.styles.typography.fontFamily),
          }}
        >
          Software Engineer
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="flex">
        {/* Left Column Placeholder */}
        <div
          className="p-8"
          style={{
            width: `${leftColumn?.width || 35}%`,
            height: "100%",
            backgroundColor: leftColumn?.styles?.backgroundColor || "#1e3a8a",
            color: leftColumn?.styles?.textColor || "#f9fafb",
          }}
        >
          {/* Contact Info Placeholder */}
          <div className="mb-8">
            <h2
              className="text-lg font-bold mb-4 uppercase tracking-wide border-t border-b py-1"
              style={{
                color: leftColumn?.styles?.textColor || "#f9fafb",
                fontFamily: mapFontFamily(
                  template.styles.typography.fontFamily
                ),
                fontSize: `${template.styles.typography.headingSize}px`,
                borderTopColor: leftColumn?.styles?.textColor || "#f9fafb",
                borderBottomColor: leftColumn?.styles?.textColor || "#f9fafb",
              }}
            >
              Contact
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Email: </span>
                <span>john.doe@email.com</span>
              </div>
              <div>
                <span className="font-semibold">Phone: </span>
                <span>+1 (555) 123-4567</span>
              </div>
              <div>
                <span className="font-semibold">Location: </span>
                <span>New York, NY</span>
              </div>
              <div>
                <span className="font-semibold">LinkedIn: </span>
                <span className="text-blue-300">linkedin.com/in/johndoe</span>
              </div>
              <div>
                <span className="font-semibold">GitHub: </span>
                <span className="text-gray-300">github.com/johndoe</span>
              </div>
              <div>
                <span className="font-semibold">Website: </span>
                <span className="text-blue-300">johndoe.dev</span>
              </div>
            </div>
          </div>

          {/* Skills Placeholder */}
          <div className="mb-8">
            <h2
              className="text-lg font-bold mb-4 uppercase tracking-wide border-t border-b"
              style={{
                color: leftColumn?.styles?.textColor || "#f9fafb",
                fontFamily: mapFontFamily(
                  template.styles.typography.fontFamily
                ),
                fontSize: `${template.styles.typography.headingSize}px`,
                borderTopColor: leftColumn?.styles?.textColor || "#f9fafb",
                borderBottomColor: leftColumn?.styles?.textColor || "#f9fafb",
              }}
            >
              Skills
            </h2>
            <div className="space-y-3">
              {["JavaScript", "React", "Node.js", "Python", "SQL"].map(
                (skill, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <p
                      style={{
                        color: leftColumn?.styles?.textColor || "#f9fafb",
                        fontFamily: mapFontFamily(
                          template.styles.typography.fontFamily
                        ),
                        fontSize: `${template.styles.typography.bodySize}px`,
                      }}
                    >
                      {skill}
                    </p>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <div
                          key={dot}
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              dot <= 4
                                ? leftColumn?.styles?.textColor || "#f9fafb"
                                : `${
                                    leftColumn?.styles?.textColor || "#f9fafb"
                                  }40`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Languages Placeholder */}
          <div className="mb-8">
            <h2
              className="text-lg font-bold mb-4 uppercase tracking-wide border-t border-b"
              style={{
                color: leftColumn?.styles?.textColor || "#f9fafb",
                fontFamily: mapFontFamily(
                  template.styles.typography.fontFamily
                ),
                fontSize: `${template.styles.typography.headingSize}px`,
                borderTopColor: leftColumn?.styles?.textColor || "#f9fafb",
                borderBottomColor: leftColumn?.styles?.textColor || "#f9fafb",
              }}
            >
              Languages
            </h2>
            <div className="space-y-3">
              {["English", "Spanish", "French"].map((lang, index) => (
                <div key={index} className="flex justify-between items-center">
                  <p
                    style={{
                      color: leftColumn?.styles?.textColor || "#f9fafb",
                      fontFamily: mapFontFamily(
                        template.styles.typography.fontFamily
                      ),
                      fontSize: `${template.styles.typography.bodySize}px`,
                    }}
                  >
                    {lang}
                  </p>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div
                        key={dot}
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            dot <= 3
                              ? leftColumn?.styles?.textColor || "#f9fafb"
                              : `${
                                  leftColumn?.styles?.textColor || "#f9fafb"
                                }40`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Placeholder */}
        <div
          className="p-8"
          style={{
            width: `${rightColumn?.width || 65}%`,
            backgroundColor: rightColumn?.styles?.backgroundColor || "#ffffff",
            color: rightColumn?.styles?.textColor || "#000000",
          }}
        >
          {/* Work Experience Placeholder */}
          <div className="mb-8">
            <h2
              className="text-xl font-bold mb-4 border-t border-b py-1 uppercase tracking-wide"
              style={{
                color: "#1e3a8a",
                fontFamily: mapFontFamily(
                  template.styles.typography.fontFamily
                ),
                fontSize: `${template.styles.typography.headingSize}px`,
                borderTopColor: "#1e3a8a",
                borderBottomColor: "#1e3a8a",
              }}
            >
              Work Experience
            </h2>
            <div className="space-y-6">
              {[1, 2].map((item) => (
                <div key={item} className="mb-6">
                  <div className="flex justify-between items-start">
                    <h3
                      className="font-semibold text-lg"
                      style={{
                        color: "#000000",
                        fontFamily: mapFontFamily(
                          template.styles.typography.fontFamily
                        ),
                        fontSize: `${
                          template.styles.typography.bodySize + 2
                        }px`,
                      }}
                    >
                      Senior Software Engineer
                    </h3>
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: "#1e3a8a",
                        fontFamily: mapFontFamily(
                          template.styles.typography.fontFamily
                        ),
                        fontSize: `${
                          template.styles.typography.bodySize - 1
                        }px`,
                      }}
                    >
                      2020 – Present
                    </span>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <p
                      className="text-lg italic font-medium"
                      style={{
                        color: "#1e3a8a",
                        fontFamily: mapFontFamily(
                          template.styles.typography.fontFamily
                        ),
                        fontSize: `${template.styles.typography.bodySize}px`,
                      }}
                    >
                      Tech Company Inc.
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: "#666666",
                        fontFamily: mapFontFamily(
                          template.styles.typography.fontFamily
                        ),
                        fontSize: `${
                          template.styles.typography.bodySize - 1
                        }px`,
                      }}
                    >
                      San Francisco, CA
                    </p>
                  </div>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li
                      style={{
                        color: "#000000",
                        fontFamily: mapFontFamily(
                          template.styles.typography.fontFamily
                        ),
                        fontSize: `${
                          template.styles.typography.bodySize - 1
                        }px`,
                      }}
                    >
                      Led development of microservices architecture
                    </li>
                    <li
                      style={{
                        color: "#000000",
                        fontFamily: mapFontFamily(
                          template.styles.typography.fontFamily
                        ),
                        fontSize: `${
                          template.styles.typography.bodySize - 1
                        }px`,
                      }}
                    >
                      Improved system performance by 40%
                    </li>
                    <li
                      style={{
                        color: "#000000",
                        fontFamily: mapFontFamily(
                          template.styles.typography.fontFamily
                        ),
                        fontSize: `${
                          template.styles.typography.bodySize - 1
                        }px`,
                      }}
                    >
                      Mentored junior developers
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education Placeholder */}
          <div className="mb-8">
            <h2
              className="text-xl font-bold mb-4 border-t border-b py-1 uppercase tracking-wide"
              style={{
                color: "#1e3a8a",
                fontFamily: mapFontFamily(
                  template.styles.typography.fontFamily
                ),
                fontSize: `${template.styles.typography.headingSize}px`,
                borderTopColor: "#1e3a8a",
                borderBottomColor: "#1e3a8a",
              }}
            >
              Education
            </h2>
            <div className="space-y-6">
              {[1, 2].map((item) => (
                <div key={item} className="mb-6">
                  <div className="flex justify-between items-start">
                    <h3
                      className="font-semibold text-lg"
                      style={{
                        color: "#000000",
                        fontFamily: mapFontFamily(
                          template.styles.typography.fontFamily
                        ),
                        fontSize: `${
                          template.styles.typography.bodySize + 2
                        }px`,
                      }}
                    >
                      Bachelor of Computer Science
                    </h3>
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: "#1e3a8a",
                        fontFamily: mapFontFamily(
                          template.styles.typography.fontFamily
                        ),
                        fontSize: `${
                          template.styles.typography.bodySize - 1
                        }px`,
                      }}
                    >
                      2016 – 2020
                    </span>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <p
                      className="text-lg italic font-medium"
                      style={{
                        color: "#1e3a8a",
                        fontFamily: mapFontFamily(
                          template.styles.typography.fontFamily
                        ),
                        fontSize: `${template.styles.typography.bodySize}px`,
                      }}
                    >
                      University of Technology
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: "#666666",
                        fontFamily: mapFontFamily(
                          template.styles.typography.fontFamily
                        ),
                        fontSize: `${
                          template.styles.typography.bodySize - 1
                        }px`,
                      }}
                    >
                      Boston, MA
                    </p>
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: "#1e3a8a",
                      fontFamily: mapFontFamily(
                        template.styles.typography.fontFamily
                      ),
                      fontSize: `${template.styles.typography.bodySize - 1}px`,
                    }}
                  >
                    GPA: 3.8/4.0
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
