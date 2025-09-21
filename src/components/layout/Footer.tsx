'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Youtube, Mail, MapPin, Heart } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { siteConfig } from '@/config/site';

const footerLinks = {
  travel: [
    { name: 'Destinations', href: '/travel/destinations' },
    { name: 'Travel Tips', href: '/travel/tips' },
    { name: 'Itineraries', href: '/travel/itineraries' },
    { name: 'Gear Reviews', href: '/travel/gear' },
  ],
  worldschooling: [
    { name: 'Getting Started', href: '/worldschooling/getting-started' },
    { name: 'Curriculum', href: '/worldschooling/curriculum' },
    { name: 'Resources', href: '/worldschooling/resources' },
    { name: 'Community', href: '/worldschooling/community' },
  ],
  about: [
    { name: 'Our Story', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

const socialLinks = [
  {
    name: 'Instagram',
    href: siteConfig.social.instagram,
    icon: Instagram,
  },
  {
    name: 'Twitter',
    href: siteConfig.social.twitter,
    icon: Twitter,
  },
  {
    name: 'YouTube',
    href: siteConfig.social.youtube,
    icon: Youtube,
  },
  {
    name: 'Email',
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
  },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [currentLocation, setCurrentLocation] = useState(siteConfig.footer.currentLocation);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current location from database
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('/api/settings/public');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings.current_location) {
            setCurrentLocation(data.settings.current_location);
          }
        }
      } catch (error) {
        console.error('Failed to fetch current location:', error);
      }
    };
    
    fetchLocation();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Implement newsletter signup
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    setEmail('');
    setIsSubmitting(false);
    // TODO: Show success message
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <Container>
        <div className="py-12 lg:py-16">
          {/* Newsletter Section */}
          <div className="mb-12 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-4">
                Join Our Adventure
              </h2>
              <p className="text-gray-600 mb-6">
                Get weekly updates on our travels, worldschooling tips, and photography 
                delivered straight to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" isLoading={isSubmitting} className="sm:w-auto">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{siteConfig.logo.initial}</span>
                </div>
                <span className="text-lg font-playfair font-bold text-gray-900">
                  {siteConfig.name}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {siteConfig.footer.tagline}
              </p>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <MapPin className="h-4 w-4 mr-2" />
                Currently in: {currentLocation}
              </div>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-teal-500 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{social.name}</span>
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Travel</h3>
              <ul className="space-y-2">
                {footerLinks.travel.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-teal-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Worldschooling</h3>
              <ul className="space-y-2">
                {footerLinks.worldschooling.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-teal-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">About</h3>
              <ul className="space-y-2">
                {footerLinks.about.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-teal-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center text-sm text-gray-500">
              <span>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</span>
            </div>
            <div className="flex items-center mt-4 sm:mt-0 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="h-4 w-4 mx-1 text-red-500 fill-current" />
              <span>{siteConfig.footer.madeBy}</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}