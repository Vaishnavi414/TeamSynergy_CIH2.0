import { ClerkProvider as BaseClerkProvider, ClerkLoaded, ClerkLoading } from '@clerk/clerk-react';
import { ReactNode } from 'react';
import { dark } from '@clerk/themes';

interface ClerkProviderProps {
  children: ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  // Get the publishable key from environment variables
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  // Log for debugging purposes
  console.log('Initializing Clerk with publishable key:', publishableKey?.substring(0, 10) + '...');

  if (!publishableKey) {
    throw new Error('Missing Clerk publishable key. Set VITE_CLERK_PUBLISHABLE_KEY in your .env file.');
  }
  
  return (
    <BaseClerkProvider
      publishableKey={publishableKey}
      appearance={{
        baseTheme: dark,
        elements: {
          card: 'bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl rounded-lg',
          formButtonPrimary: 'bg-gradient-to-r from-aries-purple to-aries-blue hover:opacity-90 transition-opacity',
          formFieldInput: 'bg-gray-900/50 border-gray-800 text-white',
          footerActionLink: 'text-aries-purple hover:text-aries-blue',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-300',
          socialButtonsIconButton: 'bg-gray-800/50 hover:bg-gray-700/50 transition-colors border border-white/10',
          formFieldLabel: 'text-gray-300',
          identityPreview: 'bg-gray-900/50 border-gray-800',
          avatarBox: 'bg-gradient-to-r from-aries-purple to-aries-blue',
        }
      }}
      // Configure Clerk options
      signInUrl="/login"
      signUpUrl="/signup"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <ClerkLoading>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
          <div className="animate-spin h-8 w-8 border-2 border-aries-purple border-t-aries-blue rounded-full"></div>
        </div>
      </ClerkLoading>
      <ClerkLoaded>{children}</ClerkLoaded>
    </BaseClerkProvider>
  );
}
