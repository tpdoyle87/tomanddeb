import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Tyiou*18!@#', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'tpdoyle87@gmail.com' },
    update: {},
    create: {
      email: 'tpdoyle87@gmail.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log('Admin user created:', adminUser.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'travel' },
      update: {},
      create: {
        slug: 'travel',
        name: 'Travel',
        description: 'Adventures from around the world',
        order: 1,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'worldschooling' },
      update: {},
      create: {
        slug: 'worldschooling',
        name: 'Worldschooling',
        description: 'Education on the road',
        order: 2,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'investment' },
      update: {},
      create: {
        slug: 'investment',
        name: 'Investment',
        description: 'Financial freedom and investment strategies',
        order: 3,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'lifestyle' },
      update: {},
      create: {
        slug: 'lifestyle',
        name: 'Lifestyle',
        description: 'Living a nomadic lifestyle',
        order: 4,
        isActive: true,
      },
    }),
  ]);
  console.log('Categories created:', categories.length);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'europe' },
      update: {},
      create: {
        slug: 'europe',
        name: 'Europe',
        description: 'European destinations',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'asia' },
      update: {},
      create: {
        slug: 'asia',
        name: 'Asia',
        description: 'Asian destinations',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'budget-travel' },
      update: {},
      create: {
        slug: 'budget-travel',
        name: 'Budget Travel',
        description: 'Traveling on a budget',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'family-travel' },
      update: {},
      create: {
        slug: 'family-travel',
        name: 'Family Travel',
        description: 'Traveling with kids',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'remote-work' },
      update: {},
      create: {
        slug: 'remote-work',
        name: 'Remote Work',
        description: 'Working while traveling',
      },
    }),
  ]);
  console.log('Tags created:', tags.length);

  // Create sample blog posts
  const posts = [
    {
      slug: 'bali-digital-nomad-paradise',
      title: 'Bali: A Digital Nomad Paradise for Families',
      excerpt: 'Discover why Bali has become our favorite destination for combining work, education, and adventure.',
      content: `
# Bali: A Digital Nomad Paradise for Families

After spending three months in Bali with our two kids, we can confidently say it's one of the best destinations for digital nomad families. Here's why Bali captured our hearts and became our home base.

## Why Bali Works for Families

### 1. Incredible Infrastructure
Bali has evolved to cater perfectly to digital nomads. Fast internet is widely available, with many cafes offering 50+ Mbps speeds. Co-working spaces like Outpost and Hubud provide professional environments when you need to focus.

### 2. Education Options
The island offers numerous schooling options:
- **Green School**: An innovative bamboo campus focusing on sustainability
- **Canggu Community School**: Perfect for short-term stays
- **Local tutors**: Affordable and flexible for worldschooling

### 3. Cost of Living
Our monthly budget in Bali:
- Villa rental (2BR with pool): $1,200
- Food and dining: $600
- Transportation (scooter rental): $100
- Activities and education: $400
- **Total: ~$2,300/month**

## Our Favorite Areas

### Canggu
Perfect for families who want a beach lifestyle with modern amenities. Great cafes, surf schools for kids, and a strong expat community.

### Ubud
The cultural heart of Bali. Ideal for families interested in arts, yoga, and jungle adventures. The kids loved the Monkey Forest!

### Sanur
Quieter and more traditional. Excellent for families with younger children due to calm beaches and less traffic.

## Practical Tips

1. **Visa**: Get the B211A visa for stays longer than 30 days
2. **Health**: International clinics like BIMC provide excellent healthcare
3. **Transportation**: Grab and Gojek make getting around easy and affordable
4. **Weather**: April-October offers the best weather with less rain

## Activities for Kids

Our children's favorite experiences:
- Surfing lessons at Batu Bolong Beach
- Rice terrace trekking in Tegallalang
- Waterfall hunting (Sekumpul is stunning!)
- Traditional dancing classes
- Cooking classes at Paon Bali

## The Investment Angle

Living in Bali allowed us to reduce our living costs by 60% compared to the US, enabling us to invest an extra $3,000 monthly. The compound effect of this geographic arbitrage is powerful for building long-term wealth.

## Challenges to Consider

- **Rainy season** (November-March) can limit activities
- **Traffic** in popular areas can be intense
- **Healthcare** for serious conditions may require Singapore trips
- **Education continuity** requires careful planning

## Final Thoughts

Bali offers an unbeatable combination of affordability, culture, nature, and infrastructure. It's where our kids learned to surf, discovered a love for different cuisines, and made friends from around the world. 

For families considering the digital nomad lifestyle, Bali is an excellent starting point. The island teaches you that adventure and stability aren't mutually exclusive – they can beautifully coexist.

**Have you been to Bali with kids? Share your experiences in the comments below!**
      `,
      featuredImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200',
      categoryId: categories[0].id,
      authorId: adminUser.id,
      status: 'PUBLISHED' as const,
      visibility: 'PUBLIC' as const,
      publishedAt: new Date('2024-03-15'),
      views: 1250,
      readTime: 8,
      location: 'Bali, Indonesia',
      country: 'Indonesia',
      metaTitle: 'Bali Digital Nomad Guide for Families - Wandering Minds',
      metaDescription: 'Complete guide to living in Bali as a digital nomad family. Costs, schools, areas, and practical tips from 3 months experience.',
    },
    {
      slug: 'worldschooling-curriculum-guide',
      title: 'Our Worldschooling Curriculum: A Complete Guide',
      excerpt: 'How we structure our children\'s education while traveling the world, including resources, schedules, and real-world learning.',
      content: `
# Our Worldschooling Curriculum: A Complete Guide

Worldschooling isn't just about traveling – it's about transforming the world into your classroom. Here's our comprehensive guide to educating kids on the road.

## Our Educational Philosophy

We believe in:
- **Experience-based learning**: History comes alive in Rome, marine biology in the Maldives
- **Flexibility**: Adapting to each child's pace and interests
- **Real-world application**: Math through budgeting, writing through travel journaling
- **Cultural immersion**: Language learning through local interactions

## Core Curriculum Structure

### Mathematics (1.5 hours/day)
- **Khan Academy**: Free, comprehensive, works offline
- **IXL Math**: Adaptive learning with detailed progress tracking
- **Real-world math**: Currency conversion, budgeting, time zones

### Language Arts (2 hours/day)
- **Reading**: Local library visits, Kindle Unlimited subscription
- **Writing**: Daily journaling, blog posts, letters to family
- **Grammar**: NoRedInk for interactive grammar practice

### Science (1 hour/day)
- **Location-based studies**: Geology in Iceland, astronomy in the Atacama Desert
- **Online resources**: CK-12, Mystery Science
- **Hands-on experiments**: Using local materials and environments

### Social Studies (1 hour/day)
- **Living history**: Visiting historical sites, museums
- **Current events**: BBC Newsround, local newspapers
- **Geography**: Maps, navigation, cultural studies

### Languages (1 hour/day)
- **Duolingo**: Gamified language learning
- **Local tutors**: Affordable in most countries
- **Immersion**: Ordering food, asking directions, making friends

## Weekly Schedule Example

**Monday-Thursday: Structured Learning**
- 8:00-9:30: Math & Language Arts
- 9:30-10:00: Break/Snack
- 10:00-11:30: Science & Social Studies
- 11:30-1:00: Lunch & Free Time
- 1:00-2:00: Language Learning
- 2:00-5:00: Exploration/Activities

**Friday: Field Trip Day**
Museums, historical sites, nature reserves, cultural experiences

**Weekends: Free exploration and family time**

## Resources We Can't Live Without

### Digital Tools
1. **Google Workspace for Education**: Free for homeschoolers
2. **Outschool**: Live online classes on any topic
3. **BrainPOP**: Animated educational videos
4. **Prodigy Math**: Game-based math learning
5. **Epic!**: Digital library for kids

### Physical Materials (Minimal)
- Basic art supplies
- Scientific calculator
- World map/Atlas
- Notebooks and writing materials
- Tablet/laptop per child

## Country-Specific Learning

### In Peru:
- Inca history at Machu Picchu
- Spanish immersion in Cusco
- Altitude science in the Andes
- Agricultural studies in the Sacred Valley

### In Japan:
- Calligraphy and origami workshops
- Technology museum visits
- Respect and cultural etiquette
- Earthquake preparedness and geology

### In Egypt:
- Ancient history comes alive
- Hieroglyphics workshops
- Desert ecosystem studies
- Arabic number system origins

## Assessment and Progress

### Portfolio Method
- Collection of work samples
- Photo documentation of projects
- Video presentations
- Regular self-assessments

### Standardized Testing
- Annual CAT (California Achievement Test) online
- Maintains transcript for college applications

## Socialization Strategies

- **Local sports clubs**: Soccer in Brazil, martial arts in Thailand
- **Homeschool co-ops**: Found in most major cities
- **Kids' clubs**: At co-working spaces and accommodations
- **Online clubs**: Minecraft education servers, book clubs
- **Travel buddy families**: Connecting with other worldschooling families

## Challenges and Solutions

**Challenge**: Inconsistent internet
**Solution**: Download materials offline, use workbooks as backup

**Challenge**: Different time zones for online classes
**Solution**: Recorded lessons, asynchronous learning

**Challenge**: Lack of science lab equipment
**Solution**: Kitchen science, nature as laboratory

**Challenge**: Meeting grade-level standards
**Solution**: Regular assessments, supplementary online courses

## Financial Investment

**Monthly Education Budget**: $200-300
- Online subscriptions: $100
- Local classes/tutors: $100
- Materials and supplies: $50
- Museum/activity passes: $50

Compared to private school ($15,000/year), we save $12,000+ annually while providing richer experiences.

## Results After 2 Years

Our children:
- Speak 3 languages conversationally
- Test above grade level in all subjects
- Have friends on 5 continents
- Show increased independence and adaptability
- Demonstrate deep cultural awareness and empathy

## Tips for Starting

1. **Start slow**: Try a month-long trip first
2. **Connect with communities**: Join worldschooling Facebook groups
3. **Be flexible**: Every family's approach will differ
4. **Document everything**: For records and memories
5. **Trust the process**: Learning happens everywhere

## Conclusion

Worldschooling isn't just an educational choice – it's a lifestyle that brings families closer while expanding horizons. The world becomes your classroom, every day is a field trip, and learning never stops.

The investment in experiences pays dividends in character development, global awareness, and family bonds that traditional schooling simply can't match.

**Ready to start worldschooling? Download our free planning template and curriculum guide!**
      `,
      featuredImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200',
      categoryId: categories[1].id,
      authorId: adminUser.id,
      status: 'PUBLISHED' as const,
      visibility: 'PUBLIC' as const,
      publishedAt: new Date('2024-03-10'),
      views: 2100,
      readTime: 12,
      metaTitle: 'Complete Worldschooling Curriculum Guide 2024',
      metaDescription: 'Comprehensive guide to worldschooling: curriculum, resources, schedules, and real experiences from a traveling family.',
    },
    {
      slug: 'geographic-arbitrage-investment-strategy',
      title: 'Geographic Arbitrage: Our Path to Financial Freedom',
      excerpt: 'How living in low-cost countries while earning in USD accelerated our investment portfolio by 10x.',
      content: `
# Geographic Arbitrage: Our Path to Financial Freedom

Geographic arbitrage isn't just about saving money – it's about strategically positioning yourself to accelerate wealth building. Here's how we achieved a 70% savings rate by working remotely from low-cost countries.

## The Math Behind Geographic Arbitrage

### Our Previous Life (San Francisco)
- **Income**: $12,000/month (combined)
- **Expenses**: $9,500/month
- **Savings**: $2,500/month (21% savings rate)
- **Annual savings**: $30,000

### Our Nomadic Life (Average)
- **Income**: $12,000/month (unchanged)
- **Expenses**: $3,500/month
- **Savings**: $8,500/month (71% savings rate)
- **Annual savings**: $102,000

**Result**: 3.4x increase in savings without earning more!

## Our Investment Strategy

### Asset Allocation
- **40% Index Funds** (VTSAX, VTIAX)
- **25% Real Estate Crowdfunding** (Fundrise, RealtyMogul)
- **20% Crypto** (BTC, ETH, stablecoins for yield)
- **10% Individual Stocks** (Tech focus)
- **5% Cash/Emergency Fund**

### Monthly Investment Breakdown
From our $8,500 monthly savings:
- $3,400 → Index funds (automated)
- $2,125 → Real estate platforms
- $1,700 → Crypto DCA
- $850 → Individual stock picks
- $425 → Emergency fund growth

## Cost Breakdown by Country

### Mexico (Playa del Carmen)
- **Accommodation**: $800/month (2BR Airbnb)
- **Food**: $400/month
- **Transportation**: $150/month
- **Entertainment/Activities**: $300/month
- **Total**: $1,650/month

### Portugal (Lisbon)
- **Accommodation**: $1,200/month
- **Food**: $500/month
- **Transportation**: $100/month
- **Entertainment/Activities**: $400/month
- **Total**: $2,200/month

### Thailand (Chiang Mai)
- **Accommodation**: $600/month
- **Food**: $300/month
- **Transportation**: $100/month
- **Entertainment/Activities**: $200/month
- **Total**: $1,200/month

### Colombia (Medellin)
- **Accommodation**: $700/month
- **Food**: $350/month
- **Transportation**: $100/month
- **Entertainment/Activities**: $250/month
- **Total**: $1,400/month

## Tax Optimization Strategies

### Foreign Earned Income Exclusion (FEIE)
- Exclude up to $112,000 per person from US taxes
- Must be outside US for 330 days per year
- Saves us ~$25,000 annually in taxes

### Tax-Advantaged Accounts
- **Solo 401(k)**: $61,000 annual contribution limit
- **Backdoor Roth IRA**: $6,500 per person
- **HSA**: $7,750 family contribution

### Business Structure
- LLC with S-Corp election
- Reduces self-employment tax
- Additional business expense deductions

## Investment Performance

### Year 1 Results
- **Starting portfolio**: $50,000
- **Contributions**: $102,000
- **Investment returns**: $18,000 (12%)
- **Ending portfolio**: $170,000

### 5-Year Projection
Assuming 8% annual returns and $100,000 yearly contributions:
- Year 2: $303,600
- Year 3: $455,888
- Year 4: $628,359
- Year 5: $822,628

**Goal**: $1 million portfolio by year 6

## Remote Work Setup

### Income Streams
1. **Consulting** (Main): $8,000/month
2. **Blog/Affiliate**: $2,000/month
3. **Course Sales**: $1,500/month
4. **Investment Income**: $500/month

### Essential Tools
- **Communication**: Slack, Zoom, Loom
- **Project Management**: Notion, Asana
- **Time Tracking**: Toggl
- **VPN**: ExpressVPN for security
- **Banking**: Charles Schwab (no ATM fees worldwide)

## Lifestyle Design Benefits

Beyond financial gains:
- 4-hour workdays (focused productivity)
- Quality time with family
- Cultural experiences for kids
- No commute stress
- Health improvements from active lifestyle
- Stronger family bonds

## Challenges We've Overcome

### Internet Reliability
- Always have backup (mobile hotspot)
- Research connectivity before booking
- Co-working space memberships

### Time Zone Management
- Core hours: 10am-2pm EST
- Async communication culture
- Recorded meetings when necessary

### Healthcare
- International health insurance: $300/month
- Medical tourism for procedures
- Preventive care focus

## Mistakes to Avoid

1. **Not having emergency funds** (6 months expenses minimum)
2. **Ignoring tax obligations** (hire a CPA familiar with expat taxes)
3. **Lifestyle inflation** (stick to your budget)
4. **FOMO investing** (stick to your strategy)
5. **Neglecting insurance** (health, travel, equipment)

## Our Financial Independence Timeline

### Current Status (Year 2)
- Portfolio value: $285,000
- Annual expenses: $42,000
- FI number (25x expenses): $1,050,000
- Progress: 27% to FI

### Projected FI Date
At current savings rate: **5.5 years**

### Post-FI Plan
- Slow travel (3 months per location)
- Passion projects without income pressure
- Kids' college funds fully funded
- Charitable giving increase

## Action Steps to Start

1. **Calculate your numbers**
   - Current expenses vs. target country costs
   - Potential savings increase

2. **Negotiate remote work**
   - Propose trial period
   - Demonstrate productivity metrics

3. **Choose starter destinations**
   - Good infrastructure
   - Expat communities
   - Reasonable time zones

4. **Set up systems**
   - International banking
   - Investment automation
   - Tax planning

5. **Start small**
   - 1-month trial run
   - Learn and adjust
   - Scale gradually

## Resources

### Books
- "The 4-Hour Workweek" by Tim Ferriss
- "Digital Nomad Handbook" by Lonely Planet
- "The Simple Path to Wealth" by JL Collins

### Communities
- Nomad List
- Facebook: Digital Nomad Families
- Reddit: r/digitalnomad, r/financialindependence

### Tools
- Numbeo (cost of living comparisons)
- Remote Year (organized nomad programs)
- Wise (international money transfers)

## Conclusion

Geographic arbitrage isn't just a financial hack – it's a complete lifestyle redesign that prioritizes freedom, family, and experiences while accelerating wealth building.

By reducing our cost of living by 65% while maintaining our income, we've compressed a 20-year journey to financial independence into just 7 years. The best part? Our kids are getting an education money can't buy.

**The question isn't whether you can afford to do this – it's whether you can afford not to.**

Ready to calculate your geographic arbitrage potential? Download our free calculator and destination guide!
      `,
      featuredImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200',
      categoryId: categories[2].id,
      authorId: adminUser.id,
      status: 'PUBLISHED' as const,
      visibility: 'PUBLIC' as const,
      publishedAt: new Date('2024-03-05'),
      views: 3500,
      readTime: 15,
      metaTitle: 'Geographic Arbitrage: Complete Guide to Location Independence',
      metaDescription: 'How to achieve financial freedom through geographic arbitrage. Real numbers, strategies, and lessons from a nomadic family.',
    },
    {
      slug: 'portugal-digital-nomad-visa',
      title: 'Portugal D7 Visa: Your Gateway to European Residency',
      excerpt: 'Complete guide to obtaining Portugal\'s D7 visa for digital nomads and remote workers.',
      content: `
# Portugal D7 Visa: Your Gateway to European Residency

After researching visa options for two years, we chose Portugal's D7 visa. It offers the perfect combination of EU access, tax benefits, and quality of life. Here's everything you need to know.

## Why Portugal?

- **EU Access**: Travel freely in 26 Schengen countries
- **Path to Citizenship**: Eligible after 5 years
- **NHR Tax Regime**: Significant tax advantages
- **Quality of Life**: Excellent healthcare, safety, and infrastructure
- **English Friendly**: Widely spoken in major cities
- **Affordable**: 40% cheaper than Western Europe

## D7 Visa Requirements

### Financial Requirements
- **Minimum income**: €760/month (1st adult)
- **Additional adult**: +€380/month
- **Per child**: +€228/month
- **Our family (2 adults, 2 kids)**: €1,596/month minimum

### Proof of Income
Acceptable sources:
- Remote work contracts
- Freelance income
- Investment returns
- Rental income
- Pension
- Savings (€9,120 per year minimum)

## Application Process

### Step 1: Gather Documents (2-4 weeks)
- Passport copies
- Criminal background checks (FBI for Americans)
- Proof of income (6 months bank statements)
- Accommodation proof in Portugal
- Travel insurance
- Cover letter explaining intentions

### Step 2: Consulate Appointment (1-3 months wait)
- Book early – slots fill quickly
- Submit all documents
- Pay €90 fee
- Biometrics collection

### Step 3: Approval (60-90 days)
- Temporary visa issued (4 months validity)
- Must enter Portugal within validity period

### Step 4: SEF Appointment in Portugal
- Schedule within 4 months of arrival
- Biometrics again
- Receive 2-year residence permit

## Our Timeline

- **January**: Started gathering documents
- **March**: Consulate appointment in San Francisco
- **May**: Visa approved
- **June**: Arrived in Portugal
- **July**: SEF appointment
- **September**: Residence cards received

Total time: 8 months

## Living in Portugal

### Our Favorite Cities

**Lisbon**
- Pros: Culture, food scene, international community
- Cons: Expensive, touristy, hilly
- Cost: €1,500-2,500/month

**Porto**
- Pros: Beautiful, authentic, great wine
- Cons: Rainy winters, less international
- Cost: €1,200-1,800/month

**Cascais**
- Pros: Beaches, family-friendly, close to Lisbon
- Cons: Pricey, summer crowds
- Cost: €1,800-2,800/month

**Braga**
- Pros: Affordable, authentic, good schools
- Cons: Less expat community, inland
- Cost: €800-1,200/month

## NHR Tax Benefits

### 10-Year Tax Regime
- 0% tax on foreign income
- 20% flat tax on Portuguese income
- 10% tax on pensions
- No wealth tax

### Requirements
- Not Portuguese tax resident in past 5 years
- Apply within first year of residency
- Maintain residency (183+ days/year)

### Our Tax Savings
- US income: 0% Portuguese tax (still pay US tax)
- Investment income: 0% Portuguese tax
- Annual savings: ~€15,000

## Healthcare System

### Public Healthcare (SNS)
- Free or low-cost
- Good quality
- Long wait times for non-urgent care
- Registration at local health center

### Private Insurance
- €150/month for family
- No wait times
- English-speaking doctors
- Covers private hospitals

### Our Experience
Combination approach:
- Emergency/serious: Public system
- Routine/preventive: Private
- Dental: Private (very affordable)

## Education Options

### Public Schools
- Free
- Portuguese language
- Good quality
- Integration support available

### International Schools
- €500-1,500/month per child
- English instruction
- IB curriculum
- Expat community

### Our Choice
Started with international school for transition, moving to public school with Portuguese tutoring.

## Cost of Living Breakdown

### Monthly Budget (Family of 4)
- **Rent** (T3 apartment, Lisbon): €1,400
- **Utilities**: €150
- **Groceries**: €500
- **Transportation** (public): €160
- **Healthcare** (private insurance): €150
- **Education** (public + tutoring): €200
- **Entertainment/Dining**: €400
- **Miscellaneous**: €200
- **Total**: €3,160

## Investment Opportunities

### Real Estate
- Growing market
- Golden Visa option (€500k+)
- Rental yields: 4-6%
- Capital appreciation: 5-8% annually

### Portuguese Stocks
- PSI-20 index
- Dividend yields: 3-5%
- No tax under NHR

### Crypto
- Crypto-friendly regulations
- No capital gains tax (for now)
- Growing blockchain ecosystem

## Challenges We Faced

### Language Barrier
- **Challenge**: Official documents in Portuguese
- **Solution**: Google Translate + local help
- **Tip**: Learn basic Portuguese (Duolingo)

### Bureaucracy
- **Challenge**: Slow processes, lots of paperwork
- **Solution**: Patience + local lawyer
- **Cost**: €1,500 for legal assistance

### Finding Housing
- **Challenge**: Competitive rental market
- **Solution**: Facebook groups, local agents
- **Tip**: Have documents ready, offer 2-3 months upfront

## Tips for Success

1. **Start early**: Process takes 6-12 months
2. **Over-document**: Better too much than too little
3. **Join communities**: Facebook groups invaluable
4. **Learn Portuguese**: Shows commitment, helps integration
5. **Be patient**: Portuguese time is real
6. **Hire help**: Lawyer/consultant worth it for complex cases
7. **Visit first**: Scout locations before committing

## Resources

### Facebook Groups
- Americans & FriendsPT
- D7 Visa Portugal
- Expats in Lisbon/Porto

### Services We Used
- Lawyer: Cátia Tocha (€1,500)
- Accountant: Fernando Silva (€100/month)
- Relocation: Pearls of Portugal

### Useful Websites
- eportugal.gov.pt (official portal)
- sef.pt (immigration)
- portaldasfinancas.gov.pt (taxes)

## Future Plans

### Year 1-2: Explore Portugal
- Test different cities
- Build local network
- Establish tax residency

### Year 3-5: EU Exploration
- 90 days in other EU countries
- Maintain Portuguese residency
- Build European investment portfolio

### Year 5+: Citizenship
- Apply for permanent residency
- Portuguese citizenship eligibility
- EU passport for family

## Conclusion

The D7 visa has given us access to an incredible quality of life, EU freedom, and significant tax savings. While the process requires patience and preparation, the benefits far outweigh the challenges.

Portugal offers the perfect blend of European culture, affordability, and opportunity for digital nomad families. It's not just a visa – it's a gateway to a completely new lifestyle.

**Considering the D7 visa? Download our complete checklist and document templates!**
      `,
      featuredImage: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200',
      categoryId: categories[0].id,
      authorId: adminUser.id,
      status: 'PUBLISHED' as const,
      visibility: 'PUBLIC' as const,
      publishedAt: new Date('2024-02-28'),
      views: 4200,
      readTime: 10,
      location: 'Lisbon, Portugal',
      country: 'Portugal',
      metaTitle: 'Portugal D7 Visa Guide 2024: Complete Digital Nomad Guide',
      metaDescription: 'Everything you need to know about Portugal D7 visa for digital nomads. Requirements, process, costs, and real experience.',
    },
  ];

  // Create blog posts with tags
  for (const postData of posts) {
    const { categoryId, authorId, ...post } = postData;
    
    const createdPost = await prisma.post.create({
      data: {
        ...post,
        category: { connect: { id: categoryId } },
        author: { connect: { id: authorId } },
        tags: {
          connect: [
            { id: tags[Math.floor(Math.random() * tags.length)].id },
            { id: tags[Math.floor(Math.random() * tags.length)].id },
          ],
        },
      },
    });
    console.log(`Post created: ${createdPost.title}`);
  }

  // Create sample journal entries
  const journalEntries = [
    {
      title: 'First Week in Lisbon',
      content: 'The kids are adjusting well to the new environment. Found an amazing local school and the community has been incredibly welcoming.',
      mood: 'HAPPY' as const,
      location: 'Lisbon, Portugal',
      isPrivate: false,
      authorId: adminUser.id,
    },
    {
      title: 'Investment Milestone',
      content: 'Hit our first $100k in investments! Geographic arbitrage is really accelerating our FI timeline.',
      mood: 'EXCITED' as const,
      isPrivate: true,
      authorId: adminUser.id,
    },
  ];

  for (const entry of journalEntries) {
    const { authorId, ...entryData } = entry;
    await prisma.journalEntry.create({ 
      data: {
        ...entryData,
        author: { connect: { id: authorId } }
      } 
    });
  }
  console.log('Journal entries created');

  // Newsletter subscribers would go here if the model existed
  // Skipping for now as the model doesn't exist in the schema

  console.log('✅ Data seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });