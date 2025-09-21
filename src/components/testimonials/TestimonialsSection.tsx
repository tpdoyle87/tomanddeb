import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

// Placeholder testimonials data
const testimonials = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Fellow Worldschooling Parent',
    location: 'Singapore → Thailand',
    content: 'The photography collection is absolutely stunning! The practical worldschooling tips have been invaluable for our family\'s journey around the world.',
    rating: 5,
    avatar: null,
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    role: 'Digital Nomad',
    location: 'Mexico → Portugal',
    content: 'Real, honest travel stories that don\'t sugarcoat the challenges. This blog has become my go-to resource for family travel planning and remote work strategies.',
    rating: 5,
    avatar: null,
  },
  {
    id: '3',
    name: 'Emma Thompson',
    role: 'Homeschooling Mother',
    location: 'Canada → Costa Rica',
    content: 'The curriculum ideas and educational resources have transformed how we approach learning while traveling. Our kids are thriving with this flexible approach.',
    rating: 5,
    avatar: null,
  },
];

interface TestimonialsSectionProps {
  variant?: 'default' | 'compact';
  showTitle?: boolean;
}

export function TestimonialsSection({ 
  variant = 'default', 
  showTitle = true 
}: TestimonialsSectionProps) {
  const isCompact = variant === 'compact';

  return (
    <section className={isCompact ? 'py-12' : 'py-16 lg:py-24'}>
      {showTitle && (
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4">
            What Fellow Travelers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of families who trust our insights for their worldschooling 
            and nomadic lifestyle journey.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-teal-100">
                <Quote className="h-8 w-8" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial Content */}
              <blockquote className="text-gray-700 mb-6 relative z-10">
                "{testimonial.content}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-3">
                {/* Avatar Placeholder */}
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600 font-semibold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>

                <div>
                  <div className="font-medium text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role}
                  </div>
                  <div className="text-xs text-teal-600 font-medium">
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          Ready to start your own adventure?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#newsletter"
            className="inline-flex items-center justify-center px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors"
          >
            Join Our Newsletter
          </a>
          <a
            href="/about"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Learn More About Us
          </a>
        </div>
      </div>
    </section>
  );
}