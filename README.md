
```
SD-Web-App
├─ backend
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ src
│  │  ├─ app.js
│  │  ├─ config
│  │  │  ├─ googleAuth.js
│  │  │  └─ supabaseClient.js
│  │  ├─ controllers
│  │  │  ├─ authController.js
│  │  │  ├─ opportunityController.js
│  │  │  ├─ opportunityController.test.js
│  │  │  ├─ profileController.js
│  │  │  └─ profileController.test.js
│  │  ├─ middleware
│  │  │  ├─ authMiddleware.js
│  │  │  ├─ errorHandler.js
│  │  │  ├─ roleMiddleware.js
│  │  │  ├─ uploadMiddleware.js
│  │  │  └─ uploadMiddleware.test.js
│  │  ├─ models
│  │  ├─ routes
│  │  │  ├─ applicantAuthRoutes.js
│  │  │  ├─ opportunityRoutes.js
│  │  │  ├─ profileRoutes.js
│  │  │  ├─ profileRoutes.test.js
│  │  │  └─ providerAuthRoutes.js
│  │  ├─ server.js
│  │  ├─ services
│  │  │  ├─ emailService.js
│  │  │  ├─ opportunityService.js
│  │  │  ├─ opportunityService.test.js
│  │  │  └─ profileService.js
│  │  └─ utils
│  │     └─ generateJWT.js
│  └─ tests
├─ frontend
│  ├─ babel.config.js
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ jest.config.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ public
│  │  ├─ favicon.svg
│  │  ├─ icons.svg
│  │  └─ web.config
│  ├─ README.md
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ components
│  │  │  ├─ admin
│  │  │  │  ├─ OpportunitiesTable.jsx
│  │  │  │  ├─ OpportunityRow.jsx
│  │  │  │  ├─ StatsGrid.jsx
│  │  │  │  └─ TopBar.jsx
│  │  │  ├─ auth
│  │  │  │  ├─ AuthFormPanel.jsx
│  │  │  │  ├─ AuthHeroPanel.jsx
│  │  │  │  ├─ AuthLayout.jsx
│  │  │  │  ├─ GoogleLoginButton.jsx
│  │  │  │  ├─ ProviderGoogleLoginButton.jsx
│  │  │  │  └─ useAuthFonts.js
│  │  │  ├─ common
│  │  │  │  └─ FloatingActionButton.jsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ ActivityItem.jsx
│  │  │  │  ├─ AnalyticsCard.jsx
│  │  │  │  ├─ DashboardHeader.jsx
│  │  │  │  ├─ JobCard.jsx
│  │  │  │  ├─ OpportunityCard.jsx
│  │  │  │  ├─ QualificationItem.jsx
│  │  │  │  ├─ QualificationList.jsx
│  │  │  │  ├─ QualificationsList.jsx
│  │  │  │  ├─ Sidebar.jsx
│  │  │  │  ├─ StatsCard.jsx
│  │  │  │  ├─ UploadBanner.jsx
│  │  │  │  └─ VerificationCard.jsx
│  │  │  ├─ forms
│  │  │  │  ├─ OpportunityForm.jsx
│  │  │  │  └─ RequirementsForm.jsx
│  │  │  ├─ Hero.jsx
│  │  │  ├─ HowItWorks.jsx
│  │  │  ├─ layout
│  │  │  │  ├─ Sidebar.jsx
│  │  │  │  └─ Topbar.jsx
│  │  │  ├─ Navbar.jsx
│  │  │  ├─ opportunities
│  │  │  │  ├─ OpportunityCard.jsx
│  │  │  │  ├─ OpportunityFilters.jsx
│  │  │  │  ├─ OpportunityList.jsx
│  │  │  │  └─ QualificationCard.jsx
│  │  │  ├─ PortalCard.jsx
│  │  │  └─ requirements
│  │  │     ├─ EducationSection.jsx
│  │  │     ├─ RoleSection.jsx
│  │  │     └─ SkillsSection.jsx
│  │  ├─ context
│  │  │  ├─ AuthContext.jsx
│  │  │  ├─ authContextValue.js
│  │  │  └─ useAuth.js
│  │  ├─ index.css
│  │  ├─ lib
│  │  │  ├─ api.js
│  │  │  ├─ api.test.js
│  │  │  └─ supabaseClient.js
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ AdminConsole.jsx
│  │  │  ├─ ApplicantLogin.jsx
│  │  │  ├─ AuthError.jsx
│  │  │  ├─ DefineRequirements.jsx
│  │  │  ├─ Home.jsx
│  │  │  ├─ Opportunities.jsx
│  │  │  ├─ OpportunityDetail.jsx
│  │  │  ├─ PostOpportunity.jsx
│  │  │  ├─ ProviderLogin.jsx
│  │  │  ├─ ProviderRegistration.jsx
│  │  │  ├─ StudentDashboard.jsx
│  │  │  └─ ValidationPipeline.jsx
│  │  ├─ routes
│  │  │  └─ protectedRoute.jsx
│  │  ├─ services
│  │  │  └─ authService.js
│  │  └─ setupTests.js
│  ├─ tailwind.config.js
│  └─ vite.config.js
├─ package-lock.json
├─ package.json
└─ README.md

```