
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
│  │  │  ├─ myApplicationController.js
│  │  │  ├─ authController.js
│  │  │  ├─ notificationController.js
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
│  │  │  ├─ myApplicationRoutes.js
│  │  │  ├─ notificationRoutes.js
│  │  │  ├─ opportunityRoutes.js
│  │  │  ├─ profileRoutes.js
│  │  │  ├─ profileRoutes.test.js
│  │  │  └─ providerAuthRoutes.js
│  │  ├─ server.js
│  │  ├─ services
│  │  │  ├─ myApplicationService.js
│  │  │  ├─ emailService.js
│  │  │  ├─ notificationService.js
│  │  │  ├─ opportunityService.js
│  │  │  ├─ opportunityService.test.js
│  │  │  └─ profileService.js
│  │  └─ utils
│  │     └─ generateJWT.js
│  └─ tests
│     ├─ applicationController.test.js
│     ├─ applicationService.test.js
│     ├─ notificationController.test.js
│     ├─ notificationRoutes.test.js
│     ├─ notificationService.test.js
│     ├─ opportunityController.test.js
│     └─ opportunityService.test.js
├─ frontend
│  ├─ eslint.config.js
│  ├─ index.html
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
│  │  │  ├─ requirements
│  │  │  │  ├─ EducationSection.jsx
│  │  │  │  ├─ RoleSection.jsx
│  │  │  │  └─ SkillsSection.jsx
│  │  │  └─ studentProfile
│  │  │     ├─ connectivity.jsx
│  │  │     ├─ cvUpload.jsx
│  │  │     ├─ editProfileForm.jsx
│  │  │     ├─ education.jsx
│  │  │     ├─ personalInfo.jsx
│  │  │     ├─ profileForm.jsx
│  │  │     ├─ profileForm.test.jsx
│  │  │     └─ skills.jsx
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
│  │  │  ├─ AuthDenied.jsx
│  │  │  ├─ AuthError.jsx
│  │  │  ├─ CreateStudentProfile.jsx
│  │  │  ├─ CreateStudentProfile.test.jsx
│  │  │  ├─ DefineRequirements.jsx
│  │  │  ├─ EditStudentProfile.jsx
│  │  │  ├─ Home.jsx
│  │  │  ├─ Opportunities.jsx
│  │  │  ├─ OpportunityDetail.jsx
│  │  │  ├─ PostOpportunity.jsx
│  │  │  ├─ ProviderLogin.jsx
│  │  │  ├─ ProviderRegistration.jsx
│  │  │  ├─ Qualifications.jsx
│  │  │  ├─ StudentDashboard.jsx
│  │  │  └─ ValidationPipeline.jsx
│  │  ├─ routes
│  │  │  └─ protectedRoute.jsx
│  │  ├─ services
│  │  │  ├─ myApplicationService.js
│  │  │  └─ authService.js
│  │  └─ setupTests.js
│  ├─ tailwind.config.js
│  └─ vite.config.js
├─ package-lock.json
├─ package.json
└─ README.md

```