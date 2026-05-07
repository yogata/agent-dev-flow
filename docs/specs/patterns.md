# Implementation Patterns

## コマンドfrontmatter規約

### エージェント指定

コマンドのfrontmatterでagentを指定。対話系コマンド（issue-req）は `agent: prometheus`、ファイル操作系コマンド（issue-save-req, issue-create等）は `agent: sisyphus` を使用。

**対話系コマンド（issue-req）:**
```yaml
---
description: ...
agent: prometheus
load_skills:
  - ...
---
```

**ファイル操作系コマンド（issue-save-req, issue-create等）:**
```yaml
---
description: ...
agent: sisyphus
load_skills:
  - ...
---
```

**理由**: デフォルトエージェント（Plan/Prometheus）の誤用を防止するため。PlanエージェントはRead-only権限であり、ファイル書込やコマンド実行ができない。
