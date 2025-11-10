import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

// Popular streaming providers
const STREAMING_PROVIDERS = [
  { id: 8, name: "Netflix", logo: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" },
  { id: 337, name: "Disney+", logo: "https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg" },
  { id: 15, name: "Hulu", logo: "https://image.tmdb.org/t/p/original/zxrVdFjIjLqkfnwyghnfywTn3Lh.jpg" },
  { id: 9, name: "Amazon Prime", logo: "https://image.tmdb.org/t/p/original/emthp39XA2YScoYL1p0sdbAH2WA.jpg" },
  { id: 350, name: "Apple TV+", logo: "https://image.tmdb.org/t/p/original/6uhKBfmtzFqOcLousHwZuzcrScK.jpg" },
  { id: 387, name: "Peacock", logo: "https://image.tmdb.org/t/p/original/xTVM8uXT9QocigQ51iPQABlT3q.jpg" },
  { id: 384, name: "HBO Max", logo: "https://image.tmdb.org/t/p/original/Ajqyt5aNxNGjmF9uOfxArGrdf3X.jpg" },
  { id: 531, name: "Paramount+", logo: "https://image.tmdb.org/t/p/original/xbhHHa1YgtpwhC8lb1NQ3ACVcLd.jpg" },
];

interface StreamingProviderFilterProps {
  selectedProviders: number[];
  onToggleProvider: (providerId: number) => void;
}

export default function StreamingProviderFilter({
  selectedProviders,
  onToggleProvider,
}: StreamingProviderFilterProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Streaming Services</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STREAMING_PROVIDERS.map((provider) => {
          const isSelected = selectedProviders.includes(provider.id);
          return (
            <button
              key={provider.id}
              onClick={() => onToggleProvider(provider.id)}
              className={`relative aspect-[16/9] rounded-lg overflow-hidden border-2 transition-all ${
                isSelected
                  ? "border-primary scale-95"
                  : "border-transparent hover:border-white/20 hover:scale-105"
              }`}
            >
              <img
                src={provider.logo}
                alt={provider.name}
                className="w-full h-full object-contain bg-white/5 p-2"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="bg-primary rounded-full p-1">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selectedProviders.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          Showing content available on {selectedProviders.length} service
          {selectedProviders.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
