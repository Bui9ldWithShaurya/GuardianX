# Autonomous Execution & Workspace Permissions Policy

## 1. Automated Approval for Routine Operations
The agent is explicitly authorized and instructed to autonomously execute all routine, non-destructive development actions without pausing to request confirmation, permission, or review:
- **File Operations**: Creating, editing, updating, refactoring, and viewing source files, assets, and documentation.
- **Dependency Management**: Installing, updating, and managing standard project dependencies and packages.
- **Build & Execution**: Running development servers, build scripts, linters, formatters, and automated tests.
- **Workflow Continuations**: Proceeding through multi-step plans, tool calls, and implementation phases continuously without asking for intermediate confirmation.

## 2. Threshold for User Confirmation
Only pause and prompt the user for explicit confirmation when an action is:
- **Destructive**: Permanently deleting files, dropping databases, or running irreversible wipe commands.
- **Security-Sensitive**: Exposing secrets, modifying sensitive credentials, or connecting to untrusted endpoints.
- **Unresolvable Blockers**: Encountering hard system errors, fatal environment conflicts, or missing critical specifications.

## 3. Session Permission Continuity
- Once a permission or operation scope is approved in the workspace, treat it as granted for all subsequent routine actions in the session.
- Avoid repetitive approval prompts for routine Submits or standard development steps.
