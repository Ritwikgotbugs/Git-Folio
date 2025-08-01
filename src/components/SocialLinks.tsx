import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ExternalLink,
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  MessageCircle,
  Twitch,
  Twitter,
  X,
  Youtube
} from "lucide-react";

interface SocialLinksProps {
  user: {
    blog?: string;
    twitter_username?: string;
    company?: string;
    location?: string;
  };
}

export const SocialLinks = ({ user }: SocialLinksProps) => {
  // Extract and normalize social links
  const socialLinks: Array<{ url: string; platform: string; icon: any }> = [];

  // Helper function to get platform and icon
  const getPlatformInfo = (url: string) => {
    const normalizedUrl = url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    if (normalizedUrl.includes('linkedin.com') || normalizedUrl.includes('in')) {
      return { platform: 'LinkedIn', icon: Linkedin };
    }
    if (normalizedUrl.includes('instagram.com') || normalizedUrl.includes('instagr.am')) {
      return { platform: 'Instagram', icon: Instagram };
    }
    if (normalizedUrl.includes('twitter.com') || normalizedUrl.includes('x.com') || normalizedUrl.includes('t.co')) {
      return { platform: 'X (Twitter)', icon: Twitter };
    }
    if (normalizedUrl.includes('github.com')) {
      return { platform: 'GitHub', icon: Github };
    }
    if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
      return { platform: 'YouTube', icon: Youtube };
    }
    if (normalizedUrl.includes('facebook.com') || normalizedUrl.includes('fb.com')) {
      return { platform: 'Facebook', icon: Facebook };
    }
    if (normalizedUrl.includes('twitch.tv')) {
      return { platform: 'Twitch', icon: Twitch };
    }
    if (normalizedUrl.includes('discord.gg') || normalizedUrl.includes('discord.com')) {
      return { platform: 'Discord', icon: MessageCircle };
    }
    
    return { platform: 'Website', icon: Globe };
  };

  // Add blog/website if available
  if (user.blog) {
    const platformInfo = getPlatformInfo(user.blog);
    socialLinks.push({
      url: user.blog.startsWith('http') ? user.blog : `https://${user.blog}`,
      platform: platformInfo.platform,
      icon: platformInfo.icon
    });
  }

  // Add Twitter if available
  if (user.twitter_username) {
    socialLinks.push({
      url: `https://twitter.com/${user.twitter_username}`,
      platform: 'X (Twitter)',
      icon: Twitter
    });
  }

  // If no social links found, don't render the component
  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <Card className="card-minimal">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="w-4 h-4" />
          Social Links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 justify-start">
          {socialLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <IconComponent className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {link.platform}
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}; 