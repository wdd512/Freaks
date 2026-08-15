import type { CareerLevel, Mood } from "@/domain/types";
import type { ImmutableArtIdentity } from "@/art/manifest/immutable";
import type { DynamicArtState } from "@/art/manifest/dynamic";

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

export type ArtAssetPlacement = { x: number; y: number; width: number; height: number };

export type SvgComponentArtLayerAsset = {
  id: string;
  slot: ArtSlot;
  sourceType: "SVG_COMPONENT";
  assetPath?: never;
  placement?: never;
};

export type ImageArtLayerAsset = {
  id: string;
  slot: ArtSlot;
  sourceType: "IMAGE";
  assetPath: string;
  placement: ArtAssetPlacement;
};

export type ArtLayerAsset = SvgComponentArtLayerAsset | ImageArtLayerAsset;
export type { DynamicArtState } from "@/art/manifest/dynamic";

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
  immutable: ImmutableArtIdentity;
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
