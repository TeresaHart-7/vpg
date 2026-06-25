import {
  GlobeHemisphereWest,
  Bridge,
  CalendarBlank,
  Flower,
  CalendarCheck,
  Baby,
  MusicNotes,
  Package,
  ShoppingCart,
  Car,
  UsersThree,
  Camera,
  PaintBrush,
  Code,
  Heart,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

const icons: Record<string, Icon> = {
  GlobeHemisphereWest,
  Bridge,
  CalendarBlank,
  Flower,
  CalendarCheck,
  Baby,
  MusicNotes,
  Package,
  ShoppingCart,
  Car,
  UsersThree,
  Camera,
  PaintBrush,
  Code,
  Heart,
};

export function CoCreationIcon({
  name,
  size = 20,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const IconComponent = icons[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} weight="duotone" />;
}
