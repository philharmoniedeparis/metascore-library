import Animation from "../assets/icons/Animation.svg";
import NonSynchedBlock from "../assets/icons/Block.non-synched.svg";
import SynchedBlock from "../assets/icons/Block.synched.svg";
import BlockToggler from "../assets/icons/BlockToggler.svg";
import Content from "../assets/icons/Content.svg";
import Controller from "../assets/icons/Controller.svg";
import Cursor from "../assets/icons/Cursor.svg";
import Image from "../assets/icons/Image.svg";
import MediaAudio from "../assets/icons/Media.audio.svg";
import MediaVideo from "../assets/icons/Media.video.svg";
import Page from "../assets/icons/Page.svg";
import SVG from "../assets/icons/SVG.svg";
import VideoRenderer from "../assets/icons/VideoRenderer.svg";

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
