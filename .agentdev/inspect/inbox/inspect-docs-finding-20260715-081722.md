# inspect-docs 検出事項

| 項目 | 値 |
|------|------|
| 実行日時 | 2026-07-15 08:17:22 (JST) |
| コマンド | /agentdev/inspect-docs |
| スキャン対象 | docs/requirements/, docs/adr/, docs/specs/, docs/guides/, docs/DOC-MAP.md, docs/README.md, .opencode/ |
| source-of-truth priority | 現行 REQ > 承認済み ADR > SPEC > DOC-MAP/guides |

## 診断サマリ

| 観点 | 結果 |
|------|------|
| REQ参照ID整合性 | 異常なし（重複0件、ファイル名↔id不整合0件） |
| REQ相互参照の実在性 | 1件検出（REQ-0157 不在） |
| 第一参照導線 | DRIFT 2件（docs/README.md, DOC-MAP.md） |
| 現行/廃止/世代境界 | 異常なし |
| SPEC意味診断 | 違反なし |
| ADR意味診断 | 違反なし（観察2件） |
| guides意味診断 | 違反なし |
| DOC-MAP意味診断 | DRIFT 2件（REQ/SPEC 未掲載） |
| REQ structure review (6観点) | MOVE 2件、DRIFT 3件 |
| 文書分類一貫性 | Step 9 MOVE 候補に集約 |
| 配布物整合性検査 | ID汚染 37件(MOVE)、壊れた括弧 1件(UPDATE)、extension矛盾 1件(要レビュー) |
| docs-check route候補 | 5件（機械的検査へ移送可能） |
| 未処理 artifact | intake inbox 6件、promoted 6件（RU化待ち）、前回 finding 1件（未処理） |

---

## 検出事項リスト

### F-01: DRIFT — docs/README.md REQ件数不整合

| フィールド | 内容 |
|-----------|------|
| 観点 | DRIFT |
| 対象 | docs/README.md L6 |
| 根拠 | 「REQ-0101 から REQ-0160 までの 51 件」と記載。実際は REQ-0101〜REQ-0162 の 53 件。REQ-0161（config.yaml削除）、REQ-0162（配布物ハーネス境界浄化）が追加された際にインデックスが未更新。requirements/README.md L5 は「53件」と正しく記載。 |
| シグナル数 | 2（件数不一致、REQ範囲不一致） |
| 確信度 | high |
| 推奨アクション | UPDATE（docs/README.md の REQ 件数と範囲を 53 件 / REQ-0162 までに修正） |
| req-define入力案 | — |

| NG分類 | 理由 | 後続対象 |
|--------|------|----------|
| pre-existing | REQ-0161/0162 追加時にインデックスが未更新。今回の変更ではない。 | 別途要件化（intake inbox に `2026-07-15-canonical-req-range-staleness.md` が既に捕捉済みの可能性あり） |

---

### F-02: DRIFT — DOC-MAP.md REQ/SPEC 未掲載

| フィールド | 内容 |
|-----------|------|
| 観点 | DRIFT |
| 対象 | docs/DOC-MAP.md |
| 根拠 | (1) 現行 REQ 表が REQ-0160 まで（51件）。REQ-0161, REQ-0162 が未掲載。(2) 基盤 SPEC 表に3件の未掲載 SPEC: `foundations/harness-separation-model.md`（draft, REQ-0162, ADR-0136）、`responsibilities/responsibility-boundary-purification.md`（accepted, ADR-0136）、`quality/spec-health-metrics.md`（accepted, REQ-0156-007）。specs/README.md には登録済み。 |
| シグナル数 | 5（REQ未掲載2件 + SPEC未掲載3件） |
| 確信度 | high |
| 推奨アクション | UPDATE（DOC-MAP.md に REQ-0161/0162 と3 SPEC を追加） |
| req-define入力案 | — |

