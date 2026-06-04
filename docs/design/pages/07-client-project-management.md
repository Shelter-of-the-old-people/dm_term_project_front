# Client Project Management Page

## Purpose
- Let the client review created projects and applicant information.

## Project List
- Project title
- Budget label
- Contract type
- Applicant count
- Deadline
- D-day
- Detail action

## Detail View
- Request summary
- Applicant list
- Load-more button
- Applicant detail modal or side panel

## Applicant List Rules
- Initial size: 2
- Append 2 more on each load-more action
- Hide or disable the button when no next page exists

## APIs
- `GET /api/client/projects`
- `GET /api/client/projects/{projectId}`
- `GET /api/client/projects/{projectId}/applicants`
- `GET /api/client/applications/{applicationId}`
