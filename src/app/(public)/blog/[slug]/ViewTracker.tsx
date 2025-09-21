'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  slug: string;
}

export default function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    // Track view after component mounts (user has actually viewed the page)
    const trackView = async () => {
      try {
        // Wait a bit to ensure the user actually viewed the content
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if user is still on the page
        if (document.visibilityState === 'visible') {
          await fetch(`/api/posts/${slug}/views`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
      } catch (error) {
        // Silently fail - view tracking is not critical
        console.warn('Failed to track view:', error);
      }
    };

    trackView();
  }, [slug]);

  // This component doesn't render anything visible
  return null;
}