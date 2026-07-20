---
name: agentdev-case-run-execution-adapter
description: "case-run external execution adapter. USE FOR: connecting case-run issue execution to 実行担当サブエージェント via adapter skill delegation (adapter skill + 委譲 prompt 内 実行 command), handling completed-pr/blocked/failed/delegation-unavailable results. DO NOT USE FOR: req-define architecture review, ADR judgment, workflow state management, or Issue completion checkbox evaluation."
---

# case-run 外部実行アダプター（External Execution Adapter）

case-run が1 Issue 単位（または1 Wave 単位）の実装作業を実行担当サブエージェントへ接続する際のアダプタープロトコル（adapter protocol）を定義する知識ベース。
adapter skill 経由での委譲起動、委譲 prompt 内で実行 command を指定する委譲に基づく。
対象を case-run に限定する。

- **参照元**: `case-run`（実行担当サブエージェント起動時）
- **特性**: アダプタープロトコルの宣言的定義のみ提供する。Epic/Wave orchestration、worktree 管理、完了条件チェックボックス評価は本スキルの対象外。

## 原本（SSoT）

本スキルの原本仕様は [`agentdev-case-run-execution-adapter` SPEC](../../../../docs/specs/skills/agentdev-case-run-execution-adapter.md) である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## 実行モデル

```
case-run (orchestration)
  └── adapter skill を読み込んだ実行担当サブエージェントへ委譲（委譲 prompt 内で実行 command を指定）
        ├── Issue 本文・受け入れ基準読込（実行 command が success criteria に分解）
        ├── ADR / REQ / SPEC / docs / repository context 再確認
        ├── 実行 command による evidence-backed 実装・品質ゲート（code review + QA review + gate review）
        ├── test strategy 項目の test-fix ループ（項目ごと検証、不合格時 fix-and-reverify / record-in-findings、全項目処理まで反復）
        ├── blocker 処理
        ├── PR 作成手続き（agentdev-gh-cli）による PR 作成（PR URL を result に格納）
        └── result を case-run へ返却
```

- **case-run 本体**: 単一 Issue または単一 Wave（Epic Issue 指定時、最大5件並列）で実行担当サブエージェントを委譲起動し、result を処理する。実装実行そのものは行わない。起動手段は AGENTS.md および references/<harness>.md 参照（REQ-0162-002）。
- **実行担当サブエージェント**: 外部実行基盤（AGENTS.md で選定）が提供するエージェント型。1 Issue あたり1起動。adapter skill（`agentdev-case-run-execution-adapter`）を読み込み、委譲 prompt 内で実行 command を起動する。仕様を再解釈、再設計しないアダプターである。
- **実行 command（harness が提供）**: 委譲 prompt 内で指定される実行 command（skill ではない）。Issue を success criteria に分解、各 criterion に observable evidence を要求、品質ゲートを実行する。ランタイム作業領域（実行監査トレイル等）は worktree 配下に配置され、worktree 削除時に破棄される。各ツール呼び出しは120秒 timeout で保護される。command の具体名、起動手段は AGENTS.md および references/<harness>.md 参照（REQ-0162-002）。
- **外部実行基盤**: 実行担当サブエージェントの背後で実行エンジンとして振る舞う。plan artifact 等の中間成果物の内部構造には依存しない。最終結果は **PR URL** で受領する（透明）。

## 実行担当サブエージェントの責務

実行担当サブエージェントは以下を順に実行する:

1. **Issue 読込**: 対象 Issue 本文、受け入れ基準を読み込む。実行 command が Issue を success criteria に分解する
2. **context 再確認**: ADR/ REQ/ SPEC/ docs/ repository context を再確認し、実装が既存の決定事項に矛盾しないことを担保する
3. **実装、検証、PR 作成**: 実行 command に従い evidence-backed に実装を実行し、品質ゲートを通して PR 作成手続き（`agentdev-gh-cli`）で PR を作成する。
ハーネスの plan artifact 等の中間成果物は解釈せず、PR URL で最終結果を受領する。
実装完了後、Issue 本文の test strategy 項目の test-fix ループ（後述「test strategy 項目の test-fix ループ」）を実行する
4. **blocker 処理**: 回答可能な blocker（ADR/REQ/SPEC/docs/Issue本文で回答できるもの）は自律的に実行 command 内で再評価できる
5. **result 返却**: 後述の result 契約に従い case-run へ返却する

## test strategy 項目の test-fix ループ（REQ）

実行担当サブエージェントは実装完了後、Issue 本文のテスト戦略セクションに含まれる各 test strategy 項目（3要素構造: verification / pass_criteria / on_failure）について以下のループを実行する。
全項目の処理が完了するまで反復する。

