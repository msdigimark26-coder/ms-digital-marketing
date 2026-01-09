# MS Digital Marketing

Award-winning digital marketing agency crafting immersive brand experiences through SEO, social media, design, and cutting-edge 3D visualization.

![MS Digital Marketing](./public/favicon.png)

## 🚀 Live Site

**Production**: [https://msdigimark.org](https://msdigimark.org)

## ✨ Features

- 🎨 **Premium UI/UX** - Modern, animated interface with purple/pink gradient theme
- 📱 **Fully Responsive** - Perfect on all devices (mobile, tablet, desktop)
- ⚡ **High Performance** - Optimized build (~630KB gzipped)
- 🔒 **Content Protection** - Copy prevention, right-click disabled
- 🛡️ **Secure Admin Portal** - Face authentication & audit logging
- 🌐 **SEO Optimized** - Meta tags, Open Graph, structured data
- 💳 **Payment Integration** - UPI payment gateway
- 📊 **Analytics Ready** - Built-in tracking support

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Netlify
- **Icons**: Lucide React
- **3D/Animation**: GSAP + Custom animations

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ms-digital-marketing.git
cd ms-digital-marketing

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🌐 Deployment

### Netlify (Recommended)

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Login**:
```bash
netlify login
```

3. **Deploy**:
```bash
npm run build
netlify deploy --prod
```

Or use the deploy script:
```bash
./deploy.sh
```

### Manual Deployment

1. Build the project: `npm run build`
2. Upload the `dist` folder to your hosting service

## 📂 Project Structure

```
ms-digital-marketing/
├── public/              # Static assets
│   ├── favicon.png
│   ├── Team Members 2/  # Team member images
│   └── models/          # 3D models
├── src/
│   ├── components/      # React components
│   │   ├── admin/       # Admin portal components
│   │   ├── home/        # Homepage sections
│   │   ├── layout/      # Layout components
│   │   └── ui/          # Reusable UI components
│   ├── pages/           # Page components
│   │   └── services/    # Service detail pages
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # Supabase integration
│   └── utils/           # Utility functions
├── supabase/
│   └── migrations/      # Database migrations
├── index.html           # Entry HTML
├── netlify.toml         # Netlify configuration
└── vite.config.ts       # Vite configuration
```

## 🎯 Key Pages

- **Home** (`/`) - Landing page with hero, services, portfolio
- **About** (`/about`) - Company information, team members
- **Services** (`/services`) - Service offerings
  - Web Design (`/services/web-design`)
  - SEO Services (`/services/seo-services`)
  - Meta Ads (`/services/meta-ads`)
  - Google Ads (`/services/google-ads`)
  - Video & Photo Editing (`/services/video-photo-editing`)
  - 3D Modeling (`/services/3d-modeling`)
- **Portfolio** (`/portfolio`) - Project showcase
- **Testimonials** (`/testimonials`) - Client reviews
- **Contact** (`/contact`) - Contact form
- **Payments** (`/payments`) - UPI payment gateway
- **Admin** (`/admin`) - Admin dashboard (protected)

## 🔐 Admin Portal

Access the admin portal at `/admin` with valid credentials.

Features:
- Dashboard with analytics
- Lead management
- Portfolio management
- Testimonials management
- Booking management
- Audit logs
- Face authentication

## 🎨 Design System

- **Primary Colors**: Purple (#A855F7) to Pink (#EC4899)
- **Dark Theme**: Background (#05030e)
- **Typography**: Inter, system fonts
- **Animations**: Framer Motion + GSAP
- **Icons**: Lucide React

## 📱 Browser Support

- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+
- Mobile browsers (iOS 16+, Android 12+)

## 🚧 Known Issues

See `COMPLETE_AUDIT_REPORT.md` for full system audit and fixes applied.

## 📄 Documentation

- `NETLIFY_DEPLOYMENT.md` - Deployment guide
- `NETLIFY_ENV_SETUP.md` - Environment variables setup
- `DEPLOYMENT_ERROR_FIX.md` - Troubleshooting guide
- `CONTENT_PROTECTION_GUIDE.md` - Content protection details
- `PERFORMANCE_OPTIMIZATION_REPORT.md` - Performance improvements
- `COMPLETE_AUDIT_REPORT.md` - Full system audit

## 🤝 Contributing

This is a private commercial project. For inquiries, contact:

**Email**: msdigimark26@gmail.com  
**UPI**: saisankeet@okhdfcbank

## 📝 License

Copyright © 2026 MS Digital Marketing. All rights reserved.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Backend by [Supabase](https://supabase.com/)
- Hosted on [Netlify](https://netlify.com/)

---

**Made with ❤️ by MS Digital Marketing Team**
