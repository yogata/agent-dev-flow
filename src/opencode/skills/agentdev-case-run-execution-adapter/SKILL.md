---
name: agentdev-case-run-execution-adapter
description: "case-run external execution adapter. USE FOR: connecting case-run issue execution to Sisyphus-Junior via task() delegation (adapter skill + 委譲 prompt 内 `/ulw-loop` command), handling completed(pr)/blocked/failed results. DO NOT USE FOR: req-define architecture review, ADR judgment, workflow state management, or Issue completion checkbox evaluation."
---

# case-run 外部実行アダプター（External Execution Adapter）

case-run が1 Issue 単位（または1 Wave 単位）の実装作業を実行担当サブエージェント（Sisyphus-Junior）へ接続する際のアダプタープロトコル（adapter protocol）を定義する知識ベース。
委譲境界および CLI subprocess 廃止、task()（adapter skill + 委譲 prompt 内 `/ulw-loop` command）委譲に基づく。
対象を case-run に限定する。

- **参照元**: `case-run`（Sisyphus-Junior 起動時）
- **特性**: アダプタープロトコルの宣言的定義のみ提供する。Epic/Wave orchestration、worktree 管理、完了条件チェックボックス評価は本スキルの対象外。

## 実行モデル

```
case-run (orchestration)
  └── task(subagent_type="Sisyphus-Junior", load_skills=["agentdev-case-run-execution-adapter"], prompt="/ulw-loop Implement Issue #N: ...")
        ├── Issue 本文・受け入れ基準読込（委譲 prompt 内 `/ulw-loop` command が success criteria に分解）
        ├── ADR / REQ / SPEC / docs / repository context 再確認
        ├── `/ulw-loop` command による evidence-backed 実装・品質ゲート（code review + QA review + gate review）
        ├── test strategy 項目の test-fix ループ（項目ごと検証、不合格時 fix-and-reverify / record-in-findings、全項目処理まで反復）
        ├── blocker 処理
        ├── PR 作成手続き（agentdev-gh-cli）による PR 作成（PR URL を result に格納）
        └── result を case-run へ返却
```

- **case-run 本体**: 単一 Issue または単一 Wave（Epic Issue 指定時、最大5件並列）で Sisyphus-Junior を `task()` 起動し、result を処理する。実装実行そのものは行わない。`task(subagent_type=...)` 以外の起動方式（CLI subprocess 等）は使用しない。
- **実行担当サブエージェント（Sisyphus-Junior）**: oh-my-openagent 提供の OpenCode ネイティブエージェント型。CLI subprocess を介さず oh-my-openagent の実行エンジンを直接利用する。1 Issue あたり1起動。`load_skills=["agentdev-case-run-execution-adapter"]` で adapter skill を読み込み、委譲 prompt 内で `/ulw-loop` command を起動する。仕様を再解釈、再設計しないアダプターである。
- **`/ulw-loop` command**: 委譲 prompt 内で指定される実行 command（skill ではない）。Issue を success criteria に分解、各 criterion に observable evidence を要求、品質ゲートを実行する。監査トレイル（`.omo/ulw-loop/ledger.jsonl`）は worktree 配下に配置され、worktree 削除時に破棄される。各ツール呼び出しは120秒 timeout で保護される。
- **外部実行ハーネス（oh-my-openagent）**: Sisyphus-Junior の背後で実行エンジンとして振る舞う。plan artifact 等の中間成果物の内部構造には依存しない。最終結果は **PR URL** で受領する（透明）。

## 実行担当サブエージェントの責務

Sisyphus-Junior は以下を順に実行する:

1. **Issue 読込**: 対象 Issue 本文、受け入れ基準を読み込む。ulw-loop が Issue を success criteria に分解する
2. **context 再確認**: ADR/ REQ/ SPEC/ docs/ repository context を再確認し、実装が既存の決定事項に矛盾しないことを担保する
3. **実装、検証、PR 作成**: ulw-loop に従い evidence-backed に実装を実行し、品質ゲートを通して PR 作成手続き（agentdev-gh-cli）で PR を作成する。ハーネスの plan artifact 等の中間成果物は解釈せず、PR URL で最終結果を受領する。実装完了後、Issue 本文の test strategy 項目の test-fix ループ（後述「test strategy 項目の test-fix ループ」）を実行する
4. **blocker 処理**: 回答可能な blocker（ADR/REQ/SPEC/docs/Issue本文で回答できるもの）は自律的に ulw-loop 内で再評価できる
5. **result 返却**: 後述の result 契約に従い case-run へ返却する

