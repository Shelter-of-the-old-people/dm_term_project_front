# Landing and Project Search Page

## Purpose
- This is the common entry page for both roles.
- It shows the searchable project list and provides navigation into the rest of the app.

## Main Blocks
- Site header
- Project type filter
- Sort select
- Project list
- Pagination

## Supported Conditions
- Type: all / outsourcing / onsite
- Sort: default / latest / budget high / budget low / deadline soon
- Page: size 4

## Excluded Conditions
- Region search
- Participation-part filter

## Data Rules
- Each condition change must request fresh backend data.
- The frontend must not reorder the result locally in the final implementation.

## Card Data
- Title
- Outsourcing or onsite label
- Open or closed recruitment state
- Tech stack tags
- Budget or monthly pay label
- Expected duration
- Applicant count
- Deadline label

## Navigation
- Clicking a project card should move to the project detail page.
