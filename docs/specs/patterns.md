# Implementation Patterns

## コマンドfrontmatter規約

### エージェント指定

全てのissue-*コマンドはfrontmatterに `agent: build` を明記する。

```yaml
---
description: ...
agent: build
load_skills:
  - ...
---
```

**理由**: デフォルトエージェント（Plan/Prometheus）の誤用を防止するため。PlanエージェントはRead-only権限であり、ファイル書込やコマンド実行ができない。
