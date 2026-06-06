# PPT Memo Clarifications

## Why This Exists
- The latest PPT file and its speaker notes clarified several points that were easy to misread from screenshots alone.
- This file records the final frontend interpretation we should follow while implementing pages and routes.

## Final Frontend Interpretation
- In this project, `landing page` means the `project search / project list page`.
- It does **not** mean the real Freemoa marketing home.
- Because of that, the main evaluated entry screen should be the project page.
- The old hero-based marketing page can still exist, but only as a preserved reference route.

- The first screen for both roles is the same project page.
- Role-specific behavior begins from the top `mypage` entry and the authenticated screens after that.

## Project Page Rules
- Project type filter, sorting, and pagination must all be handled by server re-requests.
- Do not treat client-side array sorting as final behavior.
- Landing project list page size is fixed to `4`.
- The evaluated mental model is closer to `m4/s41` than to the real Freemoa main home.

## Detail and Application Rules
- Project detail only needs a summary-focused screen.
- Complex tab UI is optional.
- Application form interpretation stays:
  - outsourcing / 도급: `작업기간`, `지원 금액`, `지원 내용`
  - resident / 상주: `기술구분`, `연차구분`, `인원수`, `임금`, `지원 내용`
- Contact information detection inside application content is mandatory.

## Profile Image Rule
- Uploaded profile images must not live as baked-in frontend assets.
- The browser uploads the file with `multipart/form-data`.
- The backend stores the actual file in a server-side folder.
- The database stores only the returned file path / URL string.
- The frontend must render the image using that backend-returned path.

## Client Applicant List Rule
- Client-side project detail must include applicant `load more`.
- Page size is fixed to `2`.
- When no more data exists, the button should be hidden or disabled.
