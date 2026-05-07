import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

export default function BillingCancelPage() {
  return (
    <div className="container mx-auto py-8 px-4 mt-20">
      <div className="max-w-2xl mx-auto">
        <div className="text-center border border-border rounded-lg p-8 bg-card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <XCircle className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-orange-600 mb-2">Payment Canceled</h1>
          <p className="text-muted-foreground text-lg mb-6">No worries! Your payment was canceled and no charges were made.</p>
          <div className="rounded-lg bg-muted/50 p-4 mb-6">
            <h3 className="font-semibold mb-2">Still Interested?</h3>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li>• You can try again anytime</li>
              <li>• Our free plan is still available</li>
              <li>• Contact support if you have questions</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/billing" className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Link>
            <Link href="/" className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
