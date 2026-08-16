---
name: agentdev-workflow-req-define
description: "req-define command の workflow 実装本体。セッションコンテキスト検知・入力解決から壁打ち対話、既存REQ照合、要件展開、Decision判断、要件doc（draft-data）生成、work_type・Scale 判定、adversarial-review 経路A、ドラフト保存、要件doc確認、完了報告までの対話型 workflow 制御を所有する。USE FOR: req-define 実行時の workflow 制御（対話開始・HITL・blocked・resume・draft 生成）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# req-define workflow スキル

req-define command の workflow 実装本体。機能追加またはバグ修正の要件を整理・定義する壁打ち workflow の制御構造を所有する。対話（HITL）と durable state（要件doc draft、RU）の分離を維持し、中断・再開を可能にする。

req-define command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md（control plane）と `references/` 配下（各 STEP 詳細）が担う。
Workflow Skill 固有契約は `<workflows/workflow-skill-model>` SPEC が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-req-define.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と req-define command の公開契約のみを前提とする。SPEC ディレクトリの内部構成は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **SPEC 内部パスの固定知識化の禁止**: extension に列挙されていない SPEC 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- ユーザーの自然言語による機能追加/バグ修正の説明
- GitHub Issue URL（既存Issueの場合）、エラーログ（バグ修正の場合）
- ユーザーが明示した入力ファイル（設計メモ、調査メモ、RU `.agentdev/backlog/req-units/RU-*.md` 等、参照専用）
- req-save SPLIT 検出時の検出事項、inspect-skills 診断結果の検出事項

## 出力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（全 work_type 共通、構造化 `draft-data` 形式）

## 副作用

- `.agentdev/drafts/**` 配下のファイル作成・更新のみ（G03）。`git` コマンドは実行しない（G08）
- RU、promoted 成果物、inbox.md/deferred.md は読取のみ（参照専用入力）

## Control Plane（STEP 一覧）

req-define workflow は次の11 STEP で構成する。各 STEP は resume point を持つ（DEC-{N}、`docs/specs/<workflows/step-reference-contract>.md`）。対話の進行は durable state（入力ファイル、壁打ちで確定した合議内容を含む draft-data 下書き）から再構成でき、会話コンテキストのみに依存しない。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | セッションコンテキスト検知・入力解決 | req-define 起動 | 6項目推論（信頼度付き）、入力ソース確定 | [references/input-and-dialogue.md](references/input-and-dialogue.md) |
| STEP-2 | 壁打ち対話（引き継ぎ判定含む） | 入力ソース確定 | 深掘り済み要件内容、`agentdev_handoff` 判定 | [references/input-and-dialogue.md](references/input-and-dialogue.md) |
| STEP-3 | 既存REQ照合 | 壁打ち合意内容確定 | 操作分類結果（`artifact_actions` 記録用） | [references/requirement-development.md](references/requirement-development.md) |
| STEP-4 | 要件展開 | 操作分類確定 | 変更影響候補、分類ゲート、Decision要否確認、test strategy 定義 | [references/requirement-development.md](references/requirement-development.md) |
| STEP-5 | Decision判断 | 要件展開完了 | Decision判断記録（`new:{topic-slug}` 形式） | [references/requirement-development.md](references/requirement-development.md) |
| STEP-6 | 要件doc生成 | Decision判断完了 | 構造化 `draft-data`（operation_units、artifact_actions、test_strategy、review_dispositions） | [references/draft-generation.md](references/draft-generation.md) |
| STEP-7 | work_type・Scale 判定 | 要件doc生成完了 | work_type 4値、scale（feature のみ） | [references/draft-generation.md](references/draft-generation.md) |
| STEP-8 | adversarial-review（経路A） | STEP-7 完了後、STEP-9 前 | review 結果反映（skip 時は従来フロー継続） | [references/adversarial-review-path-a.md](references/adversarial-review-path-a.md) |
| STEP-9 | ドラフト保存 | review 完了または skip | `.agentdev/drafts/req-draft-{topic-slug}.md` 保存 | [references/draft-generation.md](references/draft-generation.md) |
| STEP-10 | 要件doc確認 | ドラフト保存完了 | ユーザー提示済み（承認は求めず提示のみ） | [references/draft-generation.md](references/draft-generation.md) |
| STEP-11 | 完了報告 | 提示完了 | 種別別完了報告 | [references/draft-generation.md](references/draft-generation.md) |

