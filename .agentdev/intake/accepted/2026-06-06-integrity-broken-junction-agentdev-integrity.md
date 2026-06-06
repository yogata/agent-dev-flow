# agentdev-integrity broken junction（obsolete-structure）

## 観測
integrity-check により、`.opencode/skills/agentdev-integrity/` が junction として存在するが、リンク先 `src/opencode/skills/agentdev-integrity/` が存在しないことを検出:

- `.opencode/skills/agentdev-integrity/` → junction（実体なし）
- リンク先 `src/opencode/skills/agentdev-integrity/` はディレクトリとして存在しない
- SKILL.md が読めず、実体ファイルが一切ない
- 他 20 ディレクトリは `src/opencode/skills/` への正常な junction
- `repo-agentdev-integrity` のみ repo-local（正常）

namespace 分割（commit `e32b935 feat: separate integrity-check into /repo/* namespace (#611)`）時に `agentdev-integrity` から `repo-agentdev-integrity` へ移行した残骸と推定。

## 今回扱わない理由
integrity-check の読み取り専用制約により、検出のみを実施。

## 影響
- junction が壊れた状態で残存し、`glob` や `Get-ChildItem` でエラーが発生する
- agent 実行時に当該パスへアクセスすると OS error 2 で失敗する
- `agentdev-integrity` は既に `repo-agentdev-integrity` に機能移行済み

## レビューで決めること
- 壊れた junction `.opencode/skills/agentdev-integrity` を削除するだけでよいか
- ソース側 `src/opencode/skills/agentdev-integrity` にも残骸がないか確認が必要か

## 根拠
- integrity-check カテゴリ: Skill frontmatter & 構造
- 分類: `obsolete-structure`
- ルート: `intake+learning`
- 検出元: `.agentdev/integrity/reports/2026-06-06-integrity-report.md`