# 参照パス不存在・リンク切れ（reference/template/broken-link）

## 観測
integrity-check により、参照先が存在しないファイルパス・リンクが合計10件検出された:

**NG - 参照パス不存在（8件）:**

| 参照元ファイル | 行 | 不在パス |
|--------------|-----|---------|
| `.opencode/commands/agentdev/case-close.md` | 34, 41, 55, 64 | `references/git-common-procedures.md` |
| `.opencode/commands/agentdev/case-close.md` | 61 | `references/capture-boundaries.md` |
| `.opencode/commands/agentdev/case-run.md` | 143 | `references/capture-boundaries.md` |
| `.opencode/commands/agentdev/integrity-check.md` | 34 | `references/git-common-procedures.md` |
| `.opencode/commands/agentdev/req-define.md` | 40 | `templates/doc_requirement.md` |

**NG - リンク切れ（2件）:**

| 参照元ファイル | 不在リンク先 |
|--------------|------------|
| `docs/requirements/REQ-0108.md` | `REQ-NNNN.md`（プレースホルダ） |
| `docs/specs/system.md` | `../../.opencode/skills/agentdev-workflow-lifecycle/references/capture-boundaries.md` |

## 今回扱わない理由
integrity-check の読み取り専用制約により、検出のみを実施。

## 影響
- command 定義が存在しない reference を参照しており、agent 実行時に誤動作・情報欠落の可能性
- `git-common-procedures.md` と `capture-boundaries.md` は複数 command から参照される重要ファイル

## レビューで決めること
- `references/git-common-procedures.md` を新規作成するか、参照元 command を修正するか
- `references/capture-boundaries.md` の実体はどの skill に配置すべきか
- `templates/doc_requirement.md` を作成するか参照を削除するか
- `REQ-NNNN.md` プレースホルダリンクの処置

## 根拠
- integrity-check カテゴリ: ReferencePath / reference-path-existence, LinkIntegrity / broken-file-link
- 分類: `broken-reference`
- ルート: `intake`
- 検出元: `.agentdev/integrity/reports/2026-06-04-integrity-report.md`
