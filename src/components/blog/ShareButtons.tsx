'use client';

import { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Mail, Link2, Check, MessageCircle, Send, Hash, Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'dropdown';
  showLabels?: boolean;
}

interface SharePlatform {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  shareUrl: (url: string, title: string, description?: string) => string;
  color: string;
  hoverColor: string;
}

const sharePlatforms: SharePlatform[] = [
  {
    name: 'Twitter',
    icon: Twitter,
    shareUrl: (url, title) => 
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    color: 'bg-black',
    hoverColor: 'hover:bg-gray-800',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    shareUrl: (url) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    shareUrl: (url, title, description) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`,
    color: 'bg-blue-700',
    hoverColor: 'hover:bg-blue-800',
  },
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    shareUrl: (url, title) => 
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    color: 'bg-green-600',
    hoverColor: 'hover:bg-green-700',
  },
  {
    name: 'Telegram',
    icon: Send,
    shareUrl: (url, title) => 
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
  },
  {
    name: 'Reddit',
    icon: Hash,
    shareUrl: (url, title) => 
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    color: 'bg-orange-600',
    hoverColor: 'hover:bg-orange-700',
  },
  {
    name: 'Pinterest',
    icon: Camera,
    shareUrl: (url, title, description) => 
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
    color: 'bg-red-600',
    hoverColor: 'hover:bg-red-700',
  },
  {
    name: 'Email',
    icon: Mail,
    shareUrl: (url, title, description) => 
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || ''}\n\n${url}`)}`,
    color: 'bg-gray-600',
    hoverColor: 'hover:bg-gray-700',
  },
];

export function ShareButtons({
  url,
  title,
  description,
  className = '',
  variant = 'horizontal',
  showLabels = false,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleShare = (platform: SharePlatform) => {
    const shareUrl = platform.shareUrl(url, title, description);
    
    if (platform.name === 'Email') {
      window.location.href = shareUrl;
    } else {
      window.open(
        shareUrl,
        '_blank',
        'width=600,height=400,scrollbars=no,resizable=no'
      );
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (error) {
        console.error('Native share failed:', error);
      }
    }
  };

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          {showLabels && 'Share'}
        </Button>

        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsDropdownOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <div className="p-2">
                {sharePlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => {
                      handleShare(platform);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <platform.icon className="h-4 w-4" />
                    Share on {platform.name}
                  </button>
                ))}
                
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <button
                    onClick={() => {
                      handleCopyLink();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        Link Copied!
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4" />
                        Copy Link
                      </>
                    )}
                  </button>

                  {/* Native Web Share API */}
                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <button
                      onClick={() => {
                        handleNativeShare();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                      More Options
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  const containerClass = variant === 'vertical' 
    ? 'flex flex-col gap-2' 
    : 'flex flex-wrap gap-2';

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Social Platform Buttons */}
      {sharePlatforms.map((platform) => (
        <Button
          key={platform.name}
          onClick={() => handleShare(platform)}
          size="sm"
          className={`${platform.color} text-white ${platform.hoverColor} border-0 ${
            showLabels ? 'flex items-center gap-2' : 'p-2'
          }`}
        >
          <platform.icon className="h-4 w-4" />
          {showLabels && platform.name}
        </Button>
      ))}

      {/* Copy Link Button */}
      <Button
        onClick={handleCopyLink}
        variant="outline"
        size="sm"
        className={`${
          copied 
            ? 'bg-green-50 border-green-300 text-green-700' 
            : 'hover:bg-gray-50'
        } ${showLabels ? 'flex items-center gap-2' : 'p-2'}`}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            {showLabels && 'Copied!'}
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" />
            {showLabels && 'Copy Link'}
          </>
        )}
      </Button>

      {/* Native Web Share API Button */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Button
          onClick={handleNativeShare}
          variant="outline"
          size="sm"
          className={showLabels ? 'flex items-center gap-2' : 'p-2'}
        >
          <Share2 className="h-4 w-4" />
          {showLabels && 'Share'}
        </Button>
      )}
    </div>
  );
}