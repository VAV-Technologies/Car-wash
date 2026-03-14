
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import Link from "next/link";

interface AuthCardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
}

export const AuthCardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial
}: AuthCardWrapperProps) => {
  return (
    <Card className="w-full max-w-lg shadow-none mx-auto bg-white border-brand-dark-blue/10 rounded-none px-6 py-8 [&_input]:rounded-none [&_input]:border-brand-dark-blue/15 [&_input:focus-visible]:ring-brand-sky-blue [&_button[type=submit]]:bg-brand-dark-blue [&_button[type=submit]]:text-white [&_button[type=submit]]:hover:bg-brand-dark-blue/90 [&_button[type=submit]]:rounded-none">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Logo size="2xl" forceTheme="light" />
        </div>
        <p className="text-muted-foreground text-sm">{headerLabel}</p>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {showSocial && (
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">Or continue with social...</p>
        </CardFooter>
      )}
      <CardFooter className="flex-col items-center justify-center">
        <Link
          href={backButtonHref}
          className="text-sm text-muted-foreground hover:text-brand-dark-blue transition-colors"
        >
          {backButtonLabel}
        </Link>
      </CardFooter>
    </Card>
  );
};
