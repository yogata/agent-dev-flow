#!/usr/bin/env pwsh
# AgentDevFlow git hooks setup (Windows / PowerShell 7+) — REQ-0136-008.
#
# Enables Delta Guard (pre-commit) and Impact Guard (pre-push) by pointing
# git's core.hooksPath at the repo-local .githooks directory. Idempotent.
#
# Usage:
#   ./setup-hooks.ps1              # enable (default)
#   ./setup-hooks.ps1 -Action disable
#   ./setup-hooks.ps1 -Action status
#
# This script only touches core.hooksPath; it does not modify hook contents.

[CmdletBinding()]
param(
    [ValidateSet('enable', 'disable', 'status')]
    [string]$Action = 'enable'
)

$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path (git rev-parse --show-toplevel 2>$null)
if (-not $repoRoot) {
    throw "Could not determine git repo root. Run from inside a git repository."
}
$hooksDir = Join-Path $repoRoot '.githooks'

function Get-HooksPath { (git config core.hooksPath 2>$null) -as [string] }
function Set-HooksPath([string]$value) { git config core.hooksPath $value }
function Clear-HooksPath { git config --unset core.hooksPath 2>$null; $global:LASTEXITCODE = 0 }

switch ($Action) {
    'status' {
        $current = Get-HooksPath
        if ($current -eq '.githooks') {
            Write-Output "hooks: ENABLED (core.hooksPath=.githooks)"
        } elseif ($current) {
            Write-Output "hooks: custom core.hooksPath='$current' (not the default .githooks)"
        } else {
            Write-Output "hooks: DISABLED (using git default .git/hooks)"
        }
    }
    'disable' {
        Clear-HooksPath
        Write-Output "hooks: DISABLED (core.hooksPath unset; git will use .git/hooks)"
    }
    'enable' {
        if (-not (Test-Path -LiteralPath (Join-Path $hooksDir 'pre-commit'))) {
            throw "pre-commit hook not found at $hooksDir. Ensure .githooks/ is checked out."
        }
        Set-HooksPath '.githooks'
        Write-Output "hooks: ENABLED (core.hooksPath=.githooks)"
        Write-Output "  - pre-commit  : Delta Guard (REQ-0136-004)"
        Write-Output "  - pre-push    : Impact Guard (REQ-0136-005)"
        Write-Output "Bypass a single commit/push with: DEVFLOW_SKIP_HOOKS=1"
    }
}
