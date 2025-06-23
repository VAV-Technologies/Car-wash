# Nobridge - Business Marketplace Platform!

Nobridge is a comprehensive marketplace platform connecting SME owners looking to sell their businesses with motivated buyers and investors across Asia. Built with modern web technologies for security, scalability, and excellent user experience.

> **🚀 Status**: Live and deployed! [Visit Nobridge →](https://nobridge.vercel.app)
>
> **🔒 Repository**: Successfully deployed from private repository ✨

## 🚀 Recent Updates (Latest Version)

### 🎨 **Modern UI Redesign** *(Latest)*
- **Sidebar Enhancement**: All dashboard sidebars now feature modern rounded corners, smooth animations, and curved edges
- **Consistent Design**: Admin, Seller, and Buyer dashboards share the same polished sidebar design
- **Real-time Metrics**: Admin dashboard now displays accurate engagement metrics instead of placeholder data
- **Brand Colors**: Consistent use of Nobridge brand colors throughout all interfaces

### ✨ Complete Branding Update
- **Rebranded from BizMatch Asia to Nobridge** across all components and pages
- **Custom Logo Integration**: Replaced text-based logo with actual Nobridge logo images
  - Light theme: `nobridge_logo_dark_no_bg.png`
  - Dark theme: `nobridge_logo_light_no_bg.png`
  - Responsive sizing support (lg, xl, 2xl)
- **Updated Email Addresses**: Changed all contact emails from `@bizmatch.asia` to `@nobridge.asia`

### 🎨 Typography Enhancement
- **Custom Heading Font**: Integrated "Montserrat Arabic Regular" for all headings (h1-h6)
- **Font Loading**: Optimized font loading with `font-display: swap`
- **Fallback System**: Graceful fallback to Satoshi and system fonts
- **Body Text**: Continues to use Satoshi for optimal readability

### 🎯 Custom Icon System
- **16 Custom Icons**: Added comprehensive icon library with semantic naming
- **NobridgeIcon Component**: Reusable component with size variants (sm, md, lg, xl)
- **Icon Mapping**: Semantic names for business-specific use cases:
  - `business-listing`: For listing cards and marketplace sections
  - `calculator`: For financial data and calculations
  - `revenue`/`investment`: For monetary displays
  - `growth`: For analytics and performance metrics
  - `verification`/`secure-docs`: For security and verification features
  - And many more...

### 🔐 Enhanced Authentication System
- **Dual Verification**: Magic links AND 6-digit OTP codes in the same email
- **Custom Email Template**: Beautiful, branded confirmation emails
- **Improved UX**: Tabbed interface for verification methods
- **Better Error Handling**: Comprehensive error states and recovery flows
- **Security**: Cross-browser profile isolation (expected behavior)

### 🎨 Design System
- **Color Palette**: Nobridge brand colors consistently applied
  - Primary: `#0D0D39` (Dark Blue)
  - Secondary: `#F4F6FC` (Light Gray)
  - Background: `#FFFFFF` (White)
- **Theme Support**: Full dark/light mode with proper logo switching
- **Consistent Spacing**: Harmonized component spacing and typography

## 🛠 Technology Stack

### Frontend
- **Next.js 15.2.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - High-quality component library
- **Lucide React** - Icon library (for UI elements)
- **Next Themes** - Theme management

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Built-in authentication
  - Email services
- **Prisma** - Database ORM and migrations

### Authentication & Security
- **Supabase Auth** - Complete authentication system
- **Email Verification** - Magic links + OTP codes
- **Role-based Access** - Buyer, Seller, Admin roles
- **RLS Policies** - Database-level security

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Authentication routes (route group)
│   ├── auth/           # Auth-related pages (non-grouped)
│   ├── dashboard/      # User dashboards
│   └── ...
├── components/         # Reusable components
│   ├── auth/          # Authentication components
│   ├── shared/        # Shared components (Logo, etc.)
│   └── ui/            # Base UI components (ShadCN + custom)
├── lib/               # Utilities and configurations
├── hooks/             # Custom React hooks
└── types/             # TypeScript type definitions

supabase/
├── migrations/        # Database migrations
├── templates/         # Email templates
└── config.toml       # Supabase configuration

public/assets/         # Static assets (logos, icons, fonts)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker (for Supabase local development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Supabase (local development)**
   ```bash
   supabase start
   ```

4. **Run database migrations**
   ```bash
   supabase db reset
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:9002`

### Environment Variables
Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

## 📧 Email System

### Local Development
- **Inbucket**: View emails at `http://localhost:54324`
- **Custom Templates**: Located in `supabase/templates/`
- **Dual Verification**: Every email includes both magic link and OTP

### Production Setup
Configure SMTP in `supabase/config.toml`:
```toml
[auth.email.smtp]
enabled = true
host = "your-smtp-host"
# ... other SMTP settings
```

## 🎨 Using Custom Icons

```tsx
import { NobridgeIcon } from '@/components/ui/nobridge-icon'

// Basic usage
<NobridgeIcon icon="business-listing" />

// With custom size
<NobridgeIcon icon="calculator" size="lg" />

// With custom styling
<NobridgeIcon
  icon="revenue"
  size="xl"
  className="text-primary"
  alt="Revenue metrics"
/>
```

## 🔄 Database Management

### Migrations
```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db reset

# Generate types
supabase gen types typescript --local > src/types/supabase.ts
```

### Reset Database
```bash
supabase db reset
```

## 🚀 Deployment

### Vercel (Frontend)
```bash
npm run build
vercel --prod
```

### Supabase (Backend)
```bash
supabase link --project-ref [your-project-ref]
supabase db push
```

## 🐛 Authentication Troubleshooting

### Magic Links Not Working
1. Check `site_url` in `supabase/config.toml`
2. Verify `additional_redirect_urls` includes your callback URL
3. Ensure email templates are properly configured

### OTP Codes Not Showing
1. Check local emails at `http://localhost:54324`
2. Verify `otp_length = 6` in config
3. Check custom email template includes `{{ .Token }}`

### Cross-Browser Issues
- **Expected Behavior**: Different browser profiles maintain separate auth states
- **Solution**: Use same browser profile or implement SSO if needed

## 📝 Contributing

1. Follow the existing code style and patterns
2. Update documentation for new features
3. Test authentication flows thoroughly
4. Ensure responsive design on all screen sizes
5. Maintain type safety throughout

## 📄 License

[Add your license information here]

---

## 🎯 Roadmap

### Immediate Priorities
- [ ] Complete icon integration across all pages
- [ ] Test email system in production
- [ ] Performance optimization
- [ ] Mobile responsiveness audit

### Future Enhancements
- [ ] Real-time messaging system
- [ ] Advanced search and filtering
- [ ] Document management system
- [ ] Analytics dashboard
- [ ] Mobile app development

---

**Built with ❤️ for the Asian business community**
