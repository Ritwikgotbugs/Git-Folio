import { Button } from "@/components/ui/button";
import { Github, Link2, Mail } from "lucide-react";

interface ContactSectionProps {
  user: {
    login: string;
    blog?: string | null;
    html_url?: string | null;
    email?: string | null;
  };
}

export const ContactSection = ({ user }: ContactSectionProps) => {
  return (
    <section
      id="contact"
      className="max-w-4xl py-5 space-y-6 text-center mx-auto"
    >
      <div className="space-y-4">
        <h2 className="text-xl md:text-xl font-bold gradient-text">
          Get in touch
        </h2>
        <p className="text-muted-foreground max-w-prose mx-auto">
          Interested in collaboration, opportunities, or just saying hi? Reach
          out through any of the channels below.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {user.blog && (
          <Button asChild variant="outline" className="gap-2">
            <a href={user.blog} target="_blank" rel="noopener noreferrer">
              <Link2 className="w-4 h-4" /> Website
            </a>
          </Button>
        )}
        {user.html_url && (
          <Button asChild variant="outline" className="gap-2">
            <a href={user.html_url} target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4" /> GitHub
            </a>
          </Button>
        )}
        {user.email && (
          <Button asChild variant="ghost" className="gap-2">
            <a href={`mailto:${user.email}`}>
              <Mail className="w-4 h-4" />
              <span className="font-medium">{user.email}</span>
            </a>
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Portfolio powered by GitFolio! <a className="font-medium text-white" href="https://github.com/Ritwikgotbugs/Git-folio">Contribute</a>
      </p>
    </section>
  );
};
