/**
 * Classic Template PDF Renderer
 *
 * Renders the classic template for PDF using shared section logic
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
import { ResumeSection } from "@/types";
import { TemplateLayout } from "@/types/template";
import {
  formatSectionContent,
  getSectionDisplayName,
} from "@/utils/sectionHelpers";
import { registerPDFFonts } from "@/utils/fontRegistration";
import { mapFontFamily } from "@/utils/pdfFontMapping";
import {
  SPACING,
  FONT_SIZES,
  LAYOUT,
  SECTION_ORDER,
} from "@/utils/templateConstants";
import {
  scaleToPDF,
  getConsistentFontSize,
  getConsistentPadding,
  PDF_SCALE_FACTOR,
  A4_WIDTH,
  A4_HEIGHT,
} from "@/utils/pdfScaling";
import { BulletList } from "./BulletList";

export function MinimalTemplatePdfRenderer({
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
      padding: 20, // Reduced padding to match web preview better
      fontSize: 10, // Smaller base font size to match web preview
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
      lineHeight: 1.4, // Tighter line height
      color: template.styles.colors.text,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      backgroundColor: template.styles.colors.headerBackground || "#f8fafc",
      borderBottomWidth: 2,
      borderBottomColor: template.styles.colors.primary || "#dc2626",
      paddingHorizontal: 20, // Reduced padding
      paddingVertical: 15, // Reduced padding
      marginBottom: 0,
      lineHeight: 1.0,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 16, // space-x-4 = 16px
      lineHeight: 1,
    },
    profileImage: {
      width: 90, // Reduced size to match web preview better
      height: 90, // Reduced size to match web preview better
      borderRadius: 30, // rounded-full
      objectFit: "cover",
    },
    nameTitle: {
      flexDirection: "column",
    },
    name: {
      fontSize: 18, // Reduced from 24 to match web preview better
      fontWeight: "bold",
      color: template.styles.colors.text,
      marginBottom: 4,
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
    },
    title: {
      fontSize: 12, // text-lg = 14px
      color: template.styles.colors.secondary,
      marginTop: 4, // mt-1 = 4px
      paddingBottom: 4,
      fontStyle: "italic",
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
    },
    contactInfo: {
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 8, // space-y-2 = 8px
    },
    contactItem: {
      fontSize: 10, // text-sm = 14px
      color: template.styles.colors.text,
      fontWeight: "normal",
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
    },
    socialLinks: {
      flexDirection: "column",
      marginTop: 8, // mt-2 = 8px
      gap: 4, // space-y-1 = 4px
    },
    socialLink: {
      fontSize: 10, // text-sm = 14px
      color: template.styles.colors.text,
      fontWeight: "normal",
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
    },
    mainContent: {
      //   paddingHorizontal: 32, // p-8 = 32px
      paddingVertical: 16, // p-8 = 32px
    },
    sectionContainer: {
      marginBottom: 8, // space-y-6 = 18px
    },
    sectionTitle: {
      fontSize: 12, // Match HTML renderer
      fontWeight: "bold",
      marginBottom: 8, // space-y-3 = 12px
      backgroundColor:
        template.styles.colors.sectionHeadingBackground || "#e5e7eb",
      paddingVertical: 6,
      paddingHorizontal: 8,
      textTransform: "uppercase",
      letterSpacing: 0.05, // tracking-wide
      color: template.styles.colors.text,
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
      borderRadius: 3,
    },
    sectionContent: {
      marginBottom: 12, // space-y-3 = 12px
    },
    itemContainer: {
      marginBottom: 10, // space-y-1 = 4px
    },
    itemTitle: {
      fontSize: template.styles.typography.bodySize || 10,
      fontWeight: "bold", // font-semibold
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
      fontSize: (template.styles.typography.bodySize || 10) - 1, // text-xs
      color: template.styles.colors.secondary,
      marginBottom: 4,
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
    },
    itemDescription: {
      fontSize: (template.styles.typography.bodySize || 10) - 2,
      color: template.styles.colors.text,
      marginBottom: 4,
      fontFamily: mapFontFamily(template.styles.typography.fontFamily),
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        {personalInfo && (
          <View style={styles.header}>
            {/* Left Side - Image, Name, Title, Contact */}
            <View style={styles.headerLeft}>
              {personalInfo.data.image && (
                <Image
                  src={personalInfo.data.image}
                  style={styles.profileImage}
                />
              )}
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

            {/* Right Side - Location and Social Links */}
            <View style={styles.contactInfo}>
              {/* Social Links */}
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

        {/* Main Content */}
        <View style={styles.mainContent}>
          {otherSections.map((section) => {
            const items = formatSectionContent(section);
            const displayName = getSectionDisplayName(section.type, section);

            return (
              <View key={section.id} style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{displayName}</Text>

                {/* Skills - Render once for the entire section */}
                {(section.type as string) === "skills" && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: 10,
                    }}
                  >
                    {Array.isArray(items) &&
                      items.map((item: any, i: number) => (
                        <View
                          key={i}
                          style={{
                            backgroundColor:
                              template.styles.colors.primary || "#dc2626",
                            paddingHorizontal: 8, // px-2 = 8px
                            paddingVertical: 4, // py-1 = 4px
                            borderRadius: 3, // rounded = 3px
                            marginBottom: 4,
                          }}
                        >
                          <Text
                            style={{
                              color: "#ffffff", // text-white
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

                {/* Languages - Render once for the entire section */}
                {(section.type as string) === "languages" && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: 10,
                    }}
                  >
                    {Array.isArray(items) &&
                      items.map((item: any, i: number) => (
                        <View
                          key={i}
                          style={{
                            backgroundColor:
                              template.styles.colors.primary || "#dc2626",
                            paddingHorizontal: 8, // px-2 = 8px
                            paddingVertical: 4, // py-1 = 4px
                            borderRadius: 3, // rounded = 3px
                            marginBottom: 4,
                          }}
                        >
                          <Text
                            style={{
                              color: "#ffffff", // text-white
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
                  (section.type as string) !== "skills" &&
                  (section.type as string) !== "languages" &&
                  items.map((item: any, i: number) => (
                    <View key={i} style={styles.itemContainer}>
                      {/* Work Experience */}
                      {item.title && item.company && (
                        <View>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <Text style={styles.itemTitle}>
                              {item.title} —{" "}
                              <Text style={{ fontStyle: "italic" }}>
                                {item.company}
                              </Text>
                            </Text>
                            {item.startDate && (
                              <Text style={styles.itemDate}>
                                {item.startDate} – {item.endDate}
                              </Text>
                            )}
                          </View>
                          {item.location && (
                            <Text style={styles.itemDate}>{item.location}</Text>
                          )}
                          {item.bullets?.length > 0 && (
                            <BulletList
                              items={item.bullets}
                              fontSize={
                                (template.styles.typography.bodySize || 10) - 1
                              }
                              color={template.styles.colors.text}
                              fontFamily={mapFontFamily(
                                template.styles.typography.fontFamily
                              )}
                            />
                          )}
                        </View>
                      )}

                      {/* Education */}
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
                                {item.school}
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
                              {item.location}
                              {item.gpa && ` • GPA: ${item.gpa}`}
                            </Text>
                          )}
                        </View>
                      )}

                      {/* Projects */}
                      {item.name && section.type === "projects" && (
                        <View>
                          <Text style={styles.itemTitle}>
                            {item.name}
                            {item.url && (
                              <Text style={{ color: "#2563eb" }}>
                                {" "}
                                • {item.url}
                              </Text>
                            )}
                          </Text>
                          {item.description && (
                            <Text style={styles.itemDescription}>
                              {item.description.replace(/<[^>]*>/g, "")}
                            </Text>
                          )}
                          {item.technologies?.length > 0 && (
                            <Text style={styles.itemDate}>
                              Technologies: {item.technologies.join(", ")}
                            </Text>
                          )}
                        </View>
                      )}

                      {/* Certifications */}
                      {item.name &&
                        item.issuer &&
                        section.type === "certifications" && (
                          <View>
                            <Text style={styles.itemTitle}>
                              {item.name} — {item.issuer}
                            </Text>
                            {item.date && (
                              <Text style={styles.itemDate}>
                                {item.date}
                                {item.credentialId &&
                                  ` • ID: ${item.credentialId}`}
                              </Text>
                            )}
                          </View>
                        )}

                      {/* Awards */}
                      {item.title &&
                        item.issuer &&
                        section.type === "awards" && (
                          <View>
                            <Text style={styles.itemTitle}>
                              {item.title} — {item.issuer}
                            </Text>
                            {item.date && (
                              <Text style={styles.itemDate}>{item.date}</Text>
                            )}
                            {item.description && (
                              <Text style={styles.itemDescription}>
                                {item.description.replace(/<[^>]*>/g, "")}
                              </Text>
                            )}
                          </View>
                        )}

                      {/* Interests */}
                      {item.name && section.type === "interests" && (
                        <Text style={styles.itemDescription}>
                          {item.name}
                          {item.description && ` - ${item.description}`}
                        </Text>
                      )}

                      {/* Professional Summary */}
                      {item.summary &&
                        section.type === "professional-summary" && (
                          <Text style={styles.itemDescription}>
                            {item.summary.replace(/<[^>]*>/g, "")}
                          </Text>
                        )}
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