| NG分類 | 理由 | 後続対象 |
|--------|------|----------|
| pre-existing | REQ-0161/0162 および3 SPEC の追加時に DOC-MAP が未更新。 | 別途要件化 |

---

### F-03: DRIFT — REQ-0157 不在（存在しないファイルへの参照）

| フィールド | 内容 |
|-----------|------|
| 観点 | DRIFT |
| 対象 | REQ-0161（L12,22,23,25,41）、REQ-0144（L50） |
| 根拠 | REQ-0161-001 が `docs/requirements/retired/REQ-0157.md` を削除対象として明記。REQ-0144 の broken-reference リストにも REQ-0157 を含む。しかし `docs/requirements/retired/REQ-0157.md` は存在しない。REQ-0157 は現行（REQ-0101〜0162）にも廃止（retired/）にも存在しない。連番ギャップの唯一の説明不在 ID。REQ-0161 の削除が完了しているか、REQ-0157 が retired/ に存在したことがないかのいずれか。 |
| シグナル数 | 2（削除対象参照 + broken-reference リスト参照） |
| 確信度 | high |
| 推奨アクション | UPDATE（REQ-0161, REQ-0144 から REQ-0157 への参照を削除または「削除済み」に修正） |
| req-define入力案 | — |

| NG分類 | 理由 | 後続対象 |
|--------|------|----------|
| pre-existing | REQ-0157 の不在は過去のクリーンアップ作業に由来。今回の変更ではない。 | 別途要件化 |

---

### F-04: MOVE — REQ-0158 Phase 1-6 実装計画の要件本体残留

| フィールド | 内容 |
|-----------|------|
| 観点 | MOVE |
| 対象 | docs/requirements/REQ-0158.md L176-210（「変更文書限定検査契約の成熟（Phase 1-6）」セクション） |
| 根拠 | 高特異性シグナル3種: (1) Phase番号残留: Phase 1〜6 の段階的実装計画が「要件」セクション内に存在（実装パラメータ残留）。(2) スキーマフィールド列挙: Phase 2 で TargetedDocsReport の必須フィールドリスト（workflow, files_checked, coupled_files_checked, failures, warnings, doc_map_update_required, spec_readme_update_required, requirements_readme_update_required, full_docs_check_recommended, extensions_check_required, declared_files_check）を列挙。(3) SPEC配置計画: Phase 1 で「挙動SPEC/カタログSPEC/実装詳細SPECへの配置指示」を記述。これらは移行計画・実装詳細であり、REQ要件行（検証可能な状態要件）ではない。追加観察: L35「check_changed_docs.ts を実装する」（反映作業指示）、L37 処理層アーキテクチャ詳細、L39 CLI引数列挙も implementation-heavy。 |
| シグナル数 | 3（Phase番号残留 + スキーマフィールド列挙 + SPEC配置計画） |
| 確信度 | high |
| 推奨アクション | MOVE（Phase 1-6 計画を SPEC または移行ドキュメントへ移送。CLI引数 --workflow等は公開インターフェースとして安定契約例外候補） |
| req-define入力案 | REQ-0158 の Phase 1-6 を独立した移行計画ドキュメントまたは SPEC として切り出す。REQ-0158 要件本体には「変更文書限定検査契約が成熟していること」という状態要件のみを残す。 |

| NG分類 | 理由 | 後続対象 |
|--------|------|----------|
| pre-existing | Phase 1-6 計画は過去の要件定義で導入。今回の変更ではない。 | 別途要件化（intake inbox に `2026-07-15-req-0130-035-spec-detail-leak.md` が関連する可能性） |

---

### F-05: MOVE — REQ-0130-035 スクリプト詳細の要件行残留

