# Applicant Load More and Detail Modal

## Purpose
- Support paged applicant loading on the client project detail screen.

## Behavior
- Load first 2 applicants on initial open.
- Load the next 2 on each click.
- Stop showing the button when `hasNext` is false.

## Detail View
- Open applicant detail from each row.
- Fetch detail data on demand.
- Clear selected state when the modal closes.
