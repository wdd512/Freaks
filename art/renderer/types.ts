import type { CareerLevel, FreakDNA, Mood } from "@/domain/types";

export type ArtSlot =
  | "background"
  | "environment"
  | "workstation"
  | "screens"
  | "body"
  | "outfit"
  | "neck"
  | "head"
  | "hair"
  | "eyes"
  | "mouth"
  | "prop"
  | "effects"
  | "frame";

export type ArtLayerAsset = {
  id: string;
  slot: ArtSlot;
  sourceType: "SVG_COMPONENT" | "IMAGE";
  assetPath?: string;
};

export type DynamicArtState = {
  outfit: string;
  workstation: string;
  screens: string;
  prop: string;
  environment: string;
};

export type FreakPalette = {
  background: string;
  backgroundLight: string;
  outline: string;
  skin: string;
  skinShadow: string;
  hair: string;
  hairLight: string;
  clothing: string;
  clothingDark: string;
  desk: string;
  metal: string;
  screen: string;
  green: string;
  red: string;
  purple: string;
  gold: string;
  white: string;
};

export type CompatibilityPresentation = {
  deskY: number;
  headOffsetY: number;
  headwearMode: "NONE" | "HAIR" | "HOOD" | "CAP" | "HEADPHONES" | "VISOR" | "HAT";
  mouthPose: "DNA" | "SMILE_ACCENT" | "FOCUSED_ACCENT" | "MELTDOWN_ACCENT";
  screenMode: "PHONE" | "DESKTOP" | "WALL";
  wallFrame: boolean;
};

export type FreakRenderSpec = {
  version: string;
  tokenId: number;
  immutable: FreakDNA;
  dynamic: DynamicArtState;
  state: {
    careerLevel: CareerLevel;
    mood: Mood;
    active: boolean;
  };
  effects: string[];
  palette: FreakPalette;
  assets: ArtLayerAsset[];
  presentation: CompatibilityPresentation;
};

export type ArtLayerProps = { spec: FreakRenderSpec };