| フィールド | 内容 |
|-----------|------|
| 観点 | MOVE |
| 対象 | docs/requirements/REQ-0130.md L45（要件行 REQ-0130-035） |
| 根拠 | `check_changed_docs.ts --workflow case-run` の具体的スクリプト名・フラグが要件行に残留。file pattern 残留 + 実装パラメータ残留のシグナル。ただし接続契約・安全境界として安定契約例外に該当する可能性あり。 |
| シグナル数 | 2（スクリプト名残留 + フラグ詳細残留） |
| 確信度 | medium（安定契約例外候補を明記。CLI引数が公開インターフェースとして例外の可能性） |
| 推奨アクション | MOVE（スクリプト詳細を SPEC へ移送）または no-action（安定契約例外と判定した場合） |
| req-define入力案 | — |

| NG分類 | 理由 | 後続対象 |
|--------|------|----------|
| pre-existing | 過去の要件定義で導入。今回の変更ではない。 | 別務要件化 |

---

### F-06: MOVE — 配布物 ID 汚染（内部IDの配布物残留）

| フィールド | 内容 |
|-----------|------|
| 観点 | MOVE |
| 対象 | src/opencode/commands/agentdev/（7ファイル）、src/opencode/skills/agentdev-*/（12ファイル） |
| 根拠 | AgentDevFlow 内部ID（REQ-XXXX-XXX, ADR-XXXX, IR-XX）が配布物本文行にトレーサビリティ注記として残留。配布物は利用者が読む成果物であり、内部IDは追跡導線のないノイズ（OU-009 原則）。コードブロック内、frontmatter、テンプレート変数プレースホルダーは例外対象外。主な検出ファイル: case-run.md（12件）、case-auto.md（4件）、case-close.md（3件）、req-save.md（4件）、spec-save.md（3件）、case-run-execution-adapter（4件）、architecture-advisory（3件）、japanese-tech-writing（1件）、gh-cli（1件）、harness-delegation（2件）。検出パターン: `（REQ-XXXX-XXX）`, `（ADR-XXXX）`, `IR-XX 準拠` 等のインライン注記。 |
| シグナル数 | 37件以上（body text 内の内部ID参照。explore agent は58件と報告） |
| 確信度 | high |
| 推奨アクション | MOVE（内部IDを機能的記述：コマンド名、スキル名、機能概要へ置換） |
| req-define入力案 | 配布物から内部IDを除去する一括クリーンアップ要件。各ID参照を文脈を保持した機能的記述へ置換。 |

| NG分類 | 理由 | 後続対象 |
|--------|------|----------|
| pre-existing | 内部ID注記は過去の配布物整備プロセスで導入。前回 inspect-docs（20260625）でも指摘済み。 | 別途要件化 |

---

### F-07: UPDATE — 配布物 壊れた括弧（ID除去残骸）

| フィールド | 内容 |
|-----------|------|
| 観点 | MOVE（文意保持: 壊れた括弧） |
| 対象 | src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md L121 |
| 根拠 | `（/ 005）` — 全角括弧内がスラッシュと数字のみ。内部ID除去後の残骸（元は `（OU-005）` 等のトレーサビリティ注記の可能性）。文脈: 「明示パスステージ + git commit -- \<paths> の義務付け（/ 005）」。括弧内が意味を成していない。 |
| シグナル数 | 1（壊れた括弧パターン: スラッシュ+数字のみ） |
| 確信度 | high |
| 推奨アクション | UPDATE（壊れた参照 `（/ 005）` を修復または除去） |
| req-define入力案 | — |

| NG分類 | 理由 | 後続対象 |
|--------|------|----------|
| pre-existing | ID除去作業時の残骸。今回の変更ではない。 | 別途要件化 |

---

### F-08: 要ヒューマンレビュー — extension must_not と command Step 11 の矛盾

