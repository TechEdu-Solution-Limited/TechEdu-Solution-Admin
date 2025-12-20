// utils/cv/sectionHelpers.ts
// utils/cv/sectionHelpers.ts
import { ResumeSection } from "@/types/cv/index";

export const isHtml = (s?: string) => !!s && /<\/?[a-z][\s\S]*>/i.test(s);
export const esc = (s = "") =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
export const ensureHtml = (s?: string) =>
  !s ? "" : isHtml(s) ? s : `<p>${esc(s)}</p>`;

function linesFromString(s?: string) {
  if (!s) return [];
  return s
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function toExperienceHtml(
  description?: string,
  achievements?: string[] | string
) {
  const blocks: string[] = [];
  const descHtml = ensureHtml(description);
  if (descHtml) blocks.push(descHtml);

  const ach = Array.isArray(achievements)
    ? achievements
    : linesFromString(achievements);
  if (ach.length)
    blocks.push(`<ul>${ach.map((li) => `<li>${esc(li)}</li>`).join("")}</ul>`);

  return blocks.join("");
}

export function formatSectionContent(section: ResumeSection) {
  switch (section.type) {
    case "work-experience": {
      const data = Array.isArray(section.data) ? section.data : [];
      return data.map((e: any) => {
        const bullets: string[] = Array.isArray(e.achievements)
          ? e.achievements
          : Array.isArray(e.bullets)
          ? e.bullets
          : linesFromString(e.achievements);

        return {
          id: e.id,
          title: e.position || e.title || e.jobTitle,
          jobTitle: e.jobTitle || e.position || e.title,
          company: e.company,
          startDate: e.startDate,
          endDate: e.current ? "Present" : e.endDate,
          location: e.location,
          description: toExperienceHtml(e.description, bullets), // 👈 merged HTML
          bullets, // legacy (optional)
          technologies: Array.isArray(e.technologies) ? e.technologies : [],
          current: !!e.current,
        };
      });
    }

    case "education": {
      const data = Array.isArray(section.data) ? section.data : [];
      return data.map((e: any) => ({
        id: e.id,
        degree: e.degree,
        field: e.field,
        school: e.institution,
        startDate: e.startDate,
        endDate: e.current ? "Present" : e.endDate,
        location: e.location,
        gpa: e.gpa,
        description: ensureHtml(e.description),
      }));
    }

    case "skills": {
      const raw = Array.isArray(section.data)
        ? section.data
        : Array.isArray((section as any)?.data?.skills)
        ? (section as any).data.skills
        : [];
      return raw
        .map((skill: any) => ({
          name:
            typeof skill?.name === "string"
              ? skill.name
              : String(skill?.name ?? ""),
          level: skill?.level,
          category: skill?.category,
        }))
        .filter((s: any) => s.name && s.name.trim().length > 0);
    }

    case "languages":
      return Array.isArray(section.data)
        ? section.data.map((lang: any) => ({
            name: lang.name,
            level: lang.level,
          }))
        : [];

    case "projects":
      return Array.isArray(section.data)
        ? section.data.map((p: any) => ({
            name: p.name,
            description: ensureHtml(p.description),
            url: p.url,
            technologies: p.technologies || [],
            startDate: p.startDate,
            endDate: p.endDate || "Present",
          }))
        : [];

    case "certifications":
      return Array.isArray(section.data)
        ? section.data.map((c: any) => ({
            name: c.name,
            issuer: c.issuer,
            date: c.date,
            credentialId: c.credentialId,
          }))
        : [];

    case "awards":
      return Array.isArray(section.data)
        ? section.data.map((a: any) => ({
            title: a.title,
            issuer: a.issuer,
            date: a.date,
            description: ensureHtml(a.description),
          }))
        : [];

    case "interests":
      return Array.isArray(section.data)
        ? section.data.map((i: any) => ({
            name: i.name,
            description: i.description,
          }))
        : [];

    case "professional-summary":
      return [{ summary: ensureHtml(section.data?.summary) }];

    case "custom": {
      // Custom sections can be a single object or an array
      const data = Array.isArray(section.data) ? section.data : [section.data];
      return data
        .filter((item: any) => item && (item.title || item.content))
        .map((item: any) => ({
          title: item.title || "",
          content: ensureHtml(item.content || ""),
        }));
    }

    case "personal-info":
      return [
        {
          firstName: section.data.firstName,
          lastName: section.data.lastName,
          email: section.data.email,
          phone: section.data.phone,
          location: section.data.location,
          targetedJobTitle: section.data.targetedJobTitle,
          image: section.data.image,
          linkedin: section.data.linkedin,
          github: section.data.github,
          twitter: section.data.twitter,
          instagram: section.data.instagram,
          website: section.data.website,
        },
      ];

    default:
      return section.data;
  }
}

/**
 * Display name helper (unchanged)
 */
export function getSectionDisplayName(
  sectionType: string,
  section?: ResumeSection
): string {
  if (section?.heading) return section.heading;

  const displayNames: Record<string, string> = {
    "work-experience": "Work Experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
    projects: "Projects",
    certifications: "Certifications",
    awards: "Awards",
    interests: "Interests",
    "professional-summary": "Professional Summary",
    "personal-info": "Personal Information",
    custom: section?.heading || (section?.data as any)?.title || "Custom Section",
  };

  return displayNames[sectionType] || sectionType;
}
