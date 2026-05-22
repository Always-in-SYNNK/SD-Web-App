Before touching the project, you must have these installed globally:
Node.js

Clone the repo:
git clone <repo-url>
cd <repo-folder>

Install project dependencies:
npm install

To run backend and frontend at the same time:
npm run dev
click on the frontend link

File Structure down below:
```
SD1
├─ backend
│  ├─ debug_search_10.html
│  ├─ jest.config.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ scripts
│  │  └─ scrapeSaqua.js
│  ├─ src
│  │  ├─ app.js
│  │  ├─ config
│  │  │  ├─ googleAuth.js
│  │  │  └─ supabaseClient.js
│  │  ├─ controllers
│  │  │  ├─ adminController.js
│  │  │  ├─ analyticsController.js
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
│  │  │  ├─ preventSelfModeration.js
│  │  │  ├─ providerAuthMiddleware.js
│  │  │  ├─ requireAdmin.js
│  │  │  ├─ requireAuth.js
│  │  │  ├─ roleMiddleware.js
│  │  │  └─ uploadMiddleware.js
│  │  ├─ routes
│  │  │  ├─ adminRoutes.js
│  │  │  ├─ analyticsRoutes.js
│  │  │  ├─ applicantAuthRoutes.js
│  │  │  ├─ chatRoutes.js
│  │  │  ├─ employerApplicationRoutes.js
│  │  │  ├─ industryRoutes.js
│  │  │  ├─ myApplicationRoutes.js
│  │  │  ├─ notificationRoutes.js
│  │  │  ├─ opportunityRoutes.js
│  │  │  ├─ profileRoutes.js
│  │  │  ├─ providerAuthRoutes.js
│  │  │  └─ skillsRoutes.js
│  │  ├─ server.js
│  │  ├─ services
│  │  │  ├─ adminService.js
│  │  │  ├─ analyticsService.js
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
│     ├─ analyticsController.test.js
│     ├─ analyticsRoutes.test.js
│     ├─ analyticsService.test.js
│     ├─ applicantAuthRoutes.test.js
│     ├─ authController.test.js
│     ├─ authMiddleware.test.js
│     ├─ emailService.test.js
│     ├─ employerApplicationController.test.js
│     ├─ employerApplicationRoutes.test.js
│     ├─ employerApplicationService.test.js
│     ├─ errorHandler.test.js
│     ├─ myApplicationController.test.js
│     ├─ myApplicationRoutes.test.js
│     ├─ myApplicationService.test.js
│     ├─ notificationController.test.js
│     ├─ notificationRoutes.test.js
│     ├─ notificationService.test.js
│     ├─ opportunityController.test.js
│     ├─ opportunityRoutes.test.js
│     ├─ opportunityService.test.js
│     ├─ preventSelfModeration.test.js
│     ├─ profileController.test.js
│     ├─ profileRoutes.test.js
│     ├─ profileService.test.js
│     ├─ providerAuthMiddleware.test.js
│     ├─ providerAuthRoutes.test.js
│     ├─ reminderService.test.js
│     ├─ requireAdmin.test.js
│     ├─ requireAuth.test.js
│     ├─ roleMiddleware.test.js
│     ├─ skillsController.test.js
│     ├─ skillsRoutes.test.js
│     ├─ skillsService.test.js
│     └─ uploadMiddleware.test.js
├─ codecov.yml
├─ frontend
│  ├─ babel.config.cjs
│  ├─ coverage-run-output.txt
│  ├─ eslint.config.js
│  ├─ full-test-output.txt
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
│  │  │  ├─ analytics
│  │  │  │  ├─ ApplicationVolumeChart.jsx
│  │  │  │  ├─ OpportunityBreakdownTable.jsx
│  │  │  │  ├─ SectorBarChart.jsx
│  │  │  │  └─ SectorPieChart.jsx
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
│  │  │  ├─ chat
│  │  │  │  └─ AIChatWidget.jsx
│  │  │  ├─ common
│  │  │  │  └─ FloatingActionButton.jsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ ActivityItem.jsx
│  │  │  │  ├─ AnalyticsCard.jsx
│  │  │  │  ├─ CVCard.jsx
│  │  │  │  ├─ DashboardHeader.jsx
│  │  │  │  ├─ QualificationItem.jsx
│  │  │  │  ├─ QualificationList.jsx
│  │  │  │  ├─ Sidebar.jsx
│  │  │  │  ├─ UploadBanner.jsx
│  │  │  │  └─ VerificationCard.jsx
│  │  │  ├─ employer
│  │  │  │  ├─ EditProviderProfileForm.jsx
│  │  │  │  └─ EmployerApplicationCard.jsx
│  │  │  ├─ forms
│  │  │  │  └─ OpportunityForm.jsx
│  │  │  ├─ Hero.jsx
│  │  │  ├─ home
│  │  │  │  └─ SAMap.jsx
│  │  │  ├─ HowItWorks.jsx
│  │  │  ├─ layout
│  │  │  │  ├─ AdminTopbar.jsx
│  │  │  │  ├─ Sidebar.jsx
│  │  │  │  └─ Topbar.jsx
│  │  │  ├─ Navbar.jsx
│  │  │  ├─ notifications
│  │  │  │  ├─ notificationDropdown.jsx
│  │  │  │  └─ ProviderNotificationDropdown.jsx
│  │  │  ├─ opportunities
│  │  │  │  ├─ matchingOpportunity.jsx
│  │  │  │  ├─ OpportunityCard.jsx
│  │  │  │  ├─ OpportunityFilters.jsx
│  │  │  │  └─ OpportunityList.jsx
│  │  │  ├─ PortalCard.jsx
│  │  │  ├─ qualifications
│  │  │  │  ├─ QualificationCard.jsx
│  │  │  │  └─ QualificationFilters.jsx
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
│  │  │  ├─ AdminAnalytics.jsx
│  │  │  ├─ AdminConsole.jsx
│  │  │  ├─ AnalyticsPage.jsx
│  │  │  ├─ ApplicantLogin.jsx
│  │  │  ├─ AuthDenied.jsx
│  │  │  ├─ AuthError.jsx
│  │  │  ├─ CreateStudentProfile.jsx
│  │  │  ├─ EditProviderProfile.jsx
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
│  │  │  ├─ ViewProviderProfile.jsx
│  │  │  └─ ViewStudentProfile.jsx
│  │  ├─ routes
│  │  │  └─ protectedRoute.jsx
│  │  ├─ services
│  │  │  ├─ adminAnalyticsService.js
│  │  │  ├─ adminService.js
│  │  │  ├─ analyticsService.js
│  │  │  ├─ authService.js
│  │  │  ├─ countryService.js
│  │  │  ├─ employerApplicationService.js
│  │  │  ├─ exportService.js
│  │  │  ├─ matchingService.js
│  │  │  ├─ myApplicationService.js
│  │  │  ├─ opportunityService.js
│  │  │  └─ providerProfileService.js
│  │  ├─ setupTests.js
│  │  └─ tests
│  │     ├─ AdminAccessApplications.test.jsx
│  │     ├─ AdminAnalytics.test.jsx
│  │     ├─ adminAnalyticsService.test.js
│  │     ├─ AdminSection.test.jsx
│  │     ├─ adminService.test.js
│  │     ├─ AdminTopbar.test.jsx
│  │     ├─ AIChatWidget.test.jsx
│  │     ├─ analyticsService.test.js
│  │     ├─ api.test.js
│  │     ├─ ApplicationVolumeChart.test.jsx
│  │     ├─ authDenied.test.jsx
│  │     ├─ authError.test.jsx
│  │     ├─ AuthFormPanel.test.jsx
│  │     ├─ AuthHeroPanel.test.jsx
│  │     ├─ AuthLayout.test.jsx
│  │     ├─ authService.test.js
│  │     ├─ connectivity.test.jsx
│  │     ├─ countryService.test.js
│  │     ├─ CreateStudentProfile.test.jsx
│  │     ├─ cvUpload.test.jsx
│  │     ├─ Dashboard.test.jsx
│  │     ├─ editProfileForm.test.jsx
│  │     ├─ EditProviderProfile.test.jsx
│  │     ├─ EditProviderProfileForm.test.jsx
│  │     ├─ EmployerApplicationCard.test.jsx
│  │     ├─ EmployerApplications.test.jsx
│  │     ├─ employerApplicationService.test.js
│  │     ├─ exportService.test.js
│  │     ├─ FloatingActionButton.test.jsx
│  │     ├─ GoogleLoginButton.test.jsx
│  │     ├─ Home.test.jsx
│  │     ├─ matchingOpportunity.test.jsx
│  │     ├─ matchingService.test.js
│  │     ├─ myApplicationCard.test.jsx
│  │     ├─ MyApplications.test.jsx
│  │     ├─ myApplicationService.test.js
│  │     ├─ notificationDropdown.test.jsx
│  │     ├─ Notifications.test.jsx
│  │     ├─ Opportunities.test.jsx
│  │     ├─ OpportunitiesTable.test.jsx
│  │     ├─ OpportunityBreakdownTable.test.jsx
│  │     ├─ OpportunityCard.test.jsx
│  │     ├─ OpportunityDetail.test.jsx
│  │     ├─ OpportunityFilters.test.jsx
│  │     ├─ OpportunityForm.test.jsx
│  │     ├─ OpportunityList.test.jsx
│  │     ├─ OpportunityRow.test.jsx
│  │     ├─ opportunityService.test.js
│  │     ├─ PersonalInfo.test.jsx
│  │     ├─ PostOpportunity.test.jsx
│  │     ├─ profileForm.test.jsx
│  │     ├─ protectedRoute.test.jsx
│  │     ├─ ProviderGoogleLoginButton.test.jsx
│  │     ├─ ProviderLogin.test.jsx
│  │     ├─ providerProfileService.test.js
│  │     ├─ ProviderRegistration.test.jsx
│  │     ├─ QualificationCard.test.jsx
│  │     ├─ QualificationFilters.test.jsx
│  │     ├─ QualificationList.test.jsx
│  │     ├─ Qualifications.test.jsx
│  │     ├─ SAMap.test.jsx
│  │     ├─ SectorBarChart.test.jsx
│  │     ├─ SectorPieChart.test.jsx
│  │     ├─ Sidebar.test.jsx
│  │     ├─ Skills.test.jsx
│  │     ├─ StatsGrid.test.jsx
│  │     ├─ StudentDashboard.test.jsx
│  │     ├─ TopBar.test.jsx
│  │     ├─ ValidationPipeline.test.jsx
│  │     └─ ViewProviderProfile.test.jsx
│  ├─ tailwind.config.js
│  ├─ test-output.txt
│  └─ vite.config.js
├─ package-lock.json
├─ package.json
└─ README.md

```
