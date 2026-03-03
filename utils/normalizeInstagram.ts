export default function normalizeInstagram(handle: string): string {
    return handle.replace(/^@/, "").toLowerCase();
}
