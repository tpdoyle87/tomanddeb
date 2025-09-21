import { Metadata } from 'next';
import { ContactForm } from '@/components/blog';
import { Container, Card, CardContent } from '@/components/ui';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `Contact Us | ${siteConfig.name} - Get in Touch`,
  description: 'Have questions about our travel adventures, worldschooling journey, or photography? We\'d love to hear from you! Contact us for collaboration opportunities, travel advice, or just to say hello.',
  keywords: [
    'contact travel blog',
    'travel questions',
    'worldschooling advice',
    'travel collaboration',
    'nomadic family contact',
    'travel blog inquiry',
    'photography tips',
    'family travel tips',
  ],
  openGraph: {
    title: `Contact Us | ${siteConfig.name} - Get in Touch`,
    description: 'Have questions about our travel adventures, worldschooling journey, or photography? We\'d love to hear from you!',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `Contact Us | ${siteConfig.name} - Get in Touch`,
    description: 'Have questions about our travel adventures, worldschooling journey, or photography? We\'d love to hear from you!',
  },
};

export default function ContactPage() {
  const contactReasons = [
    {
      icon: '🤝',
      title: 'Collaboration Opportunities',
      description: 'Interested in partnering with us? We love working with brands, destinations, and organizations that align with our values.',
    },
    {
      icon: '❓',
      title: 'Travel Questions',
      description: 'Need advice on destinations, family-friendly activities, or travel logistics? We\'re happy to share our experiences.',
    },
    {
      icon: '🎓',
      title: 'Worldschooling Guidance',
      description: 'Curious about education on the road? Ask us about curriculum planning, online resources, and managing school while traveling.',
    },
    {
      icon: '💰',
      title: 'Photography & Visual Stories',
      description: 'Interested in our travel photography? We can share tips about capturing stunning travel moments and visual storytelling.',
    },
    {
      icon: '🗣️',
      title: 'Speaking Engagements',
      description: 'Invite us to speak at your event about family travel, worldschooling, or capturing the world through photography.',
    },
    {
      icon: '👋',
      title: 'Just Say Hello!',
      description: 'Fellow travelers or aspiring nomads? We love connecting with like-minded families and individuals on similar journeys.',
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/5 py-16 md:py-24">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold text-secondary mb-6">
              Let's Connect
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              We love hearing from fellow adventurers, aspiring worldschoolers, and anyone curious about 
              our journey. Whether you have questions, collaboration ideas, or just want to say hello, 
              we're here to help!
            </p>
          </div>
        </Container>
      </section>

      {/* Contact Reasons */}
      <section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-secondary mb-4">
              Why People Contact Us
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Here are some common reasons people reach out. Whatever your reason, 
              we're excited to hear from you!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {contactReasons.map((reason, index) => (
              <Card key={index} className="text-center p-6 h-full hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{reason.icon}</div>
                <h3 className="font-playfair text-xl font-semibold text-secondary mb-3">
                  {reason.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {reason.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-muted/50">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Contact Information */}
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-secondary mb-6">
                Get In Touch
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Fill out the form and we'll get back to you within 24-48 hours. We read every 
                message personally and love connecting with our community.
              </p>

              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-1">Email Response Time</h3>
                    <p className="text-muted-foreground text-sm">
                      We typically respond within 24-48 hours, depending on our current location and timezone.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-1">Currently Exploring</h3>
                    <p className="text-muted-foreground text-sm">
                      We're currently based in Southeast Asia, but our location changes frequently! 
                      Follow our journey on social media for real-time updates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-1">Media & Press</h3>
                    <p className="text-muted-foreground text-sm">
                      For media inquiries, interviews, or press opportunities, please mention this 
                      in your message subject line for priority handling.
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-secondary mb-4">Follow Our Journey</h3>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    aria-label="Follow us on Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  
                  <a
                    href="#"
                    className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    aria-label="Follow us on Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  
                  <a
                    href="#"
                    className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    aria-label="Follow us on Twitter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="p-8">
              <CardContent className="p-0">
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-secondary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Here are some quick answers to the questions we get most often.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="font-playfair text-lg font-semibold text-secondary mb-3">
                How do you fund your travels?
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We fund our travels through remote work, photography sales, and content creation. 
                Check out our Photography gallery to see our work!
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-playfair text-lg font-semibold text-secondary mb-3">
                What about your children's education?
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We practice worldschooling - using the world as our classroom while maintaining 
                formal curriculum requirements. Our Worldschooling section covers this in depth.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-playfair text-lg font-semibold text-secondary mb-3">
                Do you offer consulting services?
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We occasionally offer consulting on travel photography and 
                worldschooling setup. Reach out to discuss your specific needs.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-playfair text-lg font-semibold text-secondary mb-3">
                Can we meet up if you're in our area?
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We love meeting fellow travelers and nomad families! Send us a message with your 
                location and we'll let you know if we'll be nearby.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": `Contact Us - ${siteConfig.name}`,
            "description": "Get in touch with us about travel, worldschooling, photography, or collaboration opportunities.",
            "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/contact`,
            "mainEntity": {
              "@type": "Organization",
              "name": siteConfig.name,
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "General Inquiries",
                "availableLanguage": "English",
                "areaServed": "Worldwide"
              }
            }
          })
        }}
      />
    </main>
  );
}