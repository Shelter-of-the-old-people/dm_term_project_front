# API Contract and UI Rules

## Request Rules
- Base path: `/api`
- Use `credentials: include` for session cookie support.
- Use JSON for standard forms.
- Use `FormData` for profile image upload.

## Expected Main APIs
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/projects`
- `GET /api/projects/{projectId}`
- `POST /api/projects/{projectId}/applications`
- `GET /api/developer/profile`
- `PUT /api/developer/profile`
- `POST /api/developer/profile/image`
- `GET /api/developer/applications`
- `GET /api/developer/applications/{applicationId}`
- `POST /api/client/projects`
- `GET /api/client/projects`
- `GET /api/client/projects/{projectId}`
- `GET /api/client/projects/{projectId}/applicants`
- `GET /api/client/applications/{applicationId}`

## UI Rules
- Disable submit buttons while requests are in flight.
- Show backend validation messages to the user.
- Use empty states for empty lists.
- Hide role-incompatible menu items.
- Keep the project list UI driven by backend data rather than frontend sorting logic.

## Image Rules
- Use the image URL returned by the backend.
- A fallback avatar is allowed.
- Real profile images must not be hardcoded in source assets.
