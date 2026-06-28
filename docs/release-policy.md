# Release Policy

## Versioning Standard

The project follows Semantic Versioning:

- MAJOR: incompatible API or behavior changes
- MINOR: backward-compatible feature additions
- PATCH: backward-compatible bug fixes

Version format: `MAJOR.MINOR.PATCH` (example: `1.4.2`).

## Tagging Rules

1. Release tags must use `v` prefix (example: `v0.1.0`).
1. Tags must point to a commit with green CI.
1. Tags are immutable after publication.

## Branch and Release Flow

1. Feature work merges through pull requests.
1. Release candidate is cut from main branch after checklist completion.
1. Production release is tagged after smoke tests pass.

## Changelog Requirements

Each release entry must include:

- Release date
- Added/Changed/Fixed sections
- Key migration or deployment notes

## Compatibility and Migration

1. Database migrations must be reversible when feasible.
1. Breaking changes require explicit migration notes in changelog and API docs.
1. Any required client changes must be documented before release approval.

## Emergency Patch Process

1. Branch from latest stable tag.
1. Apply minimal fix.
1. Run targeted tests and smoke checks.
1. Release as PATCH version.
1. Back-merge into main branch.
