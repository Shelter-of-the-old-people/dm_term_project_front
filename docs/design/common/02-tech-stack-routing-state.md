# Tech Stack, Routing, and State

## Stack
- React 19
- TypeScript
- Vite
- Tailwind CSS 4

## Routing Direction
- A routing layer is required for the final implementation.
- Recommended paths:
  - `/login`
  - `/signup`
  - `/projects`
  - `/projects/:projectId`
  - `/mypage/developer/profile`
  - `/mypage/developer/applications`
  - `/mypage/client/projects/new`
  - `/mypage/client/projects`
  - `/mypage/client/projects/:projectId`

## State Direction
- Use local state and feature hooks first.
- Keep filter, sort, and page state close to the project list page.
- Session user information should be loaded from `GET /api/auth/me`.
- Form submission state should be isolated per page.

## Session Rules
- Do not store JWT.
- All authenticated requests must use cookie-based session handling.
- Redirect or block protected pages when the session is missing.

## Current Gap
- The current prototype is still mostly a single-page clone.
- The route map above is the target structure that should replace the current prototype-only navigation.
