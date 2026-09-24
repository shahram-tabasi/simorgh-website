'use client';

import React from "react";
import { BrainCircuitIcon, DraftingCompassIcon, NetworkIcon, BoxesIcon, ReceiptTextIcon, UsersIcon, PenToolIcon, CloudIcon, BuildingIcon, ZapIcon, CpuIcon, LayoutPanelLeftIcon, FactoryIcon, FuelIcon, PickaxeIcon, RouteIcon, BoxIcon, LucideIcon } from "lucide-react";
const registry: Record<string, LucideIcon> = {
  ai: BrainCircuitIcon,
  drafting: DraftingCompassIcon,
  grid: NetworkIcon,
  twin: BoxesIcon,
  ledger: ReceiptTextIcon,
  users: UsersIcon,
  pen: PenToolIcon,
  cloud: CloudIcon,
  city: BuildingIcon,
  bolt: ZapIcon,
  circuit: CpuIcon,
  panel: LayoutPanelLeftIcon,
  factory: FactoryIcon,
  rig: FuelIcon,
  mining: PickaxeIcon,
  bridge: RouteIcon
};
export const iconNames = Object.keys(registry);
interface IconProps {
  name: string;
  className?: string;
  strokeWidth?: number;
}
export function Icon({
  name,
  className = 'h-5 w-5',
  strokeWidth = 1.4
}: IconProps) {
  const Cmp = registry[name] ?? BrainCircuitIcon;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}