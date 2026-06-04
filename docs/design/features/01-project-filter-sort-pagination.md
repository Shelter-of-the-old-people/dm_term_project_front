# Project Filter, Sort, and Pagination

## Purpose
- Control project list conditions at the page level.

## Supported Inputs
- Project type
- Sort option
- Page number

## Rules
- Reset page to 1 when type changes.
- Reset page to 1 when sort changes.
- Request a new backend response whenever conditions change.

## Exclusions
- No region filter
- No participation-part category filter
- No frontend-only sorting in the final implementation
