import { type ReactNode } from 'react';
import { ClerkProvider, SignIn, SignUp } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { CineShell } from '@/components/cine-shell';
import HomePage from '@/pages/home';
import SearchPage from '@/pages/search';
import WatchlistPage from '@/pages/watchlist';
import LiveTvPage from '@/pages/live-tv';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in the environment.');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: 'top' as const,
    socialButtonsVariant: 'blockButton' as const,
  },
  variables: {
    colorPrimary: 'hsl(28 92% 64%)',
    colorForeground: 'hsl(37 31% 94%)',
    colorMutedForeground: 'hsl(223 10% 72%)',
    colorDanger: 'hsl(3 77% 64%)',
    colorBackground: 'hsl(224 22% 11%)',
    colorInput: 'hsl(224 15% 17%)',
    colorInputForeground: 'hsl(37 31% 94%)',
    colorNeutral: 'hsl(224 15% 30%)',
    fontFamily: 'Manrope, sans-serif',
    borderRadius: '0.8rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#0e121e] rounded-2xl w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'font-display text-2xl text-[#f7f4ed]',
    headerSubtitle: 'text-[#a7abb8]',
    socialButtonsBlockButtonText: 'text-[#f7f4ed] font-semibold',
    formFieldLabel: 'text-[#f7f4ed]',
    footerActionLink: 'text-[#ffaa55] font-semibold',
    footerActionText: 'text-[#a7abb8]',
    dividerText: 'text-[#a7abb8]',
    identityPreviewEditButton: 'text-[#ffaa55]',
    formFieldSuccessText: 'text-emerald-300',
    alertText: 'text-[#ff9f9f]',
    logoBox: 'h-12',
    logoImage: 'h-12 w-12',
    socialButtonsBlockButton: 'border-white/10 bg-white/[.05] hover:bg-white/[.1]',
    formButtonPrimary: 'bg-[#ffaa55] text-[#080b13] hover:bg-[#ffbb76]',
    formFieldInput: 'border-white/10 bg-white/[.05] text-[#f7f4ed]',
    footerAction: 'border-white/10',
    dividerLine: 'bg-white/10',
    alert: 'border-red-300/20 bg-red-300/10',
    otpCodeFieldInput: 'border-white/10 bg-white/[.05] text-[#f7f4ed]',
    formFieldRow: 'gap-2',
    main: 'gap-5',
  },
};

function ProductRoutes() {
  return (
    <CineShell>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/search" component={SearchPage} />
        <Route path="/live-tv" component={LiveTvPage} />
        <Route path="/watchlist" component={WatchlistPage} />
        <Route component={NotFound} />
      </Switch>
    </CineShell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProvider
        publishableKey={clerkPubKey}
        proxyUrl={clerkProxyUrl}
        appearance={clerkAppearance}
        signInUrl={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        localization={{
          signIn: {
            start: {
              title: 'Welcome back to CineVerse',
              subtitle: 'Sign in to keep your watchlist close.',
            },
          },
          signUp: {
            start: {
              title: 'Create your CineVerse account',
              subtitle: 'Save stories and pick up where you left off.',
            },
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <RoutedErrorBoundary>
              <Switch>
                <Route path="/sign-in/*?" component={SignInPage} />
                <Route path="/sign-up/*?" component={SignUpPage} />
                <Route component={ProductRoutes} />
              </Switch>
            </RoutedErrorBoundary>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </WouterRouter>
  );
}

function SignInPage() {
  return (
    <div className="cinema-grid flex min-h-[100dvh] items-center justify-center bg-background px-4 py-10">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="cinema-grid flex min-h-[100dvh] items-center justify-center bg-background px-4 py-10">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

export default App;
