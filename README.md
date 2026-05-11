
```
SD-Web-App

```
```
SD1
├─ backend
│  ├─ jest.config.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ src
│  │  ├─ app.js
│  │  ├─ config
│  │  │  ├─ googleAuth.js
│  │  │  └─ supabaseClient.js
│  │  ├─ controllers
│  │  │  ├─ adminController.js
│  │  │  ├─ applicationController.js
│  │  │  ├─ authController.js
│  │  │  ├─ employerApplicationController.js
│  │  │  ├─ myApplicationController.js
│  │  │  ├─ notificationController.js
│  │  │  ├─ opportunityController.js
│  │  │  ├─ profileController.js
│  │  │  └─ skillsController.js
│  │  ├─ cronJob.js
│  │  ├─ middleware
│  │  │  ├─ authMiddleware.js
│  │  │  ├─ errorHandler.js
│  │  │  ├─ providerAuthMiddleware.js
│  │  │  ├─ requireAdmin.js
│  │  │  ├─ requireAuth.js
│  │  │  ├─ roleMiddleware.js
│  │  │  └─ uploadMiddleware.js
│  │  ├─ routes
│  │  │  ├─ adminRoutes.js
│  │  │  ├─ applicantAuthRoutes.js
│  │  │  ├─ applicationRoutes.js
│  │  │  ├─ employerApplicationRoutes.js
│  │  │  ├─ myApplicationRoutes.js
│  │  │  ├─ notificationRoutes.js
│  │  │  ├─ opportunityRoutes.js
│  │  │  ├─ profileRoutes.js
│  │  │  ├─ providerAuthRoutes.js
│  │  │  └─ skillsRoutes.js
│  │  ├─ server.js
│  │  ├─ services
│  │  │  ├─ adminService.js
│  │  │  ├─ applicationService.js
│  │  │  ├─ emailService.js
│  │  │  ├─ employerApplicationService.js
│  │  │  ├─ myApplicationService.js
│  │  │  ├─ notificationService.js
│  │  │  ├─ opportunityService.js
│  │  │  ├─ profileService.js
│  │  │  ├─ reminderService.js
│  │  │  └─ skillsService.js
│  │  └─ utils
│  │     └─ generateJWT.js
│  └─ tests
│     ├─ adminController.test.js
│     ├─ adminRoutes.test.js
│     ├─ adminService.test.js
│     ├─ applicantAuthRoutes.test.js
│     ├─ applicationController.test.js
│     ├─ applicationService.test.js
│     ├─ authController.test.js
│     ├─ authMiddleware.test.js
│     ├─ employerApplicationController.test.js
│     ├─ employerApplicationRoutes.test.js
│     ├─ employerApplicationService.test.js
│     ├─ myApplicationController.test.js
│     ├─ myApplicationRoutes.test.js
│     ├─ myApplicationService.test.js
│     ├─ notificationController.test.js
│     ├─ notificationRoutes.test.js
│     ├─ notificationService.test.js
│     ├─ opportunityController.test.js
│     ├─ opportunityService.test.js
│     ├─ profileController.test.js
│     ├─ profileRoutes.test.js
│     ├─ requireAdmin.test.js
│     ├─ requireAuth.test.js
│     ├─ roleMiddleware.test.js
│     └─ uploadMiddleware.test.js
├─ frontend
│  ├─ babel.config.cjs
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ jest.config.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ public
│  │  ├─ favicon.svg
│  │  ├─ icons.svg
│  │  ├─ web.config
│  │  └─ _redirects
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
│  │  │  │  ├─ AdminSection.jsx
│  │  │  │  ├─ OpportunitiesTable.jsx
│  │  │  │  ├─ OpportunityRow.jsx
│  │  │  │  ├─ StatsGrid.jsx
│  │  │  │  └─ TopBar.jsx
│  │  │  ├─ applications
│  │  │  │  ├─ myApplicationCard.jsx
│  │  │  │  ├─ myApplicationList.jsx
│  │  │  │  └─ RecommendedPanel.jsx
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
│  │  │  │  ├─ UploadBanner.jsx
│  │  │  │  └─ VerificationCard.jsx
│  │  │  ├─ employer
│  │  │  │  └─ EmployerApplicationCard.jsx
│  │  │  ├─ forms
│  │  │  │  └─ OpportunityForm.jsx
│  │  │  ├─ Hero.jsx
│  │  │  ├─ HowItWorks.jsx
│  │  │  ├─ layout
│  │  │  │  ├─ AdminTopbar.jsx
│  │  │  │  ├─ Sidebar.jsx
│  │  │  │  └─ Topbar.jsx
│  │  │  ├─ Navbar.jsx
│  │  │  ├─ notifications
│  │  │  │  └─ notificationDropdown.jsx
│  │  │  ├─ opportunities
│  │  │  │  ├─ OpportunityCard.jsx
│  │  │  │  ├─ OpportunityFilters.jsx
│  │  │  │  ├─ OpportunityList.jsx
│  │  │  │  └─ QualificationCard.jsx
│  │  │  ├─ PortalCard.jsx
│  │  │  └─ studentProfile
│  │  │     ├─ connectivity.jsx
│  │  │     ├─ cvUpload.jsx
│  │  │     ├─ editProfileForm.jsx
│  │  │     ├─ education.jsx
│  │  │     ├─ personalInfo.jsx
│  │  │     ├─ profileForm.jsx
│  │  │     ├─ qualifications.jsx
│  │  │     └─ skills.jsx
│  │  ├─ context
│  │  │  ├─ AuthContext.jsx
│  │  │  ├─ authContextValue.js
│  │  │  └─ useAuth.js
│  │  ├─ index.css
│  │  ├─ lib
│  │  │  ├─ api.js
│  │  │  └─ supabaseClient.js
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ AdminAccessApplications.jsx
│  │  │  ├─ AdminConsole.jsx
│  │  │  ├─ ApplicantLogin.jsx
│  │  │  ├─ AuthDenied.jsx
│  │  │  ├─ AuthError.jsx
│  │  │  ├─ CreateStudentProfile.jsx
│  │  │  ├─ EditStudentProfile.jsx
│  │  │  ├─ EmployerApplications.jsx
│  │  │  ├─ Home.jsx
│  │  │  ├─ MyApplications.jsx
│  │  │  ├─ Notifications.jsx
│  │  │  ├─ Opportunities.jsx
│  │  │  ├─ OpportunityDetail.jsx
│  │  │  ├─ PostOpportunity.jsx
│  │  │  ├─ ProviderLogin.jsx
│  │  │  ├─ ProviderRegistration.jsx
│  │  │  ├─ QualificationDetail.jsx
│  │  │  ├─ Qualifications.jsx
│  │  │  ├─ StudentDashboard.jsx
│  │  │  ├─ ValidationPipeline.jsx
│  │  │  └─ ViewStudentProfile.jsx
│  │  ├─ routes
│  │  │  └─ protectedRoute.jsx
│  │  ├─ services
│  │  │  ├─ adminService.js
│  │  │  ├─ authService.js
│  │  │  ├─ employerApplicationService.js
│  │  │  ├─ myApplicationService.js
│  │  │  └─ opportunityService.js
│  │  ├─ setupTests.js
│  │  └─ tests
│  │     ├─ api.test.js
│  │     ├─ authService.test.js
│  │     ├─ CreateStudentProfile.test.jsx
│  │     ├─ editProfileForm.test.jsx
│  │     ├─ EmployerApplicationCard.test.jsx
│  │     ├─ EmployerApplications.test.jsx
│  │     ├─ employerApplicationService.test.js
│  │     ├─ myApplicationCard.test.jsx
│  │     ├─ MyApplications.test.jsx
│  │     ├─ notificationDropdown.test.jsx
│  │     ├─ Opportunities.test.jsx
│  │     ├─ OpportunityCard.test.jsx
│  │     ├─ OpportunityDetail.test.jsx
│  │     ├─ OpportunityForm.test.jsx
│  │     ├─ opportunityService.test.js
│  │     ├─ PostOpportunity.test.jsx
│  │     ├─ profileForm.test.jsx
│  │     ├─ ProviderLogin.test.jsx
│  │     ├─ ProviderRegistration.test.jsx
│  │     ├─ Qualifications.test.jsx
│  │     └─ ValidationPipeline.test.jsx
│  ├─ tailwind.config.js
│  └─ vite.config.js
├─ package-lock.json
├─ package.json
└─ README.md

```