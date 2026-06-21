import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import CallDetection from "./pages/CallDetection";
import SmsDetection from "./pages/SmsDetection";
import EmailDetection from "./pages/EmailDetection";
import Profile from "./pages/Profile";
import { Button } from "./components/ui/button";
import { Phone, MessageSquare, Mail, Home as HomeIcon, Settings } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path="/calls" component={CallDetection} />
      <Route path="/sms" component={SmsDetection} />
      <Route path="/emails" component={EmailDetection} />
      <Route path="/profile" component={Profile} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function BottomNav() {
  const [location, setLocation] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-slate-900 border-t border-slate-700 flex items-center justify-around">
      <Button
        onClick={() => setLocation("/")}
        className={`flex-1 flex flex-col items-center gap-1 h-16 rounded-none ${
          location === "/"
            ? "bg-slate-800 text-lime-400"
            : "bg-transparent text-gray-400 hover:bg-slate-800"
        }`}
      >
        <HomeIcon className="w-5 h-5" />
        <span className="text-xs">Home</span>
      </Button>
      <Button
        onClick={() => setLocation("/calls")}
        className={`flex-1 flex flex-col items-center gap-1 h-16 rounded-none ${
          location === "/calls"
            ? "bg-slate-800 text-lime-400"
            : "bg-transparent text-gray-400 hover:bg-slate-800"
        }`}
      >
        <Phone className="w-5 h-5" />
        <span className="text-xs">Calls</span>
      </Button>
      <Button
        onClick={() => setLocation("/sms")}
        className={`flex-1 flex flex-col items-center gap-1 h-16 rounded-none ${
          location === "/sms"
            ? "bg-slate-800 text-lime-400"
            : "bg-transparent text-gray-400 hover:bg-slate-800"
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-xs">SMS</span>
      </Button>
      <Button
        onClick={() => setLocation("/emails")}
        className={`flex-1 flex flex-col items-center gap-1 h-16 rounded-none ${
          location === "/emails"
            ? "bg-slate-800 text-lime-400"
            : "bg-transparent text-gray-400 hover:bg-slate-800"
        }`}
      >
        <Mail className="w-5 h-5" />
        <span className="text-xs">Emails</span>
      </Button>
      <Button
        onClick={() => setLocation("/profile")}
        className={`flex-1 flex flex-col items-center gap-1 h-16 rounded-none ${
          location === "/profile"
            ? "bg-slate-800 text-lime-400"
            : "bg-transparent text-gray-400 hover:bg-slate-800"
        }`}
      >
        <Settings className="w-5 h-5" />
        <span className="text-xs">Profile</span>
      </Button>
    </div>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <div className="bg-slate-950 text-white min-h-screen max-w-[430px] mx-auto relative">
            <Router />
            <BottomNav />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