## test strategy 項目の test-fix ループ（REQ-0130-030）

Sisyphus-Junior は実装完了後、Issue 本文のテスト戦略セクションに含まれる各 test strategy 項目（3要素構造: verification / pass_criteria / on_failure）について以下のループを実行する。全項目の処理が完了するまで反復する。

1. **項目ごとの検証**: 各 test strategy 項目の `verification` 手順に従い検証を実行し、`pass_criteria` を満たすか確認する
2. **不合格時の処置**: 検証結果が `pass_criteria` を満たさない場合、当該項目の `on_failure` に従い以下いずれかを実行する:
   - **fix-and-reverify（実装修正して再検証）**: 実装を修正し、当該項目の検証を再実行する。再検証で合格するまで修正と再検証を反復する
   - **record-in-findings（Findings 記録）**: 実装修正で対応困難な場合（仕様上の制約、スコープ外の原因等）、当該項目を不合格理由とともに PR 本文の `## Findings / Capture候補` セクションに記録する
3. **全項目処理までの反復**: 未処理の test strategy 項目が残る場合、1〜2 を繰り返す。全項目が「合格」または「Findings 記録済み」のいずれかに分類されるまで反復を完了しない

## Result 契約（最小契約）

Sisyphus-Junior は以下のいずれか1状態を返す:

| result | 意味 | 成果物 |
|--------|------|--------|
| `completed(pr)` | 実装完了、PR作成済み | **PR番号**を伴う。case-run の成功成果は PR 作成である |
| `blocked` | 回答可能な blocker に遭遇 | 詳細本文は **Issue コメント** に SSoT として記録される |
| `failed` | repository context で回答不能な blocker | 詳細本文は **Issue コメント** に構造化して記録される |

### SSoT（信頼できる情報源）

| 状態 | SSoT |
|------|------|
| 成功（completed(pr)） | **PR 本文** |
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
| req-define のアーキテクチャ確認 | `agentdev-architecture-advisory`（oracle） |

Sisyphus-Junior、oh-my-openagent 実行エンジンは Issue 本文の完了条件チェックボックスを更新しない（PR 作成後に case-close が別コンテキストで評価する）。

## worktree 隔離の遵守（禁止事項）

Sisyphus-Junior は worktree root（`.worktrees/{N}-{type}/`）以外のパスでファイル編集を行わない。
case-run から引き渡された worktree root（相対パス）配下でのみ作業する。
メインリポジトリを汚染しないための構造的保証（適用範囲対象外「case-run の worktree 隔離フェーズ」の前提）を、実行時にも遵守する。

| 禁止事項 | 違反時の対応 |
|--------|----------|
| worktree root 以外のパス（メインリポジトリルート直下、他 worktree 等）でのファイル編集 | メインリポジトリでの作業を検知した場合は直ちに作業を停止し、`failed` として result を返却する。詳細本文は Issue コメントに SSoT として構造化して記録する |
| メインリポジトリパスを引き渡し、使用すること | case-run は worktree root（相対パス）のみを引き渡す。Sisyphus-Junior は受け取った worktree root 配下でのみ作業する |

**自己検証**: 実装作業開始前に `agentdev-git-worktree` の検証ヘルパー（`.opencode/skills/agentdev-git-worktree/references/worktree-operations.md`「worktree 内判定ヘルパー」参照）で現在 worktree 内にいることを自己検証する。メインリポジトリにいると判定された場合は実装を開始せず `failed` として result を返却する。

## Findings/ Capture 配置

本筋外の検出事項（Findings）/ Capture 候補（intake/ learning）は **PR 本文** の `## Findings / Capture候補` セクションに記述する。
capture 境界の詳細は `agentdev-workflow-orchestration` を参照。
Sisyphus-Junior は `.agentdev/intake/`、`.agentdev/learning/` を直接変更しない。