1. **項目ごとの検証**: 各 test strategy 項目の `verification` 手順に従い検証を実行し、`pass_criteria` を満たすか確認する
2. **不合格時の処置**: 検証結果が `pass_criteria` を満たさない場合、当該項目の `on_failure` に従い以下いずれかを実行する:
 - **fix-and-reverify（実装修正して再検証）**: 実装を修正し、当該項目の検証を再実行する。再検証で合格するまで修正と再検証を反復する
 - **record-in-findings（Findings 記録）**: 実装修正で対応困難な場合（仕様上の制約、スコープ外の原因等）、当該項目を不合格理由とともに PR 本文の `## Findings / Capture候補` セクションに記録する
3. **全項目処理までの反復**: 未処理の test strategy 項目が残る場合、1〜2 を繰り返す。全項目が「合格」または「Findings 記録済み」のいずれかに分類されるまで反復を完了しない

## Result 契約（最小契約）

実行担当サブエージェントは以下のいずれか1状態を返す:

| result | 意味 | 成果物 |
|--------|------|--------|
| `completed-pr` | 実装完了、PR作成済み | **PR番号**を伴う。case-run の成功成果は PR 作成である |
| `blocked` | 回答可能な blocker に遭遇 | 詳細本文は **Issue コメント** に SSoT として記録される |
| `failed` | repository context で回答不能な blocker | 詳細本文は **Issue コメント** に構造化して記録される |
| `delegation-unavailable` | 実行インフラが委譲を起動できなかった状態 | 実行未試行のため `pending` に戻す（REQ-0162-004） |

### SSoT（信頼できる情報源）

| 状態 | SSoT |
|------|------|
| 成功（completed-pr） | **PR 本文** |
| blocked/ failed | **Issue コメント** |

一時会話コンテキスト、ローカル変数、中間ファイルは SSoT としない。

## 責務境界（非対象）

本プロトコルは以下を扱わない。各責務主体に委譲する:

| 非対象 | 責務主体 |
|--------|----------|
| workflow state 管理（Issue/PR/worktree） | case-run |
| 複数 Issue/ Epic orchestration | case-auto/ case-run |
| Issue 完了条件チェックボックスの評価、更新 | case-close |
| 完了条件チェックボックスの最終完了判定 | case-close |
| req-define のアーキテクチャ確認 | `agentdev-architecture-advisory` |

実行担当サブエージェント、外部実行基盤は Issue 本文の完了条件チェックボックスを更新しない（PR 作成後に case-close が別コンテキストで評価する）。

## worktree 隔離の遵守（禁止事項）

実行担当サブエージェントは worktree root（`.worktrees/{N}-{type}/`）以外のパスでファイル編集を行わない。
case-run から引き渡された worktree root（相対パス）配下でのみ作業する。
メインリポジトリを汚染しないための構造的保証（適用範囲対象外「case-run の worktree 隔離フェーズ」の前提）を、実行時にも遵守する。

| 禁止事項 | 違反時の対応 |
|--------|----------|
| worktree root 以外のパス（メインリポジトリルート直下、他 worktree 等）でのファイル編集 | メインリポジトリでの作業を検知した場合は直ちに作業を停止し、`failed` として result を返却する。詳細本文は Issue コメントに SSoT として構造化して記録する |
| メインリポジトリパスを引き渡し、使用すること | case-run は worktree root（相対パス）のみを引き渡す。実行担当サブエージェントは受け取った worktree root 配下でのみ作業する |

**自己検証**: 実装作業開始前に `agentdev-git-worktree` の検証ヘルパー（`.opencode/skills/agentdev-git-worktree/references/worktree-operations.md`「worktree 内判定ヘルパー」参照）で現在 worktree 内にいることを自己検証する。
メインリポジトリにいると判定された場合は実装を開始せず `failed` として result を返却する。

## Findings/ Capture 配置

本筋外の検出事項（Findings）/ Capture 候補（intake/ learning）は **PR 本文** の `## Findings / Capture候補` セクションに記述する。
capture 境界の詳細は `agentdev-workflow-orchestration` を参照。
実行担当サブエージェントは `.agentdev/intake/`、`.agentdev/learning/` を直接変更しない。


## SPEC確定候補配置


実装時に発見された SPEC レベルの詳細（SPEC に記載すべき schema、enum、判定表、内部アルゴリズム等）は PR 本文の `## SPEC確定候補` セクションに記録する。
`## Findings / Capture候補` とは別セクションとし、混在させない。
実行担当サブエージェントが記録し、case-close Step 3 の SPEC 確定チェックの入力となる。


## 外部成果物の取扱い


外部実行基盤の結果は **PR URL** で受領する（透明）。
plan artifact 等の中間成果物の内部構造には依存しない。
実行担当サブエージェントは中間成果物の内部構造に依存した処理、検証を行わず、result 契約（4状態）のみで接合する。
AgentDevFlow の永続状態は既存の draft/ Issue/ PR/ REQ/ ADR/ SPEC に限定し、中間成果物を永続状態として扱わない。

