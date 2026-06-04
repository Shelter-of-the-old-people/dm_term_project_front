# Auth Page Design

## Purpose
- Provide a minimal login entry point for the project demo.
- Keep signup optional, because the assignment allows pre-created accounts.

## UI Structure
- Login form
  - Login ID
  - Password
  - Submit button
- Link or tab for signup
- Optional note about demo accounts

## Interaction
- Successful login should load the current session user and move to the landing page.
- Failed login should show an inline or toast error.
- Logout should clear the session and return to a public page.

## Optional Signup
- Role selection
- Login ID
- Password
- Nickname

## Edge Cases
- Duplicate login ID
- Wrong password
- Expired session
