# Specifications Index

SPEC files are canonical documents for the current architecture (REQ-0035-006).
They describe what the system *is* now, as opposed to REQ files that define what it *should be*.

## SPEC Files

| SPEC | タイトル | 責務 |
|------|---------|------|
| [system.md](system.md) | システム仕様 | コマンドシステムの構成定義・運用モデル |
| [patterns.md](patterns.md) | 実装パターン | コード規約と実装パターン |
| [quality-specs.md](quality-specs.md) | 品質仕様 | 品質基準・検証ルール |

## Document Relationships (REQ-0035-007)

```
REQ (requirements/REQ-*.md)    -- 要件定義（what should be）
  |
  v
ADR (adr/ADR-*.md)            -- アーキテクチャ決定記録（why）
  |
  v
SPEC (specs/*.md)              -- 現在アーキテクチャ基準（what is）
  |
  v
DOC-MAP (DOC-MAP.md)           -- 文書探索入口（参照用・分類索引）
```

- **REQ** files define requirements. They are the source of truth for what the system must satisfy.
- **ADR** files record architectural decisions and their rationale.
- **SPEC** files describe the current architecture as implemented. They are canonical for "how it works now."
- **DOC-MAP** is a non-canonical navigation index. It does not replace any REQ, ADR, or SPEC.
