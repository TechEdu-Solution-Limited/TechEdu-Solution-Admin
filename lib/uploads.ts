// lib/uploads.ts

// Resolve API base (Coolify Nest API)
function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }
  return "";
}

// Upload to backend via /api/uploads/image
export async function uploadToBackend(
  file: File,
  folder?: string
): Promise<string> {
  const base = getApiBase();
  const formData = new FormData();
  formData.append("file", file);
  if (folder) {
    // backend uses this to create subfolders like /uploads/course-materials
    formData.append("folder", folder);
  }

  const res = await fetch(`${base}/api/uploads/image`, {
    method: "POST",
    body: formData,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignore parse error, handle by status
  }

  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      `Upload failed with status ${res.status}`;
    throw new Error(msg);
  }

  const url = data?.url || data?.fileUrl || data?.filePath;
  if (!url) {
    throw new Error("Upload succeeded but no URL was returned from server");
  }

  return url as string;
}

// Extract "course-materials/123-file.pdf" from "https://.../uploads/course-materials/123-file.pdf"
function getRelativeFromUrl(url: string): string | null {
  try {
    const base = getApiBase() || undefined;
    const u = new URL(url, base);
    const pathname = u.pathname; // e.g. /uploads/course-materials/123.pdf
    if (!pathname.startsWith("/uploads/")) return null;
    return pathname.replace(/^\/uploads\//, "");
  } catch {
    return null;
  }
}

// Delete file from backend (requires backend DELETE /api/uploads?file=...)
export async function deleteBackendFile(fileUrl: string): Promise<void> {
  const base = getApiBase();
  const rel = getRelativeFromUrl(fileUrl);
  if (!rel) return;

  await fetch(`${base}/api/uploads?file=${encodeURIComponent(rel)}`, {
    method: "DELETE",
  });
}
