'use client';

import { useState } from 'react';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface NewsletterFormProps {
  variant?: 'default' | 'compact' | 'inline';
  title?: string;
  description?: string;
  source?: string;
}

interface SubscriptionResponse {
  success: boolean;
  message: string;
  subscriber?: {
    email: string;
    name: string | null;
    status: string;
  };
  error?: string;
  details?: Array<{
    path: string[];
    message: string;
  }>;
}

export function NewsletterForm({ 
  variant = 'default',
  title = "Never Miss an Adventure",
  description = "Get our latest travel stories, worldschooling tips, and stunning photography delivered to your inbox.",
  source = 'homepage'
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const isCompact = variant === 'compact';
  const isInline = variant === 'inline';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          source,
        }),
      });

      const data: SubscriptionResponse = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
        setName('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isCompact && !isInline && (
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            disabled={isLoading}
          />
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            disabled={isLoading}
            required
          />
        </div>
      )}

      {(isCompact || isInline) && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            disabled={isLoading}
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            className={isInline ? "whitespace-nowrap" : "sm:w-auto"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
              </>
            )}
          </Button>
        </div>
      )}

      {!isCompact && !isInline && (
        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Subscribing...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-5 w-5" />
              Subscribe to Newsletter
            </>
          )}
        </Button>
      )}

      {/* Status Messages */}
      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          status === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {status === 'success' ? (
            <Check className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          <span>{message}</span>
        </div>
      )}

      {/* Privacy Note */}
      {!isInline && (
        <p className="text-xs text-gray-500 mt-3">
          We respect your privacy. Unsubscribe at any time.
        </p>
      )}
    </form>
  );

  if (isInline) {
    return renderForm();
  }

  if (isCompact) {
    return (
      <Card className="bg-teal-50 border-teal-200">
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Mail className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          </div>
          {renderForm()}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-0 shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-teal-600" />
        </div>
        <CardTitle className="text-2xl text-gray-900 font-playfair mb-2">
          {title}
        </CardTitle>
        <CardDescription className="text-gray-600 text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderForm()}
      </CardContent>
    </Card>
  );
}