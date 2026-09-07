# inspect-docs promoted 20260907T012032Z（promote 採用分）

> 本ファイルは inspect-promote（2026-09-07 実施、/agentdev/backlog-auto stage 2 inspect 系統経由、--auto なし）の分類確定後、promote となった検出事項のみを保存する。3件。
> 採用元 finding ファイルは `inspect-docs-finding-20260907T012032Z.md`。本 promoted 保存後に inbox 側から F-01〜F-03 を削除済み（F-04 defer 残置分のみ同ファイルに残置）。
> 旧 defer 残置分（20260822 F-05、20260901 F-08〜F-12/F-27/F-34 の8件）は各元ファイルに inbox 残置。旧 20260901 F-36 は reject・即時削除（却下理由は commit message 参照）。
> 判定根拠の詳細・証跡は各 finding の記載および adversarial-review 記録（2系統独立 stream、収束 convergence audit 完了）を参照。対象13件は全件自律確定（HITL 対象なし。workflow-contracts Design「promote系判断確定とHITL境界」詳細判定表に従い判定）。
> backlog-review との統合マーカーを各 finding に記載（intake promoted との二重修正の回避のため）。

## promote 一覧

### F-01: decisions/README.md の DEC-013 関連REQ行が retired REQ-028 へ現行パスのリンクを保持（medium/high）

- **対象**: docs/decisions/README.md:181（DEC-013 行。関連REQ表は AUTOGEN 管理外の手動管理領域）
- **根拠**: `[REQ-028](../requirements/REQ-028.md)` は実在しない `docs/requirements/REQ-028.md` を指す（実体は `docs/requirements/retired/REQ-028.md`。2026-09-07 実ファイル確認済み: 現行パス不存在・retired パス存在）。同行に (retired) 注記・後継併記がない。document-model.md「参照規則」（REQ-001-048）は廃止文書参照に (retired) 注記と現行後継の併記を要求。同一 README の DEC-007 行・DEC-017 行が retired パス + 注記の正規形であり、DEC-013 行のみ旧形
- **受け入れ条件**: 当該行を `../requirements/retired/REQ-028.md` へのリンク修正 +「retired、IR 存在条件契約は DEC-013 が移管受入れ」注記の追加（DEC-007/DEC-017 行と同形）
- **統合マーカー**: REQ-057 docs corpus 整合系統の docs リンク修正バッチ（F-02 と同一バッチ候補）。docs-check route 候補（decisions/README.md 関連REQ表の retired REQ 実パスリンク検査）は独立 route とせず本要件化方向の受け入れ条件に含める

### F-02: docs/designs 配下の相対リンク切れ 5件（medium/high）

- **対象**: docs/designs/integrity/rules/IR-060-forbidden-japanese-word-detection.md:35/:67/:68、docs/designs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md:131、docs/designs/quality/quality-gates.md:214
- **根拠**: IR-060:35/:67 は `../../../src/...`（docs/src に解決し不存在。正しくは `../../../../src/...`）、IR-060:68 は `../responsibilities/...`（docs/designs/integrity/responsibilities/ に解決し不存在。正しくは `../../responsibilities/...`）、IR-057:131 は `../obsolete-path-map.yaml`（docs/designs/integrity/ に解決し不存在。実体は `.opencode/skills/repo-agentdev-integrity/data/obsolete-path-map.yaml`）、quality-gates.md:214 は `../../src/...`（docs/src に解決し不存在。正しくは `../../../src/...`）。2026-09-07 実ファイル確認済み。IR-060:35/:67 の参照先（置換辞書）は IR-060 の forbidden 語リストの正であるため、切れたままでは検出基盤の正参照導線が不明になる
- **受け入れ条件**: 5リンクの相対深度・参照先を実ファイル配置へ修正（IR-057:131 は `.opencode/skills/repo-agentdev-integrity/data/obsolete-path-map.yaml` 実体への相対リンク）
- **統合マーカー**: F-01 と同一の docs リンク修正バッチ候補。docs-check route 候補（docs/designs 相対リンク実在検査の IR-062 対象拡張または新規ルール化）は独立 route とせず本要件化方向の受け入れ条件に含める

### F-03: 配布物本文中の REQ 行 ID 直接引用 9箇所（high/high）

- **対象**:（src/opencode/ 正本。.opencode/ 投影と内容同一、投影差分 0）
  - src/opencode/commands/agentdev/case-open.md:11（REQ-017-017）
  - src/opencode/commands/agentdev/case-run.md:43（REQ-017-017）
  - src/opencode/commands/agentdev/req-define.md:46（REQ-004-037）、:47（REQ-008-060）
  - src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md:65（REQ-017-017）
  - src/opencode/skills/agentdev-req-analysis/SKILL.md:34（REQ-004-037）
  - src/opencode/skills/agentdev-req-analysis/references/analysis-viewpoints.md:147（REQ-004-037）、:161（REQ-004-038）
  - src/opencode/skills/agentdev-workflow-case-open/references/issue-body-and-execution-contract.md:92（REQ-017-017）
- **根拠**: 文末出典括弧「（REQ-017-017）」等の形で内部 REQ 行 ID が配布物本文に残留。IR-059（distribution-reference-boundary、severity: strict）の検知対象であり、exemption（テンプレートプレースホルダー、検査対象path宣言、索引として許可された README 参照、generic/template 参照）のいずれにも該当しない。配布物利用者は docs/requirements を配布物内に持たず当該 ID を追跡する導線がない。case-open.md:11・req-define.md:46/:47 は 2026-09-07 実ファイル確認済み
- **受け入れ条件**: ID 引用を機能的記述へ置換、または ADF-COVERS 宣言等の正規機構へ集約（IR-059 triage_action: generic 表現へ是正）。置換と集約の選択は req-define での設計判断に委ねる。`REQ-{NNNN}-{NNN}` プレースホルダー表記・ADF-COVERS(implementation) 宣言（正規配置先カタログ準拠）は対象外
- **統合マーカー**: intake promoted `2026-09-05-distribution-boundary-baseline-refresh-candidate-2599.md`（concrete-id 16件ベースライン再取得候補）と連動。本修正の完了後に配布依存境界ベースラインの再取得が必要なため、backlog-review で依存関係として整理すること

## 参照

- 分類実行: /agentdev/inspect-promote（backlog-auto stage 2 inspect 系統）2026-09-07、--auto なし
- 判定: promote 3（自律確定）/ defer 9（自律確定）/ reject 1（自律確定、即時削除）
- 後続: /agentdev/backlog-review
