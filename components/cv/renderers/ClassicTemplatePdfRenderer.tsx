/**
 * Classic Template PDF Renderer
 *
 * Renders the classic template for PDF using shared section logic
 * Page break logic refined to keep item headers together, but allow content to break.
 * HEADER IS NOW CORRECTLY RENDERED ONLY ON THE FIRST PAGE.
 */

import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { ResumeSection } from "@/types/cv/index";
import { TemplateLayout } from "@/types/cv/template";
import {
  formatSectionContent,
  getSectionDisplayName,
} from "@/utils/cv/sectionHelpers";
import { registerPDFFonts, mapFontFamily } from "@/utils/cv/fontUtils";
import {
  SPACING,
  FONT_SIZES,
  LAYOUT,
  SECTION_ORDER,
} from "@/utils/cv/templateConstants";
import {
  scaleToPDF,
  getConsistentFontSize,
  getConsistentPadding,
  PDF_SCALE_FACTOR,
  A4_WIDTH,
  A4_HEIGHT,
} from "@/utils/cv/pdfScaling";
import RichPdf from "../RichPdf";

// Helper function to convert HTML to PDF-friendly text (kept as is)
function convertHtmlToPdfText(html: string): string {
  if (!html) return "";

  let result = html;

  // Handle headers with emphasis
  result = result.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "**$1**\n");
  result = result.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "**$1**\n");
  result = result.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "**$1**\n");

  // Handle text formatting
  result = result.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  result = result.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  result = result.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  result = result.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
  result = result.replace(/<u[^>]*>(.*?)<\/u>/gi, "_$1_");
  result = result.replace(/<s[^>]*>(.*?)<\/s>/gi, "~~$1~~");
  result = result.replace(/<strike[^>]*>(.*?)<\/strike>/gi, "~~$1~~");

  // Handle lists
  result = result.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi);
    if (items) {
      return (
        items
          .map((item: string, index: number) => {
            const text = item.replace(/<li[^>]*>(.*?)<\/li>/i, "$1");
            return `${index + 1}. ${convertHtmlToPdfText(text)}`;
          })
          .join("\n") + "\n"
      );
    }
    return "";
  });

  result = result.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi);
    if (items) {
      return (
        items
          .map((item: string) => {
            const text = item.replace(/<li[^>]*>(.*?)<\/li>/i, "$1");
            return `• ${convertHtmlToPdfText(text)}`;
          })
          .join("\n") + "\n"
      );
    }
    return "";
  });

  // Handle blockquotes
  result = result.replace(
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
    (match, content) => {
      return `> ${convertHtmlToPdfText(content)}\n`;
    }
  );

  // Handle code blocks
  result = result.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (match, content) => {
    return `\`\`\`\n${convertHtmlToPdfText(content)}\n\`\`\`\n`;
  });
  result = result.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`"); // Inline code

  // Handle links
  result = result.replace(
    /<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi,
    "$2 ($1)"
  );

  // Handle paragraphs
  result = result.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");

  // Handle line breaks
  result = result.replace(/<br[^>]*\/?>/gi, "\n");

  // Remove remaining HTML tags
  result = result.replace(/<[^>]*>/g, "");

  // Handle HTML entities
  result = result.replace(/&nbsp;/g, " ");
  result = result.replace(/&amp;/g, "&");
  result = result.replace(/&lt;/g, "<");
  result = result.replace(/&gt;/g, ">");
  result = result.replace(/&quot;/g, '"');
  result = result.replace(/&apos;/g, "'");

  // Normalize whitespace
  result = result.replace(/\s+/g, " ").trim();

  return result;
}

export function ClassicTemplatePdfRenderer({
  data,
  template,
}: {
  data: ResumeSection[];
  template: TemplateLayout;
}) {
  // Register fonts before creating styles
  registerPDFFonts();

  const personalInfo = data.find((s) => s.type === "personal-info");

  // Use standardized section order
  const sectionOrder = SECTION_ORDER;

  // Filter and sort other sections according to the desired order
  const otherSections = data
    .filter((s) => s.type !== "personal-info")
    .sort((a, b) => {
      const aIndex = sectionOrder.indexOf(a.type as string);
      const bIndex = sectionOrder.indexOf(b.type as string);

      // If section is not in the order list, put it at the end
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });

  const styles = StyleSheet.create({
    page: {
      padding: 24,
      fontSize: 10,
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
      lineHeight: 1.4,
      color: template.styles.colors.text,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      backgroundColor: template.styles.colors.headerBackground || "#f8fafc",
      borderBottomWidth: 2,
      borderBottomColor: template.styles.colors.primary || "#dc2626",
      paddingHorizontal: 16,
      paddingVertical: 16,
      marginBottom: 0,
      lineHeight: 1.0,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 16,
      lineHeight: 1,
    },
    profileImage: {
      width: 96,
      height: 96,
      borderRadius: 48,
      objectFit: "cover",
    },
    nameTitle: {
      flexDirection: "column",
    },
    name: {
      fontSize: 28,
      fontWeight: "bold",
      color: template.styles.colors.text,
      marginBottom: 8,
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
    },
    title: {
      fontSize: 16,
      fontStyle: "italic",
      color: template.styles.colors.secondary,
      marginTop: 8,
      marginBottom: 8,
      fontWeight: "500",
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
    },
    contactInfo: {
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 8,
    },
    contactItem: {
      fontSize: 10,
      color: template.styles.colors.text,
      fontWeight: "normal",
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
    },
    socialLinks: {
      flexDirection: "column",
      marginTop: 8,
      gap: 4,
    },
    socialLink: {
      fontSize: 10,
      color: template.styles.colors.text,
      fontWeight: "normal",
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
    },
    mainContent: {
      // paddingHorizontal: 32,
      paddingVertical: 12,
    },
    sectionContainer: {
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: "bold",
      marginBottom: 6,
      backgroundColor: "#f3f4f6",
      paddingVertical: 8,
      paddingHorizontal: 12,
      textTransform: "uppercase",
      letterSpacing: 0.05,
      color: template.styles.colors.text,
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
      borderLeftWidth: 4,
      borderLeftColor: "#dc2626",
    },
    sectionContent: {
      marginBottom: 6,
    },
    itemContainer: {
      marginBottom: 10,
    },
    // Style for the Unbreakable Header Block
    itemHeaderBlock: {
      marginBottom: 4,
    },
    itemTitle: {
      fontSize: template.styles.typography.bodySize || 10,
      fontWeight: "bold",
      color: template.styles.colors.text,
      marginBottom: 2,
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
    },
    itemSubtitle: {
      fontSize: template.styles.typography.bodySize || 10,
      color: template.styles.colors.secondary,
      marginBottom: 4,
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
    },
    itemDate: {
      fontSize: (template.styles.typography.bodySize || 10) - 1,
      color: template.styles.colors.secondary,
      marginBottom: 6,
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
    },
    itemDescription: {
      fontSize: (template.styles.typography.bodySize || 10) - 1,
      color: template.styles.colors.text,
      marginBottom: 4,
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
    },
    bullet: {
      marginLeft: 6,
      fontSize: (template.styles.typography.bodySize || 10) - 1,
      color: template.styles.colors.text,
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
    },
    bulletList: {
      marginTop: 2,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - The 'fixed' prop has been removed to ensure it only appears on the first page. */}
        {personalInfo && (
          <View style={styles.header}>
            {/* Left Side - Image, Name, Title, Contact */}
            <View style={styles.headerLeft}>
              <View style={styles.nameTitle}>
                <Text style={styles.name}>
                  {personalInfo.data.firstName} {personalInfo.data.lastName}
                </Text>
                {personalInfo.data.targetedJobTitle && (
                  <Text style={styles.title}>
                    {personalInfo.data.targetedJobTitle}
                  </Text>
                )}
                {personalInfo.data.email && (
                  <Text style={styles.contactItem}>
                    <Text style={{ fontWeight: "600" }}>Email: </Text>
                    {personalInfo.data.email}
                  </Text>
                )}
                {personalInfo.data.phone && (
                  <Text style={styles.contactItem}>
                    <Text style={{ fontWeight: "600" }}>Phone: </Text>
                    {personalInfo.data.phone}
                  </Text>
                )}
                {personalInfo.data.location && (
                  <Text style={styles.contactItem}>
                    <Text style={{ fontWeight: "600" }}>Location: </Text>
                    {personalInfo.data.location}
                  </Text>
                )}
              </View>
            </View>

            {/* Right Side - Social Links */}
            <View style={styles.contactInfo}>
              <View style={styles.socialLinks}>
                {personalInfo.data.linkedin && (
                  <Text style={styles.socialLink}>
                    <Text style={{ fontWeight: "600" }}>LinkedIn: </Text>
                    {personalInfo.data.linkedin}
                  </Text>
                )}
                {personalInfo.data.github && (
                  <Text style={styles.socialLink}>
                    <Text style={{ fontWeight: "600" }}>GitHub: </Text>
                    {personalInfo.data.github}
                  </Text>
                )}
                {personalInfo.data.website && (
                  <Text style={styles.socialLink}>
                    <Text style={{ fontWeight: "600" }}>Website: </Text>
                    {personalInfo.data.website}
                  </Text>
                )}
                {personalInfo.data.twitter && (
                  <Text style={styles.socialLink}>
                    <Text style={{ fontWeight: "600" }}>Twitter: </Text>
                    {personalInfo.data.twitter}
                  </Text>
                )}
                {personalInfo.data.instagram && (
                  <Text style={styles.socialLink}>
                    <Text style={{ fontWeight: "600" }}>Instagram: </Text>
                    {personalInfo.data.instagram}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.mainContent}>
          {otherSections.map((section) => {
            const items = formatSectionContent(section);
            const displayName = getSectionDisplayName(section.type, section);
            const isUnorderedSection =
              (section.type as string) === "skills" ||
              (section.type as string) === "languages";
            const isCustomSection = (section.type as string) === "custom";

            // Section container is splittable
            return (
              <View key={section.id} style={styles.sectionContainer}>
                {/* Section Title - wrap={false} ensures it stays with the first item's header if space is tight */}
                <Text style={styles.sectionTitle} wrap={false}>
                  {displayName}
                </Text>

                {/* Custom Sections - Render content directly */}
                {isCustomSection && (
                  <View style={{ marginBottom: 10 }}>
                    {Array.isArray(items) &&
                      items.map((item: any, i: number) => (
                        <View key={i} style={{ marginBottom: 8 }}>
                          <RichPdf
                            html={item.content || ""}
                            template={template}
                          />
                        </View>
                      ))}
                  </View>
                )}

                {/* Skills/Languages - Render as one block */}
                {isUnorderedSection && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 3,
                      marginBottom: 10,
                    }}
                  >
                    {Array.isArray(items) &&
                      items.map((item: any, i: number) => (
                        <View
                          key={i}
                          style={{
                            backgroundColor: "#2563eb",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 4,
                            marginBottom: 4,
                          }}
                        >
                          <Text
                            style={{
                              color: "#ffffff",
                              fontFamily: mapFontFamily(
                                template.styles.typography.fontFamily
                              ),
                              fontSize:
                                template.styles.typography.bodySize || 10,
                            }}
                          >
                            {item.name}
                          </Text>
                        </View>
                      ))}
                  </View>
                )}

                {/* Other sections - Individual items */}
                {Array.isArray(items) &&
                  !isUnorderedSection &&
                  !isCustomSection &&
                  items.map((item: any, i: number) => (
                    <View key={i} style={styles.itemContainer}>
                      {/* Unbreakable Header Block: This ensures the title, company, and dates stay on one page. */}
                      <View style={styles.itemHeaderBlock} wrap={false}>
                        {/* Work Experience Header */}
                        {(item.title || item.jobTitle) && item.company && (
                          <View>
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                              }}
                            >
                              <Text style={styles.itemTitle}>
                                {(item.title || item.jobTitle) as string} —{" "}
                                <Text style={{ fontStyle: "italic" }}>
                                  {item.company}
                                </Text>
                              </Text>

                              {item.startDate ? (
                                <Text style={styles.itemDate}>
                                  {item.startDate} –{" "}
                                  {item.endDate ||
                                    (item.current ? "Present" : "")}
                                </Text>
                              ) : null}
                            </View>

                            {item.location && (
                              <Text style={styles.itemDate}>
                                {item.location}
                              </Text>
                            )}
                          </View>
                        )}

                        {/* Education Header */}
                        {item.degree && item.school && (
                          <View>
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                              }}
                            >
                              <Text style={styles.itemTitle}>
                                {item.degree} —{" "}
                                <Text style={{ fontStyle: "italic" }}>
                                  {item.field}
                                </Text>
                              </Text>
                              {item.startDate && (
                                <Text style={styles.itemDate}>
                                  {item.startDate} – {item.endDate}
                                </Text>
                              )}
                            </View>
                            {item.location && (
                              <Text style={styles.itemDate}>
                                {item.school}
                                {item.gpa && ` • GPA: ${item.gpa}`}
                              </Text>
                            )}
                          </View>
                        )}

                        {/* Projects Header */}
                        {item.name && section.type === "projects" && (
                          <Text style={styles.itemTitle}>
                            {item.name}
                            {item.url && (
                              <Text style={{ color: "#2563eb" }}>
                                {" "}
                                • {item.url}
                              </Text>
                            )}
                          </Text>
                        )}

                        {/* Certifications Header */}
                        {item.name &&
                          item.issuer &&
                          section.type === "certifications" && (
                            <Text style={styles.itemTitle}>
                              {item.name} — {item.issuer}
                            </Text>
                          )}

                        {/* Awards Header */}
                        {item.title &&
                          item.issuer &&
                          section.type === "awards" && (
                            <Text style={styles.itemTitle}>
                              {item.title} — {item.issuer}
                            </Text>
                          )}

                        {/* Interests Header/Content (small enough to be unbreakable) */}
                        {item.name && section.type === "interests" && (
                          <Text style={styles.itemDescription}>
                            {item.name}
                            {item.description && ` - ${item.description}`}
                          </Text>
                        )}

                        {/* Professional Summary (Content is typically small and is the full block) */}
                        {item.summary &&
                        section.type === "professional-summary" ? (
                          <RichPdf html={item.summary} template={template} />
                        ) : null}
                      </View>

                      {/* Splittable Content: This content is allowed to break across pages. */}

                      {/* Description/Bullets for Work Experience & Projects */}
                      {((item.title || item.jobTitle) && item.company) ||
                      (item.name && section.type === "projects") ? (
                        <>
                          {item.description ? (
                            <RichPdf
                              html={item.description}
                              template={template}
                            />
                          ) : (
                            Array.isArray(item.bullets) &&
                            item.bullets.length > 0 && (
                              <View style={styles.bulletList}>
                                {item.bullets.map((b: string, idx: number) => (
                                  <Text key={idx} style={styles.bullet}>
                                    • {b}
                                  </Text>
                                ))}
                              </View>
                            )
                          )}

                          {/* Project/Work Techs */}
                          {Array.isArray(item.technologies) &&
                            item.technologies.length > 0 && (
                              <Text style={styles.itemDate}>
                                Technologies: {item.technologies.join(", ")}
                              </Text>
                            )}
                        </>
                      ) : null}

                      {/* Remaining detail text for Certifications and Awards */}
                      {item.date && section.type === "certifications" && (
                        <Text style={styles.itemDate}>
                          {item.date}
                          {item.credentialId && ` • ID: ${item.credentialId}`}
                        </Text>
                      )}
                      {item.date && section.type === "awards" && (
                        <Text style={styles.itemDate}>{item.date}</Text>
                      )}
                      {item.description && section.type === "awards" ? (
                        <RichPdf html={item.description} template={template} />
                      ) : null}
                    </View>
                  ))}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}
