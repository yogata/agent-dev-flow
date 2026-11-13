<#
.SYNOPSIS
    Distribution exclusion canon for the consumer distribution paths.

.DESCRIPTION
    Single-source definition (canon) of the assets excluded from consumer
    distribution: the repo-local plugin names. The consumer distribution
    entries resolve their exclusion set from this module by dot-sourcing it,
    so every entry derives the same exclusion set from one definition:

    - scripts/install.ps1 (checkout consumer install)
    - scripts/self-sync.ps1 (references this canon as the documented
      exception basis; it intentionally does NOT apply the exclusion,
      because the self-host projection keeps repo-local plugins)
    - scripts/self/release/package-release-archive.ps1 (release archive
      staging filter; also stages this file into the archive)
    - scripts/consumer/archive/install.ps1 (archive install; reads the copy
      staged inside the release archive, or the repository original when
      run from the repository checkout)

    The audit-side expectations (trusted-distribution-gate manifest, the
    trust-root protected paths) are defined independently of this canon and
    must never be derived from it.

    Encoding contract: this file is intentionally pure ASCII (every byte
    <= 0x7F). The archive installer runs under Windows PowerShell 5.1,
    which decodes BOM-less UTF-8 as ANSI; non-ASCII bytes would corrupt
    under that host. Keep comments and values ASCII-only.
#>

# Repo-local plugin names excluded from consumer distribution.
# The set is a single fixed name; additions are prohibited without a
# repository design contract update (consistency tests pin this set).
$RepoLocalPluginNames = @('agentdev-distribution-boundary-guard')
