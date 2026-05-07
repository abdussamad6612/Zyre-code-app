export function useUser() { return { user: null, isLoaded: true, isSignedIn: false }; }
export function useSignIn() { return { signIn: null, isLoaded: true }; }
export function useSignUp() { return { signUp: null, isLoaded: true }; }
export function UserButton({ ...props }: any) { return null; }
export function SignInButton({ children, ...props }: any) { return children; }
export function ClerkProvider({ children }: { children: any }) { return children; }
