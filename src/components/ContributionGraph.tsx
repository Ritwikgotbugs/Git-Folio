
interface ContributionData {
  month: string;
  contributions: number;
}

interface ContributionGraphProps {
  username: string;
}

export const ContributionGraph = ({ username }: ContributionGraphProps) => {
  const apiUrl = `https://github-readme-stats.vercel.app/api?username=${username}`;

  return (
    <div className="h-80 flex items-center justify-center">
      <img
        src={apiUrl}
        alt={`GitHub contribution graph for ${username}`}
        className="w-full h-full object-contain"
        onError={(e) => {
          // Fallback if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const container = target.parentElement;
          if (container) {
            container.innerHTML = `
              <div class="flex items-center justify-center h-full text-muted-foreground">
                <div class="text-center">
                  <p>Contribution data unavailable</p>
                </div>
              </div>
            `;
          }
        }}
      />
    </div>
  );
};