import {
  BarChart3,
  HelpCircle,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  LayoutTemplate,
  Mail,
  Megaphone,
  MessageSquareQuote,
  PanelTop,
  Tags,
  Type,
  type LucideIcon,
} from "lucide-react";
import { BLOCK_LIBRARY, BLOCK_TYPES, type BlockType } from "@/lib/siteContent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const GLYPHS: Record<BlockType, LucideIcon> = {
  hero: PanelTop,
  intro: Type,
  cards: LayoutGrid,
  textImage: LayoutTemplate,
  tags: Tags,
  gallery: Images,
  stats: BarChart3,
  testimonials: MessageSquareQuote,
  faq: HelpCircle,
  cta: Megaphone,
  categoriesGrid: ImageIcon,
  contact: Mail,
};

export default function BlockLibrary({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (type: BlockType) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Add a section</DialogTitle>
          <DialogDescription>
            Pick a ready-made layout. You can edit every word, photo and setting afterwards.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          {BLOCK_TYPES.map((type) => {
            const meta = BLOCK_LIBRARY[type];
            const Glyph = GLYPHS[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => onPick(type)}
                className="flex items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Glyph className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{meta.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {meta.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { GLYPHS as BLOCK_GLYPHS };
