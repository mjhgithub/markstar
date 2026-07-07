## ADDED Requirements

## MODIFIED Requirements

### Requirement: Conflict detection via dependency:tree
The system SHALL detect Maven dependency version conflicts by invoking the Maven built-in `dependency:tree` command. The system SHALL first attempt `mvn dependency:tree -Dverbose` (compatible with maven-dependency-plugin 2.x). If that fails or produces no conflict markers, the system SHALL fall back to `mvn dependency:tree` (for 3.x where `-Dverbose` was removed). The system SHALL parse the text output to identify all version conflicts, transitive dependency paths, and the `omitted for conflict` / `version managed from` markers.

#### Scenario: Run conflict detection successfully
- **WHEN** user runs `/maven-pilot check` in a Maven project root directory
- **THEN** the system SHALL invoke pilot and produce a structured conflict report listing each conflict with groupId:artifactId, conflicting versions, and dependency paths

#### Scenario: No conflicts found
- **WHEN** the pilot report shows no conflicts
- **THEN** the system SHALL report "No dependency conflicts found"

#### Scenario: Maven or pom.xml not found
- **WHEN** the current directory or its parent directories do not contain a `pom.xml`
- **THEN** the system SHALL output "No pom.xml found in current project" and stop

### Requirement: AI-powered conflict analysis
The system SHALL analyze each detected conflict and provide:
- Version comparison and compatibility risk assessment
- Recommended version with rationale (considering the project's framework context)
- Transitive dependency source explanation in natural language

#### Scenario: AI explains a conflict
- **WHEN** pilot reports a version conflict for a dependency
- **THEN** the system SHALL output for each conflict: what versions are in conflict, which artifact introduced each version (the full dependency path), which version is recommended and why

### Requirement: Default entry point (no args)
When the user invokes `/maven-pilot` with no arguments, the system SHALL perform detection first, then automatically proceed to the AI analysis and recommendation stage. It SHALL NOT skip to fix without user confirmation.

#### Scenario: Default entry detects and analyzes
- **WHEN** user runs `/maven-pilot` with no arguments in a Maven project
- **THEN** the system SHALL detect conflicts, analyze them, and present the analysis with suggested fixes, then wait for user response

### Requirement: Natural language entry point
When the user invokes `/maven-pilot <natural language text>` (not `check` or `fix`), the system SHALL interpret the user's intent from the natural language text and route to the appropriate action (check, fix, explain a specific conflict, skip a dependency, etc.).

#### Scenario: User asks to check with natural language
- **WHEN** user runs `/maven-pilot 检查一下依赖冲突`
- **THEN** the system SHALL recognize the intent as "check" and run conflict detection

#### Scenario: User asks to fix with natural language
- **WHEN** user runs `/maven-pilot 帮我修一下`
- **THEN** the system SHALL recognize the intent as "fix" and run detection + fix flow

#### Scenario: User asks to skip a specific conflict
- **WHEN** user runs `/maven-pilot 跳过 guava`
- **THEN** the system SHALL understand the user wants to exclude `guava` from fixes

#### Scenario: Exact subcommand match takes priority
- **WHEN** user runs `/maven-pilot check`
- **THEN** the system SHALL treat this as exact subcommand match, not natural language, and run `check` mode (detection only, no fix)