| フィールド | 内容 |
|-----------|------|
| 観点 | DRIFT（責務整合: command と extension の矛盾） |
| 対象 | .agentdev/extensions/commands/inspect-docs.yaml must_not, inspect-docs command Step 11 |
| 根拠 | extension の must_not: 「実装本文（src/opencode/**）は読まない」。command Step 11: 「配布物（src/opencode/commands/agentdev/, src/opencode/skills/agentdev-*/）について配布物整合性検査」。extension は追加拡張（G01: 上書き禁止）のため Step 11 を実行したが、must_not と直接矛盾。配布物整合性検査を実行するには src/opencode/ 配下を読む必要がある。 |
| シグナル数 | 1（must_not と step の直接矛盾） |
| 確信度 | medium |
| 推奨アクション | UPDATE（extension must_not を「実装コード（.ts/.js/.json 等）は読まない」等に範囲を限定するか、Step 11 の対象を明確化） |
| req-define入力案 | — |

| NG分類 | 理由 | 後続対象 |
|--------|------|----------|
| pre-existing | extension 設定と command 定義の不整合。今回の変更ではない。 | 別途要件化 |

---

## docs-check route 候補（Step 12）

意味的疑いのうち機械的検査へ移送可能なもの:

| 候補 | 対応する検出事項 | 機械的検査方法 |
|------|-----------------|---------------|
| REQ件数カウント整合性 | F-01 | 実ファイル数と docs/README.md 記載件数の差分検出 |
| DOC-MAP REQ/SPEC 掲載漏れ | F-02 | DOC-MAP 掲載 REQ/SPEC vs 実ファイルの差分検出 |
| REQ相互参照の実在性 | F-03 | 参照先 REQ-XXXX ファイルの存在確認（broken-reference 検出） |
| 配布物内部ID汚染 | F-06 | 正規表現パターン（REQ-\d{4}, ADR-\d{4}, IR-\d{2,}）による本文行マッチ |
| 壊れた括弧パターン | F-07 | パターンベース検出（`（/）`, `（）`, `（REQ-/）`, `（/ NNN）` 等） |

REQ-0158 Phase 1-6（F-04）は意味的診断のため手動判定が必要。docs-check route 候補外。

---

## 未処理 artifact 確認（Step 13）

| カテゴリ | 状態 | 診断への潜在的影響 |
|----------|------|-------------------|
| intake/inbox | 6件（1件既存 `2026-07-07-issue-1475-stale-skill-path-reference.md` + 5件新規 2026-07-15 付け）。新規5件のうち `2026-07-15-canonical-req-range-staleness.md`, `2026-07-15-req-0130-035-spec-detail-leak.md` 等が今回の検出事項と同名の可能性あり。 | 既に一部の問題が intake 経由で捕捉済みの可能性。重複捕捉のリスクあり。 |
| learning/inbox.md | 0件（ヘッダのみ） | 影響なし |
| intake/promoted | 5件 | RU化待ち。backlog-review 未実行。 |
| learning/promoted | 1件 | RU化待ち。backlog-review 未実行。 |
| backlog/req-units | 空（.gitkeep のみ） | 影響なし |
| inspect/inbox | 前回 finding `inspect-docs-finding-20260625-202639.md`（186KB）が未処理で残存 | inspect-promote 未実行。前回 finding の内容との重複確認が必要。 |

---

## 推奨アクション総括

1. **即時対応不要**: 全検出事項は pre-existing であり、今回の変更に起因しない
2. **intake/promote 経由での要件化推奨**: F-01（REQ件数不整合）、F-02（DOC-MAP未掲載）、F-03（REQ-0157不在）、F-04（REQ-0158 Phase 1-6）は intake inbox に既に一部捕捉済みの可能性あり。inspect-promote で分類後に backlog-review → req-define へ流す
3. **配布物クリーンアップ（F-06, F-07）**: 37件以上の内部ID汚染と1件の壊れた括弧は一括クリーンアップ要件として要件化を推奨
4. **extension 整理（F-08）**: inspect-docs extension の must_not を「実装コード（.ts/.js/.json）は読まない」等に範囲限定し、配布物 .md 検査と矛盾しないよう修正を推奨
5. **docs-check route 移送**: F-01, F-02, F-03, F-06, F-07 は機械的検査ルールとして docs-check / check_integrity.ts へ組み込み可能
