# Requirement Baseline

## Scope
- The frontend must support both `developer` and `client` roles.
- The landing page is the common entry page for both roles.
- The final product must be a SPA rendered on the client side.

## Required Screens
- Login page
- Landing / project list page
- Developer mypage
  - Profile management
  - Application history
- Project detail and application page
- Client mypage
  - Project creation
  - Project management

## Excluded Items
- Region search filter
- Participation-part filter
- Portfolio upload in the application form
- Work instruction document
- Client profile page
- Complex application status tabs such as meeting/contract states

## Developer Flow
1. Log in.
2. Browse projects from the landing page.
3. Open a project detail page.
4. Submit an outsourcing or onsite application.
5. Check submitted applications from developer mypage.
6. Update profile and profile image.

## Client Flow
1. Log in.
2. Create a project.
3. Open the client project list.
4. Check a project summary and applicant list.
5. Load more applicants in pages of 2.
6. Open an applicant detail view.

## Evaluation-sensitive Rules
- Project type, sort option, and page changes must trigger a new backend request.
- Project list page size is 4.
- Applicant list load-more page size is 2.
- Profile image must come from server upload, not from frontend static assets.
- Application forms must branch by project type.
- Email and phone number blocking errors must be shown clearly to the user.
