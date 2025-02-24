import Animation from "../assets/icons/Animation.svg?url";
import NonSynchedBlock from "../assets/icons/Block.non-synched.svg?url";
import SynchedBlock from "../assets/icons/Block.synched.svg?url";
import BlockToggler from "../assets/icons/BlockToggler.svg?url";
import Content from "../assets/icons/Content.svg?url";
import Controller from "../assets/icons/Controller.svg?url";
import Cursor from "../assets/icons/Cursor.svg?url";
import Image from "../assets/icons/Image.svg?url";
import MediaAudio from "../assets/icons/Media.audio.svg?url";
import MediaVideo from "../assets/icons/Media.video.svg?url";
import Page from "../assets/icons/Page.svg?url";
import SVG from "../assets/icons/SVG.svg?url";
import VideoRenderer from "../assets/icons/VideoRenderer.svg?url";

const ICONS = {
  Animation,
  NonSynchedBlock,
  SynchedBlock,
  BlockToggler,
  Content,
  Controller,
  Cursor,
  Image,
  MediaAudio,
  MediaVideo,
  Page,
  SVG,
  VideoRenderer,
};

function getName(component) {
  switch (component.type) {
    case "Scenario":
      return;

    case "Block":
      return component.synched ? "SynchedBlock" : "NonSynchedBlock";

    case "Media":
      return component.tag === "video" ? "MediaVideo" : "MediaAudio";

    default:
      return component.type;
  }
}

function getURL(component) {
  const name = getName(component);
  if (!name) return;

  return ICONS[name];
}

export { getURL };
