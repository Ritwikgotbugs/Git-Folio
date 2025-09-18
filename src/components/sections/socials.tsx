import {
  ExternalLink,
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Twitch,
  Twitter,
  Youtube
} from "lucide-react";

interface SocialLinksProps {
  user: {
    blog?: string;
    twitter_username?: string;
    html_url?: string; // GitHub profile URL
    email?: string;    // Email address
    company?: string;
    location?: string;
  };
}

export const SocialLinks = ({ user }: SocialLinksProps) => {
  const socialLinks: Array<{ url?: string; platform: string; icon: any; color: string; text?: string }> = [];

  // Normalize URL (prepend https:// if missing)
  const formatUrl = (url: string) => {
    return url.startsWith("http") ? url : `https://${url}`;
  };

  // Detect platform + assign icon + brand color
  const getPlatformInfo = (url: string) => {
    const normalizedUrl = url.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "");

    if (normalizedUrl.includes("linkedin.com")) {
      return { platform: "LinkedIn", icon: Linkedin, color: "#0A66C2" };
    }
    if (normalizedUrl.includes("instagram.com") || normalizedUrl.includes("instagr.am")) {
      return { platform: "Instagram", icon: Instagram, color: "#E4405F" };
    }
    if (normalizedUrl.includes("x.com") || normalizedUrl.includes("twitter.com") || normalizedUrl.includes("t.co")) {
      return { platform: "X (Twitter)", icon: Twitter, color: "#1DA1F2" };
    }
    if (normalizedUrl.includes("github.com")) {
      return { platform: "GitHub", icon: Github, color: "#333" };
    }
    if (normalizedUrl.includes("youtube.com") || normalizedUrl.includes("youtu.be")) {
      return { platform: "YouTube", icon: Youtube, color: "#FF0000" };
    }
    if (normalizedUrl.includes("facebook.com") || normalizedUrl.includes("fb.com")) {
      return { platform: "Facebook", icon: Facebook, color: "#1877F2" };
    }
    if (normalizedUrl.includes("twitch.tv")) {
      return { platform: "Twitch", icon: Twitch, color: "#9146FF" };
    }
    if (normalizedUrl.includes("discord.gg") || normalizedUrl.includes("discord.com")) {
      return { platform: "Discord", icon: MessageCircle, color: "#5865F2" };
    }

    // Default: plain website
    return { platform: "Website", icon: Globe, color: "#999" };
  };

  // Add blog/website if available
  if (user?.blog) {
    const fullUrl = formatUrl(user.blog);
    const platformInfo = getPlatformInfo(fullUrl);
    socialLinks.push({
      url: fullUrl,
      platform: platformInfo.platform,
      icon: platformInfo.icon,
      color: platformInfo.color
    });
  }

  // Add Twitter if available
  if (user?.twitter_username) {
    socialLinks.push({
      url: `https://x.com/${user.twitter_username}`,
      platform: "X (Twitter)",
      icon: Twitter,
      color: "#1DA1F2"
    });
  }

  // Add GitHub profile if available
  if (user?.html_url) {
    socialLinks.push({
      url: user.html_url,
      platform: "GitHub",
      icon: Github,
      color: "#999"
    });
  }

  // Add Email (just display text, no redirect)
  if (user?.email) {
    socialLinks.push({
      platform: "Email",
      icon: Mail,
      color: "#999",
      text: user.email
    });
  }

  if (socialLinks.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {socialLinks.map((link, index) => {
        const IconComponent = link.icon;

        // If email, just show plain text
        if (link.platform === "Email" && link.text) {
          return (
            <div key={index} className="flex items-center gap-2">
              <IconComponent className="w-5 h-5" style={{ color: link.color }} />
              <span className="text-sm font-medium text-foreground">{link.text}</span>
            </div>
          );
        }

        // Otherwise render as a clickable link
        return (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group"
          >
            <IconComponent
              className="w-5 h-5 transition-colors"
              style={{ color: link.color }}
            />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {link.platform}
            </span>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </a>
        );
      })}
    </div>
  );
};
