import { default as AbstractComponent } from "./AbstractComponent";
import { default as EmbeddableComponent } from "./EmbeddableComponent";

import { default as Animation } from "./Animation";
import { default as Block } from "./Block";
import { default as BlockToggler } from "./BlockToggler";
import { default as Content } from "./Content";
import { default as Controller } from "./Controller";
import { default as Cursor } from "./Cursor";
import { default as Image } from "./Image";
import { default as Media } from "./Media";
import { default as Page } from "./Page";
import { default as Scenario } from "./Scenario";
import { default as SVG } from "./SVG";
import { default as VideoRenderer } from "./VideoRenderer";

export {
  AbstractComponent,
  EmbeddableComponent,
  Animation,
  Block,
  BlockToggler,
  Content,
  Controller,
  Cursor,
  Image,
  Media,
  Page,
  Scenario,
  SVG,
  VideoRenderer,
}

type Components = {
  Animation: Animation
  Block: Block
  BlockToggler: BlockToggler
  Content: Content
  Controller: Controller
  Cursor: Cursor
  Image: Image
  Media: Media
  Page: Page
  Scenario: Scenario
  SVG: SVG
  VideoRenderer: VideoRenderer
}

export type ComponentType = keyof Components

export type Component<Type extends ComponentType|void = void> =
  Type extends ComponentType ? Components[Type] : Components[ComponentType]