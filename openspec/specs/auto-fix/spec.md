# auto-fix Specification

## Purpose
TBD - created by archiving change maven-pilot. Update Purpose after archive.
## Requirements
### Requirement: Fix all conflicts with AI recommendations
When the user invokes `/maven-pilot fix` or explicitly asks to fix, the system SHALL run conflict detection, apply AI-recommended fixes for ALL detected conflicts, and modify the `pom.xml` accordingly. The system SHALL present a diff preview to the user before applying changes, and only apply after user confirmation.

#### Scenario: Fix all conflicts with user confirmation
- **WHEN** user runs `/maven-pilot fix` in a Maven project with 3 detected conflicts
- **THEN** the system SHALL: (1) run detection, (2) produce AI analysis for each conflict, (3) generate the pom.xml modifications as a unified diff, (4) present the diff to the user, (5) wait for explicit user confirmation, (6) apply the changes to pom.xml only after confirmation

#### Scenario: Fix with no conflicts
- **WHEN** user runs `/maven-pilot fix` and no conflicts are detected
- **THEN** the system SHALL output "No dependency conflicts found, nothing to fix"

#### Scenario: User cancels fix after diff preview
- **WHEN** the diff preview is shown and user says "no" / "取消" / "不要修"
- **THEN** the system SHALL NOT apply any changes to pom.xml and report "Fix cancelled"

### Requirement: Diff preview before applying
Before modifying any user's `pom.xml`, the system SHALL generate and display the exact changes as a unified diff. The diff SHALL show each exclusion or version management change separately so the user can understand what will change and why.

#### Scenario: Diff preview with multiple changes
- **WHEN** there are 2 conflicts to fix
- **THEN** the diff SHALL show both modifications clearly in the diff output, each marked with its corresponding conflict number for traceability

### Requirement: pom.xml modification
The system SHALL modify the project's `pom.xml` to resolve conflicts by:
- Adding `<dependencyManagement>` entries with `<exclusion>` for transitive dependency conflicts
- Setting explicit versions in `<properties>` when applicable

The system SHALL NOT modify the code of the project outside of pom.xml.

#### Scenario: Add dependencyManagement entry
- **WHEN** a conflict is resolved by pinning a version
- **THEN** the system SHALL add or update the `<dependencyManagement>` section in pom.xml with the selected version

#### Scenario: Add exclusion for transitive dependency
- **WHEN** a conflict is resolved by excluding a transitive dependency
- **THEN** the system SHALL add `<exclusion>` entries to the appropriate `<dependency>` in pom.xml