## 委譲抽象IF

- case-run は adapter skill（`agentdev-case-run-execution-adapter`）を読み込んだ実行担当サブエージェントへ委譲を起動する（委譲 prompt 内で実行 command を指定）。起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md に配置する（REQ-0162-002）。
- 委譲プロンプト: 実行 command を prompt 内で指定し Issue #N の実装を指示する（command の具体名は AGENTS.md 参照）
- 委譲起動方式の具体的な実装（実行担当サブエージェント起動、委譲 prompt 構築、evidence 確認、result 受領）は `references/<harness>.md` 参照
- 実行担当サブエージェントが利用不可の場合は委譲起動失敗として検知される。後述「委譲起動失敗、異常終了時事後処理」に従う
- Issue 本文に req-define 壁打ち合意の実行計画方向性（参考情報）が含まれ得る。実行担当サブエージェントはこれを参考情報として扱い、束縛されない

## 委譲プロトコルと category 設計（REQ-0163）

adapter skill 経由の委譲は、case-run に限らず subagent 委譲する全場面（case-auto/ case-open/ case-run/ case-update/ case-close）で共通する category 設計と MUST NOT DO 記載の要件に従う（REQ-0163-001/002/003、Issue #1538 由来）。本節は委譲プロトコルと category 設計の関係を整理し、事務的手続きで `unspecified-high` を推奨する根拠を明示する。

### `writing` category の発火スキルとの相互作用

`writing` category は執筆作業（docs 記述、article 作成、REQ/ ADR/ SPEC 本文執筆等）を想定した category であり、`japanese-tech-writing` 等の発火スキルと結合する設計である。事務的手続きの委譲に `writing` を使用すると、subagent が発火スキルの文書監査・校正的振る舞いに引きずられ、本来責務（Issue 作成、VERIFY、状態遷移等）から逸脱するリスクがある。

Issue #1538 では case-auto から case-open を `category=writing` で委譲した際、subagent が文書監査ファイル生成（`japanese-audit`、`replacement-dictionary` 等、case-open 責務外）と draft 作成（`.agentdev/drafts/` 配下）へ逸脱した。`category=unspecified-high` と MUST NOT DO 強化プロンプトで解消したが、選定基準が未明文化だったため本 REQ で要件化した。

### 事務的手続きで `unspecified-high` を推奨する根拠

`unspecified-high` は特定の発火スキルと結合しない既定の category であり、事務的手続き（Issue 作成、VERIFY、ラベル設定、状態遷移、コメント追加等）の委譲に適する。理由は以下の通り:

- 発火スキルによる振る舞い誘導が発生しないため、subagent が委譲 prompt の指示通りに事務的手続きへ集中する
- `writing` 等の特定 category と異なり、command 名と category 名の意味的距離が大きくても subagent の振る舞いを誤誘導しない
- 事務的手続きは evidence-backed な成果物（Issue 番号、PR 番号、VERIFY 結果等）が明確であり、特定 category の文脈を必要としない

### category 選定ガイドラインと MUST NOT DO 必須化の適用

adapter skill 経由の委譲（case-run からの実行担当サブエージェント委譲を含む）は、以下を満たす:

- **category 選定（REQ-0163-001）**: 委譲先 command の責務と category 名の意味的距離を評価し、誤誘導しない category を選定する。事務的手続きには `unspecified-high` を推奨し、`writing` は執筆作業のみに限定する
- **MUST NOT DO 必須（REQ-0163-002）**: 委譲 prompt に MUST NOT DO セクションを必須で記載する。当該 command 責務外のファイル作成、REQ/ SPEC/ src の直接修正、文書監査の実施、capture 境界を超える `.agentdev/` 直接変更等を列挙する
- **プロンプトテンプレート（REQ-0163-003）**: category 選定基準と MUST NOT DO 記載要件を統合した形式とし、特定 command 名と category 名の意味的距離が大きい場合の注意事項を含む

adapter skill は本要件を宣言的に定義し、case-run からの委譲 prompt 構築時に参照される。詳細な category 選定ガイドラインは `case-auto.md` の「Subagent 委譲プロトコル」節、MUST NOT DO 記載要件は `agentdev-workflow-orchestration/references/capture-boundaries.md` 参照。

## ハーネス制約適応（call_omo_agent schema 制約時）

adapter skill は `call_omo_agent` ツール schema が custom agent 型（実行担当サブエージェント型）を許可しないハーネス環境で動作することを前提とする（REQ-0149-012）。
oh-my-openagent 等のハーネスでは explore/ librarian 型のみが許可され、Epic Wave 並列委譲（最大5件）も機能しない。

