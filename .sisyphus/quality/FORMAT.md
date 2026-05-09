# Quality Log Format

品質ログは各フェーズの品質データを集約する。

## ログエントリ形式

ファイル名: `quality-{YYYY-MM-DD}-{issue-number}.json`

```json
{
  "timestamp": "ISO-8601",
  "issue_number": "N",
  "phase": "vibe-wall-hit | structured-execution | review-complete",
  "deviations": {
    "major": 0,
    "minor": 0,
    "types": []
  },
  "affected_reqs": [],
  "action_taken": "proceed | partial-rollback | full-rollback",
  "notes": "free text"
}
```

## 記録タイミング
- spec-compliance 実行時（②構造的実行フェーズ完了時）
- レビューNG検出時（③レビュー完了フェーズ）
