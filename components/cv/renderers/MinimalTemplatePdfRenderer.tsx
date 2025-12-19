/**
 * Minimal Template PDF Renderer (drop-in)
 *
 * REVISED to include proper page break logic:
 * - Item Headers (Title/Dates/Company) are UNBREAKABLE (wrap={false}).
 * - Item Content (Description/Bullets) is BREAKABLE (default).
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
import { SECTION_ORDER } from "@/utils/cv/templateConstants";
import RichPdf from "../RichPdf";
import { BulletList } from "./BulletList";

// (Optional) Legacy helper used only for explicit bullets[] fallback.
function convertHtmlToPdfText(html: string): string {
  if (!html) return "";
  let result = html;
  // ... (convertHtmlToPdfText implementation remains the same)
  result = result.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, c) => {
    const items = c.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    return (
      items
        .map(
          (item: string, i: number) =>
            `${i + 1}. ${convertHtmlToPdfText(
              item.replace(/^<li[^>]*>/i, "").replace(/<\/li>$/i, "")
            )}`
        )
        .join("\n") + "\n"
    );
  });
  result = result.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, c) => {
    const items = c.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    return (
      items
        .map(
          (item: string) =>
            `• ${convertHtmlToPdfText(
              item.replace(/^<li[^>]*>/i, "").replace(/<\/li>$/i, "")
            )}`
        )
        .join("\n") + "\n"
    );
  });
  result = result.replace(/<br[^>]*\/?>/gi, "\n");
  result = result.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n");
  result = result.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "$1");
  result = result.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "$1");
  result = result.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "$1");
  result = result.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "$1");
  result = result.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, "$1");
  result = result.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, "$1");
  result = result.replace(/<strike[^>]*>([\s\S]*?)<\/strike>/gi, "$1");
  result = result.replace(
    /<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
    "$2 ($1)"
  );
  result = result.replace(/<[^>]*>/g, "");
  result = result
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
  return result
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

export function MinimalTemplatePdfRenderer({
  data,
  template,
}: {
  data: ResumeSection[];
  template: TemplateLayout;
}) {
  registerPDFFonts();

  const personalInfo = data.find((s) => s.type === "personal-info");
  const otherSections = data
    .filter((s) => s.type !== "personal-info")
    .sort((a, b) => {
      const aIndex = SECTION_ORDER.indexOf(a.type as string);
      const bIndex = SECTION_ORDER.indexOf(b.type as string);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

  const fontFamily = mapFontFamily(template.styles.typography.fontFamily);
  const textColor = template.styles.colors.text;
  const secondary = template.styles.colors.secondary || "#6b7280";

  const PAD_X = 24; // horizontal page padding (all pages)
  const PAD_Y = 18; // vertical "page padding" (top & bottom on every page)

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
      paddingHorizontal: 18,
      paddingVertical: 14,
      marginBottom: 0,
    },
    headerLeft: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
    profileImage: {
      width: 88,
      height: 88,
      borderRadius: 44,
      objectFit: "cover",
    },
    nameTitle: { flexDirection: "column" },
    name: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
    title: {
      fontSize: 12,
      color: secondary,
      fontStyle: "italic",
      paddingBottom: 4,
    },
    contactInfo: { flexDirection: "column", alignItems: "flex-end", gap: 6 },
    contactItem: { fontSize: 10 },
    socialLinks: { flexDirection: "column", marginTop: 6, gap: 3 },
    socialLink: { fontSize: 10 },

    mainContent: { paddingVertical: PAD_Y },
    sectionContainer: { marginBottom: 10 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "bold",
      marginBottom: 8,
      backgroundColor:
        template.styles.colors.sectionHeadingBackground || "#e5e7eb",
      paddingVertical: 6,
      paddingHorizontal: 8,
      textTransform: "uppercase",
      letterSpacing: 0.05,
      borderRadius: 3,
      // Section title itself should be unbreakable to stay with its first item
      wrap: false,
    },
    // ⭐ NEW: Container for the UNBREAKABLE header content ⭐
    itemHeaderBlock: {
      marginBottom: 2, // Small space after the header before description starts
      wrap: false,
    },
    itemContainer: { marginBottom: 10 },

    rowTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    itemTitle: {
      fontSize: template.styles.typography.bodySize || 10,
      fontWeight: "bold",
    },
    itemDate: {
      fontSize: (template.styles.typography.bodySize || 10) - 1,
      color: secondary,
    },
    itemSubtle: {
      fontSize: (template.styles.typography.bodySize || 10) - 1,
      color: secondary,
      marginTop: 2,
    },

    // Skills/Languages chips
    chipWrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
    chip: {
      backgroundColor: template.styles.colors.primary || "#dc2626",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 3,
      marginRight: 6,
      marginBottom: 6,
    },
    chipText: {
      color: "#fff",
      fontSize: template.styles.typography.bodySize || 10,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - No 'fixed' prop, so it only renders on the first page. */}
        {personalInfo && (
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {personalInfo.data.image ? (
                <Image
                  src={personalInfo.data.image}
                  style={styles.profileImage}
                />
              ) : null}
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
                {personalInfo.data.website && (
                  <Text style={styles.socialLink}>
                    <Text style={{ fontWeight: "600" }}>Website: </Text>
                    {personalInfo.data.website}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Main */}
        <View style={styles.mainContent}>
          {otherSections.map((section) => {
            const items = formatSectionContent(section);
            const displayName = getSectionDisplayName(section.type, section);

            return (
              <View key={section.id} style={styles.sectionContainer}>
                {/* Section Title has wrap={false} to ensure it stays with its content */}
                <Text style={styles.sectionTitle}>{displayName}</Text>

                {/* Skills/Languages - Render as one block, assumed to be short */}
                {((section.type as string) === "skills" ||
                  (section.type as string) === "languages") && (
                  <View style={styles.chipWrap}>
                    {Array.isArray(items) &&
                      items.map((item: any, i: number) => (
                        <View key={i} style={styles.chip}>
                          <Text style={styles.chipText}>{item.name}</Text>
                        </View>
                      ))}
                  </View>
                )}

                {/* Custom Sections - Render content directly */}
                {(section.type as string) === "custom" && (
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

                {/* Other Sections */}
                {Array.isArray(items) &&
                  (section.type as string) !== "skills" &&
                  (section.type as string) !== "languages" &&
                  (section.type as string) !== "custom" &&
                  items.map((item: any, i: number) => (
                    <View key={i} style={styles.itemContainer}>
                      {/* ⭐ UNBREAKABLE HEADER BLOCK (wrap={false}) ⭐ */}
                      <View style={styles.itemHeaderBlock}>
                        {/* Work Experience Header */}
                        {(item.title || item.jobTitle) && item.company && (
                          <View>
                            <View style={styles.rowTop}>
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
                              <Text style={styles.itemSubtle}>
                                {item.location}
                              </Text>
                            )}
                          </View>
                        )}

                        {/* Education Header */}
                        {item.degree && item.field && (
                          <View>
                            <View style={styles.rowTop}>
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
                            {(item.school || item.gpa) && (
                              <Text style={styles.itemSubtle}>
                                {item.school}
                                {item.gpa ? ` • GPA: ${item.gpa}` : ""}
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
                            <View>
                              <Text style={styles.itemTitle}>
                                {item.name} — {item.issuer}
                              </Text>
                              {/* Date and ID are also usually part of the header block */}
                              {item.date && (
                                <Text style={styles.itemSubtle}>
                                  {item.date}
                                  {item.credentialId
                                    ? ` • ID: ${item.credentialId}`
                                    : ""}
                                </Text>
                              )}
                            </View>
                          )}

                        {/* Awards Header */}
                        {item.title &&
                          item.issuer &&
                          section.type === "awards" && (
                            <View>
                              <Text style={styles.itemTitle}>
                                {item.title} — {item.issuer}
                              </Text>
                              {item.date && (
                                <Text style={styles.itemSubtle}>
                                  {item.date}
                                </Text>
                              )}
                            </View>
                          )}

                        {/* Interests Header/Content (small enough to be unbreakable) */}
                        {item.name && section.type === "interests" && (
                          <Text style={styles.itemSubtle}>
                            {item.name}
                            {item.description ? ` - ${item.description}` : ""}
                          </Text>
                        )}

                        {/* Professional Summary (Content is the full block) */}
                        {item.summary &&
                        section.type === "professional-summary" ? (
                          <RichPdf html={item.summary} template={template} />
                        ) : null}
                      </View>
                      {/* ⭐ END UNBREAKABLE HEADER BLOCK ⭐ */}

                      {/* ⬇️ BREAKABLE CONTENT (Description/Bullets) ⬇️ */}

                      {/* Work Experience / Project Descriptions (Only render if not a summary, cert, or award) */}
                      {((item.title || item.jobTitle) && item.company) ||
                      (item.name && section.type === "projects") ? (
                        <>
                          {/* RichPdf for merged HTML (paragraphs + lists) */}
                          {item.description ? (
                            <RichPdf
                              html={item.description}
                              template={template}
                            />
                          ) : null}

                          {/* Legacy bullets fallback (only if no list in description) */}
                          {(() => {
                            const hasList =
                              typeof item.description === "string" &&
                              /<li[\s>]/i.test(item.description);
                            if (
                              !hasList &&
                              Array.isArray(item.bullets) &&
                              item.bullets.length > 0
                            ) {
                              return (
                                <BulletList
                                  items={item.bullets.map((b: string) =>
                                    convertHtmlToPdfText(b)
                                  )}
                                  fontSize={
                                    (template.styles.typography.bodySize ||
                                      10) - 1
                                  }
                                  color={textColor}
                                  fontFamily={fontFamily}
                                />
                              );
                            }
                            return null;
                          })()}

                          {/* Optional technologies */}
                          {Array.isArray(item.technologies) &&
                            item.technologies.length > 0 && (
                              <Text style={styles.itemDate}>
                                Technologies: {item.technologies.join(", ")}
                              </Text>
                            )}
                        </>
                      ) : null}

                      {/* Education Description */}
                      {item.degree && item.field && item.description ? (
                        <RichPdf html={item.description} template={template} />
                      ) : null}

                      {/* Certifications Description (Renders AFTER the date/id which were moved to the header) */}
                      {item.description && section.type === "certifications" ? (
                        <RichPdf html={item.description} template={template} />
                      ) : null}

                      {/* Awards Description (Renders AFTER the date which was moved to the header) */}
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
