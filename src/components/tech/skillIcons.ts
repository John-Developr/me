import type { ComponentType, SVGProps } from "react";

import Category from "@/components/icons/Category";
import Setting from "@/components/icons/Setting";
import Call from "@/components/icons/Call";
import Document from "@/components/icons/Document";
import Synchronize from "@/components/icons/Synchronize";
import Chat from "@/components/icons/Chat";
import EditSquare from "@/components/icons/EditSquare";
import Link from "@/components/icons/Link";
import SquarePassword from "@/components/icons/SquarePassword";
import Work from "@/components/icons/Work";
import Star from "@/components/icons/Star";

import { SkillIconKey } from "@/utils/types";

/**
 * Icons a skill category can use (stored as a key in
 * `skill_categories.icon`). Same icon set as the public site.
 */
export const SKILL_ICONS: Record<SkillIconKey, { label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }> = {
  category:  { label: "Grid",      Icon: Category },
  settings:  { label: "Gear",      Icon: Setting },
  phone:     { label: "Phone",     Icon: Call },
  document:  { label: "Document",  Icon: Document },
  sync:      { label: "Sync",      Icon: Synchronize },
  chat:      { label: "Chat",      Icon: Chat },
  edit:      { label: "Edit",      Icon: EditSquare },
  link:      { label: "Link",      Icon: Link },
  lock:      { label: "Lock",      Icon: SquarePassword },
  briefcase: { label: "Briefcase", Icon: Work },
  star:      { label: "Star",      Icon: Star },
};
