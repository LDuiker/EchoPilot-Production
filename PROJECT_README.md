# EchoPilot - Review Monitoring Platform

A comprehensive React-based review monitoring platform built with Next.js, Supabase, and modern web technologies. EchoPilot helps businesses track, analyze, and respond to customer reviews across multiple platforms.

## 🚀 Features

- **Multi-Platform Review Monitoring**: Google, Yelp, Facebook, TripAdvisor
- **AI-Powered Sentiment Analysis**: Automatic sentiment detection and topic extraction
- **Real-time Notifications**: Email alerts for new reviews and sentiment changes
- **Analytics Dashboard**: Comprehensive insights and reporting
- **User Management**: Role-based access control (Admin, Business Owner)
- **API Access**: Full REST API for custom integrations
- **Responsive Design**: Mobile-first, modern UI/UX

## 🏗️ Project Structure

```
EchoPilot-Production/
├── components/                 # React components
│   ├── auth/                  # Authentication components
│   ├── dashboard/             # Dashboard components
│   ├── layout/                # Layout components
│   └── ui/                    # Reusable UI components
├── hooks/                     # Custom React hooks
├── lib/                       # Utility libraries
├── pages/                     # Next.js pages
│   └── auth/                  # Authentication pages
├── scripts/                   # Database scripts
├── styles/                    # Global styles
├── supabase/                  # Supabase configuration
│   ├── functions/             # Edge Functions
│   ├── migrations/            # Database migrations
│   └── config.toml           # Supabase config
├── docs/                      # Documentation
├── __tests__/                 # Test files
├── public/                    # Static assets
└── Configuration files
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Next.js 14** - React framework with SSR
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Framer Motion** - Animations

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Edge Functions
  - Real-time subscriptions
- **Deno** - Runtime for Edge Functions

### Testing
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **Playwright** - E2E testing

### Deployment
- **Vercel** - Frontend deployment
- **Netlify** - Alternative deployment
- **Supabase** - Backend hosting

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase CLI
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/echopilot.git
   cd echopilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Start local Supabase
   npm run supabase:start
   
   # Apply database migrations
   npm run db:migrate
   
   # Seed database with sample data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

The application uses a comprehensive PostgreSQL schema with the following main tables:

- **users** - User profiles and authentication
- **businesses** - Business information and monitoring settings
- **reviews** - Review data from various platforms
- **sentiment_analysis** - AI analysis results
- **email_notifications** - Notification tracking
- **user_preferences** - User settings and preferences
- **review_tags** - Automated review categorization
- **api_keys** - API access management

### Running Migrations
```bash
# Apply migrations to local database
npm run db:migrate

# Reset database (development only)
npm run db:reset

# Seed with sample data
npm run db:seed
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript checks

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests

# Database
npm run db:migrate       # Apply migrations
npm run db:reset         # Reset database
npm run db:seed          # Seed database

# Supabase
npm run supabase:start   # Start local Supabase
npm run supabase:stop    # Stop local Supabase
npm run supabase:status  # Check Supabase status

# Edge Functions
npm run functions:deploy # Deploy Edge Functions
npm run functions:new    # Create new function
```

### Code Structure

#### Components
- **Auth Components**: Sign up, sign in, password reset, user profile
- **Dashboard Components**: Overview, analytics, charts
- **Layout Components**: Sidebar, header, navigation
- **UI Components**: Buttons, forms, modals, loading states

#### Hooks
- **useAuth**: Authentication state management
- **useBusinesses**: Business data management
- **useReviews**: Review data and filtering
- **useAnalytics**: Analytics and reporting

#### Pages
- **Dashboard**: Main application interface
- **Auth**: Authentication flow
- **Businesses**: Business management
- **Reviews**: Review monitoring and analysis
- **Analytics**: Reports and insights
- **Settings**: User preferences and configuration

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard**

### Netlify Deployment

1. **Connect to Netlify**
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Supabase Edge Functions

```bash
# Deploy all functions
npm run functions:deploy

# Deploy specific function
supabase functions deploy fetch-reviews
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Getting Started](./docs/getting-started/)
- [User Guides](./docs/user-guides/)
- [API Documentation](./docs/api/)
- [Developer Guides](./docs/developer/)
- [Troubleshooting](./docs/troubleshooting/)

## 🔐 Security

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure token-based authentication
- **API Key Management**: Secure API access
- **Input Validation**: Comprehensive form and API validation
- **CORS Configuration**: Proper cross-origin resource sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/echopilot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/echopilot/discussions)
- **Email**: support@echopilot.com

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [Vercel](https://vercel.com) for seamless deployment
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [React](https://reactjs.org) for the incredible UI library

---

**EchoPilot** - Monitor, analyze, and respond to your reviews with confidence. 