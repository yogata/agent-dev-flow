# docs 配下の旧 agentdev-gh-cli 記述残存の更新候補（OU-004 マージ後）

## 観測

PR 2435（Issue 2431、OU-004）で agentdev-gh-cli スキルを解消し GitHub I/O を Custom Tool `agentdev_gh` へ完全移管したが、docs/ 配下には旧スキル時代の記述が残存する。編集禁止範囲（docs/designs、docs/guides、docs/decisions、docs/requirements）のため本 Case では未対応。

残存箇所:

- `docs/designs/skills/agentdev-gh-cli.md`（スキル Design 本体。docs/designs/README.md の skill Design 一覧にも accepted 行が残存）
- `docs/designs/local/runtime-package-boundary.md` の link mode 接続表（`skills/agentdev-gh-cli` 差し替えの旧記述）
- `docs/guides/consumer-project-setup.md`、`docs/guides/glossary.md`、`docs/guides/troubleshooting.md`
- `docs/designs/integrity/rules/IR-047/IR-053` の関連節
- DEC-004/DEC-012 の関連節
- REQ-009/REQ-011 の一部行（REQ-011-008「上位 command/skill は常に agentdev-gh-cli のみを参照」は Tool 参照への文言更新候補）

## 今回扱わない理由

docs/ の正規成果物更新は case-close の編集範囲（Design status 昇格のみ）の外側。design-save または docs 整理 Case での対応が正規の手順。

## 影響

配布物は Tool 参照へ切替済みで実挙動への影響なし。docs の記述が実装と乖離した状態で残り、読者に旧境界（スキル I/O 正規経路）が実在すると誤認させる。

## レビューで決めること

- スキル Design `agentdev-gh-cli.md` の扱い（廃止・retire 表記・custom-tool-contracts Design への統合のいずれか）
- REQ-011-008 の文言更新（Tool 参照へ）
- 更新対象の優先順位と担当 Case の区分

## 根拠

- PR 2435 本文「Findings / Capture候補 > intake」item 1
- Issue 2431 対応記録コメント（case-close、Design確定の節）
