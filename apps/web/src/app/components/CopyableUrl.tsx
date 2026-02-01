"use client";

export function CopyableUrl({ url }: { url: string }) {
  return (
    <input
      type="text"
      readOnly
      value={url}
      onClick={(e) => (e.target as HTMLInputElement).select()}
      className="cl-copy-url"
    />
  );
}
