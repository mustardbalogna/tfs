import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  DEFAULT_SITE_CONTENT,
  fetchSiteContent,
  getCachedSiteContent,
  type PageKey,
  type SiteContent,
} from "@/lib/siteContent";

/**
 * Editing capabilities exposed to the site components when they're rendered
 * inside the admin visual editor. Public pages never receive this, so every
 * editing affordance is a no-op there.
 */
export interface EditorApi {
  update: (path: string, value: unknown) => void;
  /** Move an element within any array in the content (used by drag & drop and arrows). */
  reorder: (listPath: string, from: number, to: number) => void;
  /** Selected block id */
  selectedBlock: string | null;
  selectBlock: (id: string | null, options?: { openPanel?: boolean }) => void;
  toggleBlock: (page: PageKey, id: string) => void;
  removeBlock: (page: PageKey, id: string) => void;
  duplicateBlock: (page: PageKey, id: string) => void;
  /** Open the block library to insert a new section at `index` on `page`. */
  openLibrary: (page: PageKey, index: number) => void;
  /** Open the media picker; the chosen image is written to `path` as an ImageRef. */
  pickImage: (path: string) => void;
  /** Path of the item currently showing an icon picker (e.g. "pages.home.1.props.items.2") */
  iconPickerPath: string | null;
  setIconPickerPath: (path: string | null) => void;
}

interface ContentContextValue {
  content: SiteContent;
  editor: EditorApi | null;
}

const ContentContext = createContext<ContentContextValue>({
  content: DEFAULT_SITE_CONTENT,
  editor: null,
});

export function useSiteContent(): SiteContent {
  return useContext(ContentContext).content;
}

/** Returns the editor API when rendered inside the admin editor, otherwise null. */
export function useEditor(): EditorApi | null {
  return useContext(ContentContext).editor;
}

export function useIsEditing(): boolean {
  return useContext(ContentContext).editor !== null;
}

/** Public-site provider: loads content once and shares it with header, pages and footer. */
export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(
    () => getCachedSiteContent() ?? DEFAULT_SITE_CONTENT,
  );

  useEffect(() => {
    let cancelled = false;
    fetchSiteContent().then((c) => {
      if (!cancelled) setContent(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ContentContext.Provider value={{ content, editor: null }}>{children}</ContentContext.Provider>
  );
}

/** Admin editor provider: renders the site against a draft with editing enabled. */
export function EditableContentProvider({
  content,
  editor,
  children,
}: {
  content: SiteContent;
  editor: EditorApi;
  children: ReactNode;
}) {
  return <ContentContext.Provider value={{ content, editor }}>{children}</ContentContext.Provider>;
}
