# 🚀 Deploy to blog.doyleengler.com

## Current Status
- ✅ Application is running LOCALLY at http://localhost:3003
- ❌ NOT yet deployed to blog.doyleengler.com

## Deployment Options

### Option 1: Deploy to VPS/Cloud Server (Recommended)
If you have a server (DigitalOcean, AWS, etc.):

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Clone the repository
git clone <your-repo-url> travel-blog
cd travel-blog

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp .env.example .env
nano .env
# Add your production values:
# - DATABASE_URL (production database)
# - NEXTAUTH_SECRET (generate new one)
# - NEXTAUTH_URL=https://blog.doyleengler.com
# - JOURNAL_ENCRYPTION_KEY (keep the same)

# 5. Set up database
npx prisma generate
npx prisma migrate deploy

# 6. Build the application
npm run build

# 7. Install PM2 for process management
npm install -g pm2

# 8. Start with PM2
pm2 start npm --name "travel-blog" -- start
pm2 save
pm2 startup

# 9. Set up Nginx reverse proxy
sudo nano /etc/nginx/sites-available/blog.doyleengler.com
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name blog.doyleengler.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 10. Enable site and SSL
sudo ln -s /etc/nginx/sites-available/blog.doyleengler.com /etc/nginx/sites-enabled/
sudo certbot --nginx -d blog.doyleengler.com
sudo nginx -s reload
```

### Option 2: Deploy to Vercel (Easiest)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod

# 3. Add custom domain in Vercel dashboard
# 4. Set environment variables in Vercel dashboard
```

### Option 3: Deploy to Netlify
```bash
# 1. Build the static export (if possible)
npm run build

# 2. Deploy to Netlify
# - Connect GitHub repo to Netlify
# - Set build command: npm run build
# - Set publish directory: .next
# - Add environment variables
```

## Required Environment Variables for Production

```env
# Database (use a production database, not local)
DATABASE_URL="postgresql://user:password@production-db-host:5432/travelblog"

# Authentication (generate new secret)
NEXTAUTH_SECRET="<generate-with: openssl rand -base64 32>"
NEXTAUTH_URL="https://blog.doyleengler.com"

# Site URL
NEXT_PUBLIC_SITE_URL="https://blog.doyleengler.com"

# Encryption (keep the same to access existing journals)
JOURNAL_ENCRYPTION_KEY="4d67821fb4952497644334b8b1ec18af10e74a9c5b72feda341aed95a4137638"

# Email (if using)
GOOGLE_SMTP_USER="your-email@gmail.com"
GOOGLE_SMTP_PASSWORD="your-app-password"

# Optional: Analytics
GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

## DNS Configuration

Make sure blog.doyleengler.com points to your server:

```
Type: A Record
Name: blog
Value: <your-server-ip>
TTL: 3600
```

Or for Vercel/Netlify:
```
Type: CNAME
Name: blog
Value: <platform-provided-domain>
TTL: 3600
```

## Post-Deployment Checklist

- [ ] Domain resolves correctly
- [ ] SSL certificate is active (https://)
- [ ] Can login with admin account
- [ ] Can create/edit posts
- [ ] Journal encryption works
- [ ] Images upload correctly
- [ ] Social sharing works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Database backups configured

## Quick Deployment Status Check

Run this to check if the site is live:
```bash
curl -I https://blog.doyleengler.com
```

If you get a 200 OK response, the site is deployed!

## Need Help?

The application is fully ready for deployment. Choose your preferred hosting method above and follow the steps. The most common approach is:

1. **VPS with Nginx** - Full control, best performance
2. **Vercel** - Easiest, automatic scaling
3. **Netlify** - Good for static sites

All your code is production-ready with security features implemented!