# Intake Item: artifact-responsibilities SPEC「重複許容基準」適用例の SPEC 本文への追記検討

## 発生源

- PR: #1535 (Issue #1533 / OU-002, direct_case)
- 発生 phase: case-close SPEC 確定候補分析 (Step 3-2)
- capture 分類: intake (具体的修正対象 = SPEC 本文)

## 問題

`src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md`「重複許容例外（artifact-responsibilities SPEC）」セクションで、重複許容基準の具体的な適用フロー（合致性確認、正の情報源明示確認、差分記述確認）を記述した。一方、参照元である artifact-responsibilities SPEC 側には同等の適用例が未記載で、references 側にのみ運用ビューが存在する状態。

SPEC 側に適用例がない場合、今後同種の「重複許容基準」判定が必要な配布物（agentdev-project-extensions boilerplate、複数 command 間の同一公開契約宣言等）が増えた際、都度 references を横断して適用フローを参照する必要がある。

## 推奨修正対象

`docs/specs/responsibilities/artifact-responsibilities.md`（重複許容基準セクション）へ:

1. 重複許容基準の具体的適用フロー（合致性確認、正の情報源明示確認、差分記述確認）を追記
2. 適用例として `semantic-diagnostic-perspectives.md` への参照を明示
3. references 側は SPEC への差分参照に縮約可能（REQ-0119-034 例外基準の単一情報源化）

## 関連

- SPEC: docs/specs/responsibilities/artifact-responsibilities.md
- references: src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md (L146-154)
- Issue: #1533 (CLOSED)
- PR: #1535 (SPEC確定候補セクション、merge 1c10ad2)
- REQ: REQ-0119-034 (同一契約再定義抑止の原則)
- 類似: intake-2026-07-17-project-extensions-boilerplate-duplication-allowance.md (#1532 由来の同種知見)
