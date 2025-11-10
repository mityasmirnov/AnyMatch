import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Swipe from "./pages/Swipe";
import Groups from "./pages/Groups";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";
import Saved from "./pages/Saved";
import Browse from "./pages/Browse";
import Watchlist from "./pages/Watchlist";
import GuestMatches from "./pages/GuestMatches";
import SessionJoin from "./pages/SessionJoin";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <>
      <Navigation />
      <Switch>
       <Route path="/" component={Home} />
      <Route path="/swipe" component={Swipe} />
      <Route path="/browse" component={Browse} />
      <Route path="/groups" component={Groups} />
      <Route path="/matches/:id" component={Matches} />
      <Route path="/watchlist" component={Watchlist} />
      <Route path="/profile" component={Profile} />
      <Route path="/guest-matches" component={GuestMatches} />
      <Route path="/session/:code" component={SessionJoin} />
      <Route path="/saved" component={Saved} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
