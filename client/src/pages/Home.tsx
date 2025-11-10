import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, Users, Sparkles, Film } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to swipe page
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/swipe");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-gradient">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen animated-gradient overflow-hidden">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center float bg-white/5 backdrop-blur-xl border border-white/10">
              <Film className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            <span className="text-gradient">Any</span>
            <span className="text-gradient-secondary">Match</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            Swipe. Match. Watch Together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="gradient-primary text-lg px-8 py-6 rounded-2xl glow-hover w-full sm:w-auto"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 w-full sm:w-auto bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </Button>
          </div>

          {/* Feature Cards */}
          <div id="features" className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center space-y-4 hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto pulse-glow">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Swipe to Match</h3>
              <p className="text-white/70">
                Swipe through movies and TV shows. Like what you love, skip what you don't.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center space-y-4 hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto pulse-glow">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Group Matching</h3>
              <p className="text-white/70">
                Create groups with friends or partners. Find movies everyone wants to watch.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center space-y-4 hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto pulse-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">AI Recommendations</h3>
              <p className="text-white/70">
                Get personalized suggestions based on your taste and swipe patterns.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-20">
            <h2 className="text-4xl font-bold text-white mb-12" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              How It Works
            </h2>
            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-left flex items-start gap-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                  1
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">Create or Join a Group</h4>
                  <p className="text-white/70">
                    Start a new group or join your friends using a simple 6-character code.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-left flex items-start gap-6">
                <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                  2
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">Swipe on Movies</h4>
                  <p className="text-white/70">
                    Swipe right to like, left to pass, up for super like, down to save for later.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-left flex items-start gap-6">
                <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                  3
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">Get Matches</h4>
                  <p className="text-white/70">
                    When everyone in your group likes the same movie, it's a match! Time to watch.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center py-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to find your next movie night?
            </h2>
            <p className="text-white/70 mb-8">
              Join thousands of users matching movies together
            </p>
            <Button
              size="lg"
              className="gradient-primary text-lg px-8 py-6 rounded-2xl glow-hover"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Start Matching Now
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-white/50 text-sm">
        <p>© 2024 AnyMatch. Powered by TMDB.</p>
      </footer>
    </div>
  );
}
