import axios from "axios";
import { BASE_URL } from "../config/config";

export type MediaFolder =
    | "accommodations"
    | "gallery"
    | "promotions"
    | "hero"
    | "ratings"
    | "services"
    | "stories"
    | "videos"
    | "packages"
    | "experiences"
    | "general";

export interface UploadImageResult {
    success: boolean;
    filename: string;
    url: string;
    imageUrl: string;
    path: string;
    optimized?: boolean;
    originalBytes?: number;
    outputBytes?: number;
}

export async function uploadImageFile(
    file: File,
    folder: MediaFolder,
): Promise<UploadImageResult> {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    const response = await axios.post<UploadImageResult>(
        `${BASE_URL}/upload?folder=${folder}`,
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
        },
    );

    if (!response.data?.success || !response.data?.url) {
        throw new Error("Image upload failed");
    }

    return response.data;
}

export async function uploadMediaFile(
    file: File,
    folder: MediaFolder = "stories",
): Promise<UploadImageResult> {
    const formData = new FormData();
    formData.append("media", file);
    formData.append("folder", folder);

    const response = await axios.post<UploadImageResult>(
        `${BASE_URL}/upload/media?folder=${folder}`,
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 20 * 60 * 1000,
        },
    );

    if (!response.data?.success || !response.data?.url) {
        throw new Error("Media upload failed");
    }

    return response.data;
}

export function resolveMediaUrl(url?: string | null): string {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/storage") || url.startsWith("/uploads")) {
        return `${BASE_URL}${url}`;
    }
    return url;
}
