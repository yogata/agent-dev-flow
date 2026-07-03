---
title: req-define SPEC
status: draft
created: 2026-06-21
updated: 2026-07-03
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

- Step 1: セッションコンテキスト検知（引数なし単体実行時のみ）（当該セッション履歴、現在コンテキストを Requirement Source 候補として評価）
- Step 2: 明示入力ファイル読込（指定時）（RU 自動検出を含む）
- Step 3: 壁打ち対話（`agentdev-req-analysis` に従い深掘り）
 - Step 3-1: 前工程からの引き継ぎ判定（`agentdev_handoff: true` フラグ処理）
- Step 4: 既存REQ照合（`agentdev-req-file-manager` 照合方法論）
 - Step 4-1: 定量的データ検証（`glob docs/requirements/REQ-*.md` で AGENTS.md 記載レンジと照合）
 - Step 4-2: SPLIT 予兆計測（既存REQの健全性メトリクス計測）
- Step 5: 要件展開（`agentdev-req-analysis` 分析観点）
 - Step 5-1: 変更影響候補抽出
 - RU 由来キーワード抽出 + glob/grep 前処理による explore 委譲スコープの絞り込み（REQ-0102-072）。絞り込みは explore 委譲の調査優先対象リストのみに適用（ヒントでありハードフィルタではない）し、実ファイル列挙（REQ-0102-002）の完全性は維持する
 - Step 5-2: 分類ゲート（REQ-0155-004 最終分類確定ステップ）（変更後仕様 or 反映作業、REQ/SPEC 境界判定）。RU 入力の暫定分類（backlog-review が `tentative_classification` に付与）が存在する場合、`docs/specs/foundations/document-model.md` の文書7分類モデルに照らして最終分類を確定し暫定分類を上書きする。確定時のバリデーション（暫定分類の7値チェック、フィールド欠落時の停止、最終分類上書き値の7値チェック）は後述「tentative_classification 最終確定のバリデーション（REQ-0155-008）」に定める
 - Step 5-3: 文書分類妥当性検証（SPEC 分離基準違反残留検出）
 - Step 5-4: ADR要否確認ゲート（`agentdev-architecture-advisory` oracle 連携）
 - oracle 入力標準テンプレート使用 + 出力 4 ラベル構造要求（REQ-0102-073）。ラベル構造は soft-contract（ADR-0124）とし、分類権限は親が保持する
 - Step 5-5: 実行主体分類表（REQ-0146-007）（委譲契約を定義する場合、実行主体分類表（adapter skill / command / subagent / harness）を必須とする（`docs/specs/workflows/delegation-contracts.md` 参照））。委譲を含まない要件では省略可
 - Step 5-6: Test strategy 定義（要件展開内）
 - 各 test strategy 項目を verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素構造として定義
 - on_failure（不合格時の処置）を持たない検証項目は test strategy に含めない
 - 項目識別子: TS-NNN 形式（NNNは3桁ゼロ埋め連番）
 - 各項目属性: id（TS-NNN）、target_item（AG-* への参照）、verification、pass_criteria、on_failure
 - on_failure アクション種別: fix-and-reverify（実装を修正して再検証）/ record-in-findings（Findings に out-of-scope として記録）の2値
- Step 6: ADR判断（`agentdev-adr-guidelines`）
 - Step 6-1: 既存ADR重複確認
 - Step 6-2: ADR禁止ゲート
 - Step 6-3: ADR判断根拠記録
 - Step 6-4: 作業手段ADR拒否ゲート
 - Step 6-5: ADR 番号指定形式（`new:{topic-slug}` 形式）
- Step 7: 要件doc生成（テンプレート: `templates/req-define/req-draft.md`）
 - Step 7-1: 定義完全性ゲート（QG-1）
 - Step 7-2: operation_units 生成
 - Step 7-3: artifact_actions 生成
 - Step 7-4: draft-data test_strategy 生成（各項目の5属性をYAML形式で格納）
- Step 8: work_type 判定（bugfix/feature/maintenance/docs_chore）
- Step 9: Scale判断（featureのみ、`agentdev-workflow-lifecycle`）
 - Step 9-1: 実装スコープシグナル確認
- Step 10: ドラフト保存（`.agentdev/drafts/req-draft-{topic-slug}.md`）
 - Step 10-1: 実装詳細の分離
 - Step 10-2: auto_gate完了ゲート（auto_gate.auto_ready:false または未解決 item 残存時、stop_reasons を提示し解消方策を壁打ちで合意）。解消時は auto_ready:true に更新。ユーザーが明示的に false 選択時は conflict_resolutions に記録し継続。未解決のままの場合は壁打ちへ差し戻し。
- Step 11: 要件doc確認（ユーザー提示のみ、承認は求めない）
 - Step 11-1〜11-6: 複数RU受付、統合/分離判定、出力生成、Epic規模検出、Wave候補記録、OU 構造検証
- Step 12: 完了報告（work_type 別テンプレート選択）

