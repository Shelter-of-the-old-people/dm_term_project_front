# Frontend Docs

## Purpose
- This folder keeps the frontend implementation references for the Freemoa term project.
- The main use is to align the actual UI work with the PPT requirements, the Freemoa reference captures, and the latest speaker-note clarifications.

## Main Documents
- [TERM_PROJECT_FRONTEND_DESIGN.md](./TERM_PROJECT_FRONTEND_DESIGN.md)
- [FREEMOA_UI_REFERENCE.md](./FREEMOA_UI_REFERENCE.md)
- [PPT_NOTE_CLARIFICATIONS.md](./PPT_NOTE_CLARIFICATIONS.md)

## Current Implementation Notes
- The evaluated `landing page` is the `project search / project list` screen.
- The current frontend keeps that screen as the main entry at `/`.
- The old marketing-style home is preserved as a secondary reference route at `/home`.
- Freemoa-style paths are also supported for the project flow:
  - `/m4/s41?page=1`
  - `/m4/s41v?projectId=...`
  - `/m0/s02`
  - `/m0/jointype`
  - `/m4/regProject`

## Important Rules
- Filter, sort, and pagination on the landing/project list must all be handled by server re-requests.
- Profile image upload must use `multipart/form-data`.
- The uploaded file lives on the backend filesystem, and the database stores only its path string.
- Client applicant lists use `load more` with page size `2`.
