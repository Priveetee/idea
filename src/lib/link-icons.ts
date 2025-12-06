import type { IconType } from "react-icons";
import {
  FaGithub,
  FaYoutube,
  FaFigma,
  FaXTwitter,
  FaDiscord,
  FaSlack,
  FaGoogleDrive,
  FaDropbox,
  FaTrello,
  FaJira,
  FaLink,
} from "react-icons/fa6";

type IconEntry = {
  hostIncludes: string[];
  icon: IconType;
};

const ICONS: IconEntry[] = [
  {
    hostIncludes: ["github.com"],
    icon: FaGithub,
  },
  {
    hostIncludes: ["youtube.com", "youtu.be"],
    icon: FaYoutube,
  },
  {
    hostIncludes: ["figma.com"],
    icon: FaFigma,
  },
  {
    hostIncludes: ["x.com", "twitter.com"],
    icon: FaXTwitter,
  },
  {
    hostIncludes: ["discord.gg", "discord.com"],
    icon: FaDiscord,
  },
  {
    hostIncludes: ["slack.com"],
    icon: FaSlack,
  },
  {
    hostIncludes: ["drive.google.com"],
    icon: FaGoogleDrive,
  },
  {
    hostIncludes: ["dropbox.com"],
    icon: FaDropbox,
  },
  {
    hostIncludes: ["trello.com"],
    icon: FaTrello,
  },
  {
    hostIncludes: ["atlassian.net", "jira.com"],
    icon: FaJira,
  },
];

export function getIconForUrl(url: string): IconType {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const entry = ICONS.find((e) =>
      e.hostIncludes.some((part) => host.includes(part)),
    );
    return entry ? entry.icon : FaLink;
  } catch {
    return FaLink;
  }
}
