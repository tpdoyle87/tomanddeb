'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface AboutSectionProps {
  className?: string;
}

export function AboutSection({ className = '' }: AboutSectionProps) {
  return (
    <div className={`space-y-16 ${className}`}>
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="font-playfair text-4xl md:text-6xl font-bold text-secondary mb-6">
          About Our Journey
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Welcome to our world of endless adventures, continuous learning, and creative expression. 
          We're a family who traded the traditional path for a life of exploration, education, and photography.
        </p>
      </section>

      {/* Travel Philosophy */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-secondary mb-6">
            Our Travel Philosophy
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Travel isn't just about destinations—it's about transformation. Every journey teaches us 
              something new about the world and ourselves. We believe in slow travel, deep cultural 
              immersion, and creating meaningful connections with people and places.
            </p>
            <p>
              Our adventures take us beyond tourist trails to discover hidden gems, local traditions, 
              and authentic experiences. We document these moments not just to remember them, but to 
              inspire others to see the world through curious, open eyes.
            </p>
            <p>
              From bustling markets in Southeast Asia to quiet mountain villages in South America, 
              every destination becomes a classroom where we learn about history, culture, cuisine, 
              and what it means to be human in this diverse world.
            </p>
          </div>
        </div>
        
        <div className="order-1 lg:order-2">
          <Card className="overflow-hidden">
            <div className="aspect-square relative">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-6xl">🌍</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Worldschooling Approach */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <Card className="overflow-hidden">
            <div className="aspect-square relative">
              <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <div className="text-6xl">🎓</div>
              </div>
            </div>
          </Card>
        </div>
        
        <div>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-secondary mb-6">
            Worldschooling Adventures
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Education doesn't have to happen within four walls. Worldschooling combines travel 
              with learning, turning the entire world into our children's classroom. Ancient ruins 
              become history lessons, foreign languages become practical skills, and diverse cultures 
              become social studies in action.
            </p>
            <p>
              We share our experiences with curriculum planning, educational resources, and practical 
              tips for families considering this unconventional educational path. From managing time 
              zones during online classes to finding educational opportunities in every destination.
            </p>
            <p>
              Our worldschooling journey proves that learning can be exciting, relevant, and deeply 
              meaningful when it connects directly to real-world experiences and global perspectives.
            </p>
          </div>
        </div>
      </section>

      {/* Photography Journey */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-secondary mb-6">
            Capturing the World Through Our Lens
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Photography isn't just about capturing moments—it's about telling stories. Through our lens, 
              we document the incredible beauty of our planet, from majestic landscapes to intimate 
              cultural moments that reveal the soul of each destination.
            </p>
            <p>
              Our photography collection spans continents, featuring stunning vistas, vibrant street scenes, 
              and the genuine smiles of people we've met along the way. Each image is available in 
              high resolution, perfect for those who want to bring a piece of the world into their homes.
            </p>
            <p>
              We share our photography techniques, from composition tips to post-processing workflows, 
              helping fellow travelers capture their own adventures in compelling ways.
            </p>
          </div>
        </div>
        
        <div className="order-1 lg:order-2">
          <Card className="overflow-hidden">
            <div className="aspect-square relative">
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center">
                <div className="text-6xl">📸</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Author Bio */}
      <section className="bg-muted rounded-xl p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-secondary mb-8 text-center">
            Meet the Family
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1">
              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <div className="text-4xl">👨‍👩‍👧‍👦</div>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="md:col-span-2 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We're the Johnson family—Mark, Sarah, and our two kids, Emma (12) and Jake (9). 
                Three years ago, we made the bold decision to sell our house, quit our corporate jobs, 
                and embark on a full-time travel adventure with our children.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Mark brings 15 years of photography experience, while Sarah has a background 
                in education and curriculum development. Together, we've created a unique blend of 
                adventure, learning, and visual storytelling that defines our nomadic lifestyle.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our mission is to inspire other families to think outside the box, whether that means 
                taking a sabbatical year, transitioning to remote work, or simply being more intentional 
                about how travel can enrich your family's life and financial future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-white">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-secondary mb-4">
            Our Core Values
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These principles guide every decision we make, from choosing destinations to capturing perfect moments.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: '🌱',
              title: 'Sustainable Growth',
              description: 'Building wealth and experiences that last, while respecting the environment and local communities.',
            },
            {
              icon: '📚',
              title: 'Lifelong Learning',
              description: 'Every experience is an opportunity to learn, grow, and expand our understanding of the world.',
            },
            {
              icon: '💝',
              title: 'Family First',
              description: 'Prioritizing family time and creating lasting memories while building our financial future.',
            },
            {
              icon: '🤝',
              title: 'Authentic Connections',
              description: 'Building genuine relationships with people from all walks of life and cultures.',
            },
            {
              icon: '🎯',
              title: 'Intentional Living',
              description: 'Making deliberate choices about how we spend our time, money, and energy.',
            },
            {
              icon: '💡',
              title: 'Knowledge Sharing',
              description: 'Openly sharing our successes, failures, and lessons learned to help others on similar journeys.',
            },
          ].map((value, index) => (
            <Card key={index} className="text-center p-6 h-full">
              <CardHeader className="pb-4">
                <div className="text-4xl mb-4">{value.icon}</div>
                <CardTitle className="text-xl">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}