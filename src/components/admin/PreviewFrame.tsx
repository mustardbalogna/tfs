import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children inside a same-origin iframe so the preview responds to
 * *its own* width (Tailwind breakpoints are viewport based) — this is what
 * makes the tablet/mobile toggles accurate. The parent document's stylesheets
 * are mirrored into the frame and kept in sync (Vite HMR swaps style tags).
 */
export default function PreviewFrame({
  width,
  children,
  className,
  onDocument,
}: {
  width: number | "100%";
  children: ReactNode;
  className?: string;
  /** Fires with the frame's document once it's ready (and null on unmount). */
  onDocument?: (doc: Document | null) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null);

  const syncStyles = useCallback((doc: Document) => {
    doc.head.querySelectorAll("[data-mirrored]").forEach((n) => n.remove());
    document.head.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
      const clone = node.cloneNode(true) as HTMLElement;
      clone.setAttribute("data-mirrored", "");
      doc.head.appendChild(clone);
    });
  }, []);

  const handleLoad = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.documentElement.lang = "en";
    let meta = doc.head.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = doc.createElement("meta");
      meta.setAttribute("name", "viewport");
      meta.setAttribute("content", "width=device-width, initial-scale=1");
      doc.head.appendChild(meta);
    }
    syncStyles(doc);
    setMount(doc.body);
  }, [syncStyles]);

  useEffect(() => {
    // srcdoc frames often finish loading before React attaches onLoad.
    const doc = iframeRef.current?.contentDocument;
    if (doc && doc.readyState === "complete" && doc.body) handleLoad();
  }, [handleLoad]);

  useEffect(() => {
    if (!mount || !onDocument) return;
    onDocument(mount.ownerDocument);
    return () => onDocument(null);
  }, [mount, onDocument]);

  useEffect(() => {
    if (!mount) return;
    const observer = new MutationObserver(() => {
      const doc = iframeRef.current?.contentDocument;
      if (doc) syncStyles(doc);
    });
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [mount, syncStyles]);

  return (
    <>
      <iframe
        ref={iframeRef}
        title="Site preview"
        onLoad={handleLoad}
        srcDoc="<!doctype html><html><head></head><body></body></html>"
        className={className}
        style={{ width, maxWidth: "100%" }}
      />
      {mount && createPortal(children, mount)}
    </>
  );
}