req-define の Step 番号構成は command 定義（src/opencode/commands/agentdev/req-define.md）と一致する（REQ-0143-004）。
本 SPEC の Step 1〜Step 12 は command 定義の同名 Step と完全に一致する。
SPEC と command で Step 番号がずれる場合、SPEC 側を command 定義へ合わせる。
Step 0 扱い、採番開始位置の規則は `command-file-format.md` 参照。

### tentative_classification 最終確定のバリデーション（REQ-0155-008）

Step 5-2 が backlog-review 付与の暫定分類（`tentative_classification`）を最終分類として確定（上書き）する際、以下を検証すること:

1. 暫定分類が REQ-0155-003 の7値のいずれかであること。7値以外の場合、確定を停止し理由を提示すること
2. フィールドが欠落している場合、暫定分類未付与として確定を停止し、backlog-review への差し戻しを提示すること
3. 最終分類への上書き値も7値のいずれかであること

7値の定義、検出時の具体的挙動は backlog-review.md「tentative_classification フィールド仕様」を参照すること。

## draft-data test_strategy フィールドスキーマ

要件定義で test_strategy（テスト戦略）を定義する場合のシリアライズ形式を定義する。

### test_strategy 項目構造

各 test strategy 項目は以下の5属性を持つ:

| 属性 | 型 | 説明 | 例 |
|------|------|------|----|
| id | string | TS-NNN 形式（NNNは3桁ゼロ埋め連番） | `TS-001` |
| target_item | string | AG-* への参照 | `AG-002` |
| verification | string | 検証手順 | `check_integrity.ts を実行する` |
| pass_criteria | string | 合格基準 | `エラー 0 件で完了すること` |
| on_failure | string | 不合格時の処置 | `実装を修正して再検証する` |

### YAML 表現形式

```yaml
test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      検証手順の記述
    pass_criteria: |
      合格基準の記述
    on_failure: |
      不合格時の処置の記述
```

### on_failure アクション種別

| 種別 | 説明 | 選択基準 |
|------|------|---------|
| fix-and-reverify | 実装を修正して再検証する | 修正可能な実装不良の場合 |
| record-in-findings | Findings に out-of-scope として記録する | スコープ外または修正困難な事象の場合 |

## draft-data artifact_actions フィールド形式

artifact_actions の各 entry が出力する `target_area` と `content` の扱いは operation 別に以下を規定する（REQ-0102-078, REQ-0102-079）。

| operation | target_area | content |
|-----------|-------------|---------|
| create / spec-create | 任意（省略時は spec-save が既存セクション構造から追加位置を判断） | 新規セクション本文 |
| update / spec-update | 必須（対象セクション見出し、Markdown 見出し行形式。例: `### IR-044`） | 変更後セクション全文（対象セクションの見出し行から次の同レベル見出しの直前までの全内容） |

req-define 側は出力形式のみを規定する。
`target_area` の形式（Markdown 見出し行）、見出し階層の解釈規則、複数マッチ、未検出時の挙動は [spec-save.md](spec-save.md) 側に配置する。

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（フェーズ定義、SSoT 遷移）
- [workflows/delegation-contracts.md](../workflows/delegation-contracts.md)（extraction / classification 委譲）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（REQ再構成 intake、draft lifecycle）
- [req-health-metrics.md](../quality/req-health-metrics.md)（SPLIT 予兆計測閾値）
- [quality-gates.md](../quality/quality-gates.md)（QG-1）
- [document-type-responsibilities.md](../responsibilities/document-type-responsibilities.md)（draft body 品質検査）

## 対象外

- 実装コードの作成、編集（G01: 壁打ちフェーズのみ）
- 関連ドキュメントの個別ファイル列挙をユーザーに求める（G02）
- `.agentdev/drafts/**` 以外のファイル作成、編集（G03）
- ユーザー明示入力ファイルの変更、削除、RU 削除（G04）
- `docs/` 配下の広範な探索（G05。例外: 明示入力ファイル、`docs/requirements/**` 参照、Step 5-1 限定探索）
- `inbox.md` / `deferred.md` 直接ロード（G06）
- 採用済み成果物の直読み（G07）
- `git` コマンド実行（G08）
- Issue 階層決定（G13、case-open 責務）
- `execution_groups` セクション出力（G14）
- SPEC 分離基準（REQ-0101-068）該当要件行の REQ 残留（G15、`artifact_actions` へ分離）
- ADR判断における未確認事項の要件本文混入（G17、REQ-0139-002/004）
- oracle によるファイル編集（G18、REQ-0139-003）

## 検証観点

- QG-1（Definition Integrity Gate）: Step 7-1 で要件doc構造的完全性を検証（REQ/SPEC 分類、ADR ゲート、チェックボックス測可能性、必須フィールド完全性、artifact_actions 構成妥当性）
 - test_strategy 3要素完全性検査: 各 test strategy 項目が verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素を完全に保持すること。いずれかが欠落する項目を検出した場合、fail とする
- チェックボックス品質基準: `agentdev-req-analysis` に従い測定可能で一意（G09）
- artifact_actions 構成: REQ/ADR/SPEC 別 action が適切に統合されているか
- OU 構造検証: Step 11-6 で ou_id、operation、target_req/target_spec、depends_on、result 整合性

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