## SPEC確定候補配置


実装時に発見された SPEC レベルの詳細（SPEC に記載すべき schema、enum、判定表、内部アルゴリズム等）は PR 本文の `## SPEC確定候補` セクションに記録する。
`## Findings / Capture候補` とは別セクションとし、混在させない。
Sisyphus-Junior が記録し、case-close Step 3 の SPEC 確定チェックの入力となる。


## 外部成果物の取扱い


oh-my-openagent 実行エンジンの結果は **PR URL** で受領する（透明）。
plan artifact 等の中間成果物の内部構造には依存しない。
Sisyphus-Junior は中間成果物の内部構造に依存した処理、検証を行わず、result 契約（3状態）のみで接合する。
AgentDevFlow の永続状態は既存の draft/ Issue/ PR/ REQ/ ADR/ SPEC に限定し、中間成果物を永続状態として扱わない。

## task() 委譲抽象IF

- case-run は OpenCode プラグインとして導入された oh-my-openagent のエージェント型（Sisyphus-Junior）を `task(subagent_type="Sisyphus-Junior", load_skills=["agentdev-case-run-execution-adapter"])` 経由で起動する（委譲 prompt 内で `/ulw-loop` command を指定）。CLI subprocess（bunx/ npx 経由の oh-my-openagent CLI 起動）は使用しない。
- 委譲プロンプト: `/ulw-loop Implement Issue #N: <Issue本文>`
- task() 起動方式の具体的な実装（Sisyphus-Junior 起動、ulw-loop prompt 構築、evidence 確認、result 受領）は `references/oh-my-openagent.md` 参照
- Sisyphus-Junior エージェント型が利用不可の場合は task() 起動失敗として検知される（廃止）。後述「task() 起動失敗時事後処理」に従う
- Issue 本文に req-define 壁打ち合意の実行計画方向性（参考情報）が含まれ得る。Sisyphus-Junior はこれを参考情報として扱い、束縛されない

## task() 起動失敗、異常終了時事後処理

Sisyphus-Junior の task() 起動失敗、異常終了時（エージェント型利用不可、異常終了、ulw-loop 内部エラー等）は即 `failed` とせず**実装完了、検証未完了**として扱い、以下の手順で事後処理する:

1. **task() 失敗状況確認**: task() result が異常終了、空、エラー含みの場合、Sisyphus-Junior が実装をどこまで進めたかを worktree で確認する
2. **worktree git status 確認**: worktree で `git status`、`git diff --stat` を実行し、未コミット変更の有無を確認する
3. **変更残留時の分類**:
 - **未コミット変更あり**: 実装が進捗している可能性が高い。以下の検証ステップに進む
 - **未コミット変更なし**: 実装が開始されていない、または Sisyphus-Junior がクリーンアップ済み。`failed` として処理し、Issue コメントに状況を構造化記録する
4. **残留箇所の grep 検出**（未コミット変更ありの場合）:
 - Issue の完了条件、受け入れ基準から抽出したキーワードで `git diff` 内容を grep し、実装の網羅性を確認する
 - テスト実行（`bun test`、`bunx tsc` 等）を実施し、実装が検証可能な状態か確認する
5. **手動修正または PR 化**:
 - 検証が通る場合: 未コミット変更をコミットし、PR を作成して `completed(pr)` として処理する。PR 本文の `## Findings / Capture候補` に「Sisyphus-Junior task() 異常終了、事後処理で PR 化」を記録する
 - 検証が通らない、実装が不完全: `blocked`（回答可能な場合）または `failed`（repository context で回答不能）として処理し、Issue コメントに状況を構造化記録する

事後処理で PR 化した場合、`completed(pr)` の SSoT は PR 本文（他の completed と同じ）。
task() 異常終了事実は PR 本文の Findings セクションに明記する。

## See Also

- **agentdev-workflow-orchestration**: サブエージェントプロトコル、capture 境界
- **agentdev-workflow-templates**: PR 本文、コメント SSoT のテンプレート構造
- **references/oh-my-openagent.md**: task()/ulw-loop 委譲の具象実装ノート



