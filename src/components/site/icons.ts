import {
  Armchair,
  Bed,
  Box,
  Coffee,
  DoorOpen,
  FlaskConical,
  Frame,
  Gem,
  Hammer,
  HeartHandshake,
  Home,
  Lamp,
  Layers,
  type LucideIcon,
  MapPin,
  Paintbrush,
  Puzzle,
  Ruler,
  Shield,
  Sofa,
  Sparkles,
  Star,
  Table,
  TreePine,
  Tv,
  Wrench,
} from "lucide-react";

/** Icons the admin can pick from for cards. Keys are what gets stored in content. */
export const ICONS = {
  armchair: Armchair,
  bed: Bed,
  box: Box,
  coffee: Coffee,
  doorOpen: DoorOpen,
  flask: FlaskConical,
  frame: Frame,
  gem: Gem,
  hammer: Hammer,
  heartHandshake: HeartHandshake,
  home: Home,
  lamp: Lamp,
  layers: Layers,
  mapPin: MapPin,
  paintbrush: Paintbrush,
  puzzle: Puzzle,
  ruler: Ruler,
  shield: Shield,
  sofa: Sofa,
  sparkles: Sparkles,
  star: Star,
  table: Table,
  treePine: TreePine,
  tv: Tv,
  wrench: Wrench,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export function getIcon(name: string): LucideIcon {
  return (ICONS as Record<string, LucideIcon>)[name] ?? Gem;
}
