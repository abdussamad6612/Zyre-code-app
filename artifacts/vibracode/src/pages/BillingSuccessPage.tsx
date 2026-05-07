import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export default function BillingSuccessPage() {
  return (
    <div className="container mx-auto py-8 px-4 mt-20">
      <div className="max-w-2xl mx-auto">
        <div className="text-center border border-border rounded-lg p-8 bg-card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground text-lg mb-6">Thank you for subscribing! Your payment has been processed successfully.</p>
          <div className="rounded-lg bg-muted/50 p-4 mb-6">
            <h3 className="font-semibold mb-2">What's Next?</h3>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li>• Your subscription is now active</li>
              <li>• Credits have been added to your account</li>
              <li>• You can start using all premium features</li>
              <li>• Check your email for payment confirmation</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/" className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              <ArrowRight className="mr-2 h-4 w-4" />
              Start Building
            </Link>
            <Link href="/billing" className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
              Manage Subscription
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