### STEP 間の依存と分岐

- **標準経路**: STEP-1 → STEP-2 → STEP-3 → STEP-4 → STEP-5 → STEP-6 → STEP-7 → STEP-8（skip 条件該当時は省略）→ STEP-9 → STEP-10 → STEP-11
- **引数あり開始**: STEP-1 をスキップし STEP-2 から開始できる（明示入力ファイル指定時）
- **差し戻し**: STEP-4 の Decision要否確認ゲートでブロッカーまたは未決事項残存時は STEP-2 へ。STEP-8 の Decision finding は STEP-5 へ戻し再評価、要件展開関連 finding は該当 STEP へ戻す。STEP-10 差し戻し時は壁打ち継続（STEP-2 へ）
- **session由来RU**: STEP-1/2 で `source_type: chat` かつ `generated_by: session` のRU を受領した場合、session由来RU 消費契約（一時成果物ライフサイクル要件 + artifact-contracts SPEC が正規原本）に従う

### resume protocol

- 再開点は durable state から再構成する: 入力ファイル（RU、検出事項）、`.agentdev/drafts/` 配下の draft 下書き（STEP-6 生成後）、`draft-data` の `status` と `auto_gate`
- 対話ターン間の合意内容は draft-data 下書き（runtime artifact、REQ-{NNNN}）へ逐次反映し、会話コンテキスト喪失後も下書きから再開できる
- 未解決質問・未解決衝突・停止理由は draft の該当フィールドが正であり、会話履歴を権威情報源としない

### termination

- 正常終了: STEP-11 の完了報告出力まで（次コマンド実行を確定の意思表示として扱う）
- 停止終了: 有効な Requirement Source 構成不能、`agentdev_handoff: true` による前工程引き継ぎ整理、STEP-8 で未解決のユーザー判断事項が残る場合（STEP-9 へ進まない）
- 実装コードは一切書かない（壁打ちフェーズ、command 不変条件）

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-req-analysis`: セッションコンテキスト検知、壁打ち深掘り、分析観点、detailed gates、チェックボックス品質基準
- `agentdev-req-file-manager`: 既存REQ照合方法論
- `agentdev-decision-guidelines`: Decision判断基準（manual reference）
- `agentdev-architecture-advisory`: Decision要否確認ゲートの助言委譲
- `agentdev-workflow-lifecycle`: work_type・Scale 判定、前工程引き継ぎ判定
- `agentdev-adversarial-review`: 経路A review 呼出
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）

## Workflow Extension 読込

本スキルは workflow extension（`.agentdev/extensions/skills/agentdev-workflow-req-define.yaml`、`kind: workflow-extension`）を読み込む場合がある（REQ-{NNNN}-{NNN}、DEC-{N}）。必要に応じて internal workflow extension（`.agentdev/extensions/skills/agentdev-workflow-req-define/internal.yaml`、`kind: internal-workflow-extension`）を追加で読む。いずれも Workflow Skill のみが読み、req-define command は直接読まない。標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行する。

## 共通制約

- **壁打ちフェーズのみ**: 実装コードを書かない。`.agentdev/drafts/**` のみ作成・編集を許可する
- **参照専用入力**: ユーザーが明示した入力ファイル、RU、promoted 成果物は変更・削除しない。RU の削除は case-open 成功後に実行される
- **draft-data 形式**: 出力は構造化 `draft-data`（`# draft-data` fenced YAML block）。`operation_units` を出力し、`execution_groups` は出力しない。`workflow_route` は派生値として保存しない（後続工程の分岐は `artifact_actions` の存在で決定）
- **Issue 階層非決定**: req-define は Issue 階層を決定しない。`depends_on` は case-open の execution_unit 構成が使用する依存情報であり、最終 Issue 構成は case-open が決定する
- **session由来RU 消費契約**: 正規原本（一時成果物ライフサイクル要件 + artifact-contracts SPEC）へ委譲し、本スキルで再定義しない

## See Also

- **`<workflows/workflow-skill-model>` SPEC**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` SPEC**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **req-define command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
