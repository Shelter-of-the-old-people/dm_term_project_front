# Frontend Design Document Index

## Goal
- This folder defines the target frontend structure for the term-project SPA.
- Documents are split into common rules, page designs, and reusable feature designs.
- These documents describe the intended implementation, not only the current prototype state.

## Common
- [Requirement Baseline](./common/01-requirement-baseline.md)
- [Tech Stack, Routing, and State](./common/02-tech-stack-routing-state.md)
- [API Contract and UI Rules](./common/03-api-contract-and-ui-rules.md)

## Pages
- [Auth Page](./pages/01-auth.md)
- [Landing and Project Search](./pages/02-landing-project-search.md)
- [Developer Profile Management](./pages/03-developer-profile-management.md)
- [Developer Application History](./pages/04-developer-application-history.md)
- [Project Detail and Application](./pages/05-project-detail-and-application.md)
- [Client Project Create](./pages/06-client-project-create.md)
- [Client Project Management](./pages/07-client-project-management.md)

## Features
- [Project Filter, Sort, and Pagination](./features/01-project-filter-sort-pagination.md)
- [Profile Image and Tag Editor](./features/02-profile-image-and-tag-editor.md)
- [Application Form and Contact Blocking](./features/03-application-form-and-contact-block.md)
- [Applicant Load More and Detail Modal](./features/04-applicant-load-more-and-modal.md)

## Notes
- All authenticated requests use session cookies with `credentials: include`.
- The final project list must come from the backend.
- Category filters excluded by the assignment should not be kept in the final UI.