### 事前 probe（ハーネス能力検出）

case-run は委譲起動前にハーネス能力を probe し、実行担当サブエージェント型が起動可能かを判定する。

1. **probe 対象**: `call_omo_agent`（または同等の委譲起動 API）が受け入れる `subagent_type` の一覧
2. **probe 方法**: harness 固有。AGENTS.md および `references/<harness>.md` 参照（REQ-0162-002）
3. **判定結果**:
 - 実行担当サブエージェント型が許可される → 通常委譲パス（前節「委譲抽象IF」）
 - 実行担当サブエージェント型が不許可 → 後述「インライン逐次実行」へ移行

### Inability の冒頭明示

probe の結果、委譲が利用不可の場合、case-run はインライン実行へ移行する旨を冒頭で明示する。
最終的な SSoT は result 契約に従う（completed-pr → PR 本文、blocked/ failed → Issue コメント）。

明示内容は以下の3点である:

- **制約事実**: `call_omo_agent` schema が custom agent 型を許可しないこと
- **影響範囲**: 1 Issue 単位の委譲不可、Epic Wave 並列委譲不可
- **採用措置**: インライン逐次実行で adapter protocol に従うこと

### インライン逐次実行時の adapter protocol 遵守

委譲が利用不可の場合、case-run の実行コンテキストが adapter skill を読み込み、インラインで逐次実行する。
この場合も本スキルの定める adapter protocol に従う:

- worktree root 配下のみ編集（「worktree 隔離の遵守（禁止事項）」）
- Issue 読込 → context 再確認 → 実装 → 検証 → PR 作成の順序（「実行担当サブエージェントの責務」）
- test strategy 項目の test-fix ループ（「test strategy 項目の test-fix ループ（REQ）」）
- result 契約（4状態）の維持（「Result 契約（最小契約）」）。委譲を起動していないため `delegation-unavailable` は返さず、`completed-pr` / `blocked` / `failed` のいずれかを返す
- Findings / SPEC確定候補の配置規約（「Findings/ Capture 配置」「SPEC確定候補配置」）

### Epic Wave 並列委譲不可時の運用

`#epic` 指定時も本制約により Wave 内の子Issue 並列委譲（最大5件）は機能しない。
case-run は現在 ready な Wave の子Issue を順次（インライン逐次）処理する。
Wave 境界（PR マージ）は case-close が担うため本適応の対象外。

### 既存フォールバックパスとの関係

本節は事前 probe による**委譲起動前**の適応である。
次節「委譲起動失敗、異常終了時事後処理」は**委譲起動後**の異常終了に対する事後処理である。
両者は対象段階が異なり、重複しない。委譲起動の可否に応じて使い分ける。

## 委譲起動失敗、異常終了時事後処理

実行担当サブエージェントの委譲起動失敗、異常終了時（エージェント型利用不可、異常終了、実行 command 内部エラー等）は即 `failed` とせず**実装完了、検証未完了**として扱い、以下の手順で事後処理する:

1. **委譲起動失敗状況確認**: 委譲 result が異常終了、空、エラー含みの場合、実行担当サブエージェントが実装をどこまで進めたかを worktree で確認する
2. **worktree git status 確認**: worktree で `git status`、`git diff --stat` を実行し、未コミット変更の有無を確認する
3. **変更残留時の分類**:
 - **未コミット変更あり**: 実装が進捗している可能性が高い。以下の検証ステップに進む
 - **未コミット変更なし**: 実装が開始されていない、または実行担当サブエージェントがクリーンアップ済み。`failed` として処理し、Issue コメントに状況を構造化記録する
4. **残留箇所の grep 検出**（未コミット変更ありの場合）:
 - Issue の完了条件、受け入れ基準から抽出したキーワードで `git diff` 内容を grep し、実装の網羅性を確認する
 - テスト実行（`bun test`、`bunx tsc` 等）を実施し、実装が検証可能な状態か確認する
5. **手動修正または PR 化**:
 - 検証が通る場合: 未コミット変更をコミットし、PR を作成して `completed-pr` として処理する。PR 本文の `## Findings / Capture候補` に「実行担当サブエージェント委譲異常終了、事後処理で PR 化」を記録する
 - 検証が通らない、実装が不完全: `blocked`（回答可能な場合）または `failed`（repository context で回答不能）として処理し、Issue コメントに状況を構造化記録する

事後処理で PR 化した場合、`completed-pr` の SSoT は PR 本文（他の completed と同じ）。
委譲異常終了事実は PR 本文の Findings セクションに明記する。

## See Also

- **agentdev-workflow-orchestration**: サブエージェントプロトコル、capture 境界
- **agentdev-workflow-templates**: PR 本文、コメント SSoT のテンプレート構造
- **references/<harness>.md**: 委譲起動の具象実装ノート



