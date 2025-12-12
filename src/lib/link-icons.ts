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
  FaFacebook,
} from "react-icons/fa6";
import { FaTiktok, FaMediumM, FaBitbucket, FaJava } from "react-icons/fa";
import { FaFirefoxBrowser, FaGitlab } from "react-icons/fa6";
import {
  IoNewspaperSharp,
  IoLogoJavascript,
  IoHardwareChip,
} from "react-icons/io5";
import { SiNewyorktimes, SiGitea, SiTypescript } from "react-icons/si";
import { DiGo, DiApple, DiLinux } from "react-icons/di";
import { CiInstagram } from "react-icons/ci";
import { GoLinkExternal } from "react-icons/go";

type IconEntry = {
  hostIncludes: string[];
  icon: IconType;
  label: string;
};

export const EXTERNAL_ICON = GoLinkExternal;

const ICONS: IconEntry[] = [
  { hostIncludes: ["github.com"], icon: FaGithub, label: "GitHub" },
  { hostIncludes: ["gitlab.com"], icon: FaGitlab, label: "GitLab" },
  { hostIncludes: ["bitbucket.org"], icon: FaBitbucket, label: "Bitbucket" },
  { hostIncludes: ["gitea.com", "gitea"], icon: SiGitea, label: "Gitea" },

  {
    hostIncludes: ["youtube.com", "youtu.be"],
    icon: FaYoutube,
    label: "YouTube",
  },
  { hostIncludes: ["tiktok.com"], icon: FaTiktok, label: "TikTok" },

  { hostIncludes: ["figma.com"], icon: FaFigma, label: "Figma" },

  { hostIncludes: ["x.com", "twitter.com"], icon: FaXTwitter, label: "X" },
  { hostIncludes: ["instagram.com"], icon: CiInstagram, label: "Instagram" },
  { hostIncludes: ["facebook.com"], icon: FaFacebook, label: "Facebook" },

  {
    hostIncludes: ["discord.gg", "discord.com"],
    icon: FaDiscord,
    label: "Discord",
  },
  { hostIncludes: ["slack.com"], icon: FaSlack, label: "Slack" },

  {
    hostIncludes: ["drive.google.com"],
    icon: FaGoogleDrive,
    label: "Google Drive",
  },
  { hostIncludes: ["dropbox.com"], icon: FaDropbox, label: "Dropbox" },

  { hostIncludes: ["trello.com"], icon: FaTrello, label: "Trello" },
  { hostIncludes: ["atlassian.net", "jira.com"], icon: FaJira, label: "Jira" },

  { hostIncludes: ["medium.com"], icon: FaMediumM, label: "Medium" },
  {
    hostIncludes: ["nytimes.com", "newyorktimes.com"],
    icon: SiNewyorktimes,
    label: "New York Times",
  },
  {
    hostIncludes: ["lemonde.fr", "guardian.co.uk", "washingtonpost.com"],
    icon: IoNewspaperSharp,
    label: "Article de presse",
  },

  {
    hostIncludes: ["mozilla.org", "firefox.com"],
    icon: FaFirefoxBrowser,
    label: "Firefox",
  },

  { hostIncludes: ["golang.org", "go.dev"], icon: DiGo, label: "Go" },
  {
    hostIncludes: ["javascript.info", "nodejs.org"],
    icon: IoLogoJavascript,
    label: "JavaScript",
  },
  {
    hostIncludes: ["typescriptlang.org"],
    icon: SiTypescript,
    label: "TypeScript",
  },
  {
    hostIncludes: ["oracle.com/java", "openjdk.org"],
    icon: FaJava,
    label: "Java",
  },

  { hostIncludes: ["apple.com"], icon: DiApple, label: "Apple" },
  {
    hostIncludes: ["kernel.org", "linux.org", "ubuntu.com", "debian.org"],
    icon: DiLinux,
    label: "Linux",
  },
  {
    hostIncludes: ["nvidia.com", "intel.com", "arm.com"],
    icon: IoHardwareChip,
    label: "Hardware",
  },
];

const DEFAULT_ICON = FaLink;
const DEFAULT_LABEL = "Lien";

function findEntry(url: string): IconEntry | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const entry = ICONS.find((e) =>
      e.hostIncludes.some((part) => host.includes(part)),
    );
    return entry ?? null;
  } catch {
    return null;
  }
}

export function getIconForUrl(url: string): IconType {
  const entry = findEntry(url);
  return entry ? entry.icon : DEFAULT_ICON;
}

export function getLinkMeta(url: string): { icon: IconType; label: string } {
  const entry = findEntry(url);
  if (!entry) {
    return { icon: DEFAULT_ICON, label: DEFAULT_LABEL };
  }
  return { icon: entry.icon, label: entry.label };
}
