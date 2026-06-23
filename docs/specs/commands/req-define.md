---
title: req-define SPEC
status: draft
created: 2026-06-21
updated: 2026-06-23
---

# req-define SPEC

## 目的

機能追加またはバグ修正の要件を壁打ちにより整理、定義し、構造化 `draft-data` 形式の要件 doc（`.agentdev/drafts/req-draft-{topic-slug}.md`）を生成する。
壁打ちフェーズで使用。

## 入力

- ユーザーの自然言語による機能追加/バグ修正の説明
- GitHub Issue URL（既存Issueの場合）
- エラーログ（バグ修正の場合）
- ユーザーが明示した入力ファイル: 設計メモ、調査メモ、RU（`.agentdev/backlog/req-units/RU-*.md`）。全て参照専用入力
- req-save SPLIT 検出時の検出事項（`.agentdev/drafts/requirements-review-finding-{topic-slug}.md`）
- inspect-skills 診断結果の検出事項（`.agentdev/inspect/inbox/inspect-skills-finding-{topic-slug}.md`）。参照専用入力
- promoted 直読み禁止: `.agentdev/intake/promoted/`、`.agentdev/learning/promoted/` は直接読み込まない

## 出力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（全 work_type 共通、構造化 `draft-data` 形式: REQ-0138, ADR-0124）

## 副作用

- ファイル作成: `.agentdev/drafts/req-draft-{topic-slug}.md` のみ
- git 操作: 実行しない（G08）
- Issue 作成: 行わない（後続 case-open 責務）

## 現在の動作

- Step 0: セッションコンテキスト検知（引数なし単体実行時のみ）（当該セッション履歴、現在コンテキストを Requirement Source 候補として評価）
- Step 1: 明示入力ファイル読込（指定時）（RU 自動検出を含む）
- Step 2: 壁打ち対話（`agentdev-req-analysis` に従い深掘り）
  - Step 2-1: 前工程からの引き継ぎ判定（`agentdev_handoff: true` フラグ処理）
- Step 3: 既存REQ照合（`agentdev-req-file-manager` 照合方法論）
  - Step 3-1: 定量的データ検証（`glob docs/requirements/REQ-*.md` で AGENTS.md 記載レンジと照合）
  - Step 3-2: SPLIT 予兆計測（既存REQの健全性メトリクス計測）
- Step 4: 要件展開（`agentdev-req-analysis` 分析観点）
  - Step 4-1: 変更影響候補抽出
  - Step 4-2: 分類ゲート（変更後仕様 or 反映作業、REQ/SPEC 境界判定）
- Step 4-3: 文書分類妥当性検証（SPEC 分離基準違反残留検出）
- Step 4-4: ADR要否確認ゲート（`agentdev-architecture-advisory` oracle 連携）
- Step 4-5: 実行主体分類表（REQ-0146-007）（委譲契約を定義する場合、実行主体分類表（adapter skill / command / subagent / harness）を必須とする（`docs/specs/workflows/delegation-contracts.md` 参照））。委譲を含まない要件では省略可
- Step 5: ADR判断（`agentdev-adr-guidelines`）
  - Step 5-0: 既存ADR重複確認
  - Step 5-1: ADR禁止ゲート
  - Step 5-2: ADR判断根拠記録
  - Step 5-3: 作業手段ADR拒否ゲート
  - Step 5-4: ADR 番号指定形式（`new:{topic-slug}` 形式）
- Step 6: 要件doc生成（テンプレート: `templates/req-define/req-draft.md`）
  - Step 6-0: 定義完全性ゲート（QG-1）
  - Step 6-1: operation_units 生成
  - Step 6-2: artifact_actions 生成
- Step 7: work_type 判定（bugfix/feature/maintenance/docs_chore）
- Step 8: Scale判断（featureのみ、`agentdev-workflow-lifecycle`）
  - Step 8-1: 実装スコープシグナル確認
- Step 9: ドラフト保存（`.agentdev/drafts/req-draft-{topic-slug}.md`）
  - Step 9-1: 実装詳細の分離
  - Step 9-2: auto_gate完了ゲート（auto_gate.auto_ready:false または未解決 item 残存時、stop_reasons を提示し解消方策を壁打ちで合意）。解消時は auto_ready:true に更新。ユーザーが明示的に false 選択時は conflict_resolutions に記録し継続。未解決のままの場合は壁打ちへ差し戻し。
- Step 10: 要件doc確認（ユーザー提示のみ、承認は求めない）
  - Step 10-1〜10-6: 複数RU受付、統合/分離判定、出力生成、Epic規模検出、Wave候補記録、OU 構造検証
- Step 11: 完了報告（work_type 別テンプレート選択）

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（フェーズ定義、SSoT 遷移）
- [workflows/delegation-contracts.md](../workflows/delegation-contracts.md)（extraction / classification 委譲）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（REQ再構成 intake、draft lifecycle）
- [req-health-metrics.md](../req-health-metrics.md)（SPLIT 予兆計測閾値）
- [quality-gates.md](../quality-gates.md)（QG-1）
- [document-type-responsibilities.md](../document-type-responsibilities.md)（draft body 品質検査）

## 対象外

- 実装コードの作成、編集（G01: 壁打ちフェーズのみ）
- 関連ドキュメントの個別ファイル列挙をユーザーに求める（G02）
- `.agentdev/drafts/**` 以外のファイル作成、編集（G03）
- ユーザー明示入力ファイルの変更、削除、RU 削除（G04）
- `docs/` 配下の広範な探索（G05。例外: 明示入力ファイル、`docs/requirements/**` 参照、Step 4-1 限定探索）
- `inbox.md` / `archive/active.md` 直接ロード（G06）
- 採用済み成果物の直読み（G07）
- `git` コマンド実行（G08）
- Issue 階層決定（G13、case-open 責務）
- `execution_groups` セクション出力（G14）
- SPEC 分離基準（REQ-0101-068）該当要件行の REQ 残留（G15、`artifact_actions` へ分離）
- ADR判断における未確認事項の要件本文混入（G17、REQ-0139-002/004）
- oracle によるファイル編集（G18、REQ-0139-003）

## 検証観点

- QG-1（Definition Integrity Gate）: Step 6-0 で要件doc構造的完全性を検証（REQ/SPEC 分類、ADR ゲート、チェックボックス測可能性、必須フィールド完全性、artifact_actions 構成妥当性）
- チェックボックス品質基準: `agentdev-req-analysis` に従い測定可能で一意（G09）
- artifact_actions 構成: REQ/ADR/SPEC 別 action が適切に統合されているか
- OU 構造検証: Step 10-6 で ou_id、operation、target_req/target_spec、depends_on、result 整合性

## See Also

- [req-save.md](req-save.md)（後続コマンド（REQ/ADR 保存））
- [spec-save.md](spec-save.md)（後続コマンド（SPEC 保存））
- [case-open.md](case-open.md)（後続コマンド（Issue 作成））
- `agentdev-req-analysis` skill（要件分析手法）
- `agentdev-req-file-manager` skill（REQ ファイル管理、照合）
- `agentdev-adr-guidelines` skill（ADR 判断基準）
- `agentdev-architecture-advisory` skill（oracle 連携）
- `agentdev-workflow-lifecycle` skill（work_type、scale 判定）
- REQ-0102（要件定義、保存）
- REQ-0138（構造化 req_draft 契約）
- REQ-0139（外部エージェント統合契約（oracle））
- ADR-0124（構造化 draft-data 形式）
