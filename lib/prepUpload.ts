// Downscale a chosen photo client-side so uploads stay small. Falls back to the
// original file if the browser can't decode it (e.g. some HEIC). Client-only
// (uses createImageBitmap + canvas) — import from client components.
export async function prepUpload(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const max = 1600;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), "image/jpeg", 0.85),
    );
    if (blob) return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } catch {
    /* fall through */
  }
  return file;
}
