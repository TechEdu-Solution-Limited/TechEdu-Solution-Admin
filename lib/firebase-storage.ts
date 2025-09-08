import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Storage folder paths
export const STORAGE_FOLDERS = {
  ASSETS: "assets",
  ATTACHMENTS: "attachments",
  MATERIALS: "materials",
} as const;

export type StorageFolder = keyof typeof STORAGE_FOLDERS;

// File type validation
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "application/zip",
  "application/x-rar-compressed",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

// Generate unique filename
const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  return `${timestamp}_${randomString}.${extension}`;
};

// Validate file type based on folder
const validateFileType = (file: File, folder: StorageFolder): boolean => {
  switch (folder) {
    case "ASSETS":
      return ALLOWED_IMAGE_TYPES.includes(file.type);
    case "ATTACHMENTS":
    case "MATERIALS":
      return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES].includes(
        file.type
      );
    default:
      return false;
  }
};

// Get file size in MB
const getFileSizeInMB = (file: File): number => {
  return file.size / (1024 * 1024);
};

// Upload file to Firebase Storage
export const uploadFileToFirebase = async (
  file: File,
  folder: StorageFolder,
  options?: {
    maxSizeMB?: number;
    customPath?: string;
  }
): Promise<string> => {
  try {
    // Validate file type
    if (!validateFileType(file, folder)) {
      throw new Error(
        `Invalid file type for ${folder} folder. Allowed types: ${
          folder === "ASSETS"
            ? "Images only (JPEG, PNG, WebP, GIF)"
            : "Images and documents (JPEG, PNG, WebP, GIF, PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, RAR, XLSX, CSV)"
        }`
      );
    }

    // Check file size (default 10MB, configurable)
    const maxSize = options?.maxSizeMB || 10;
    const fileSizeMB = getFileSizeInMB(file);
    if (fileSizeMB > maxSize) {
      throw new Error(
        `File size (${fileSizeMB.toFixed(
          2
        )}MB) exceeds maximum allowed size (${maxSize}MB)`
      );
    }

    // Generate unique filename
    const fileName = options?.customPath || generateUniqueFileName(file.name);
    const folderPath = STORAGE_FOLDERS[folder];
    const fullPath = `${folderPath}/${fileName}`;

    // Create storage reference
    const storageRef = ref(storage, fullPath);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Firebase Storage upload error:", error);
    throw new Error(
      `Failed to upload file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Upload image to assets folder (replaces cloudinary for images)
export const uploadImageToFirebase = async (file: File): Promise<string> => {
  return uploadFileToFirebase(file, "ASSETS", { maxSizeMB: 5 });
};

// Upload attachment to attachments folder
export const uploadAttachmentToFirebase = async (
  file: File
): Promise<string> => {
  return uploadFileToFirebase(file, "ATTACHMENTS", { maxSizeMB: 20 });
};

// Upload material to materials folder
export const uploadMaterialToFirebase = async (file: File): Promise<string> => {
  return uploadFileToFirebase(file, "MATERIALS", { maxSizeMB: 50 });
};

// Delete file from Firebase Storage
export const deleteFileFromFirebase = async (
  downloadURL: string
): Promise<void> => {
  try {
    // Extract file path from download URL
    const url = new URL(downloadURL);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);

    if (!pathMatch) {
      throw new Error("Invalid download URL format");
    }

    const filePath = decodeURIComponent(pathMatch[1]);
    const fileRef = ref(storage, filePath);

    await deleteObject(fileRef);
  } catch (error) {
    console.error("Firebase Storage delete error:", error);
    throw new Error(
      `Failed to delete file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Get file info from download URL
export const getFileInfoFromURL = (downloadURL: string) => {
  try {
    const url = new URL(downloadURL);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);

    if (!pathMatch) {
      return null;
    }

    const filePath = decodeURIComponent(pathMatch[1]);
    const pathParts = filePath.split("/");

    return {
      folder: pathParts[0],
      fileName: pathParts[pathParts.length - 1],
      fullPath: filePath,
    };
  } catch (error) {
    console.error("Error parsing file URL:", error);
    return null;
  }
};

// Utility function to check if URL is from Firebase Storage
export const isFirebaseStorageURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes("firebasestorage.googleapis.com");
  } catch {
    return false;
  }
};

// Get folder-specific upload function
export const getUploadFunction = (folder: StorageFolder) => {
  switch (folder) {
    case "ASSETS":
      return uploadImageToFirebase;
    case "ATTACHMENTS":
      return uploadAttachmentToFirebase;
    case "MATERIALS":
      return uploadMaterialToFirebase;
    default:
      throw new Error(`Unknown folder: ${folder}`);
  }
};

// Batch upload multiple files
export const uploadMultipleFiles = async (
  files: File[],
  folder: StorageFolder,
  options?: {
    maxSizeMB?: number;
    maxFiles?: number;
  }
): Promise<string[]> => {
  const maxFiles = options?.maxFiles || 10;

  if (files.length > maxFiles) {
    throw new Error(`Too many files. Maximum allowed: ${maxFiles}`);
  }

  const uploadPromises = files.map((file) =>
    uploadFileToFirebase(file, folder, { maxSizeMB: options?.maxSizeMB })
  );

  try {
    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs;
  } catch (error) {
    console.error("Batch upload error:", error);
    throw new Error(
      `Failed to upload files: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export default storage;
