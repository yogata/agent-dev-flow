---
name: agentdev-workflow-inspect-docs
description: "inspect-docs command の workflow 実装本体。docs 全体（REQ/Decision/Design/guides/README）の意味整合性診断、配布物整合性検査、検出事項の inbox 出力と git 永続化を所有する（read-only-diagnostic 型、STEP model 対象外）。USE FOR: inspect-docs 実行時の workflow 制御（スキャン対象収集・REQ 体系・文書種別別意味診断・配布物整合性検査・検出事項出力・永続化）。DO NOT USE FOR: 診断対象ファイルの直接修正、検出事項の分類・採用・処分、単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# inspect-docs workflow スキル

inspect-docs command の workflow 実装本体である。
docs 全体（REQ/Decision/Design/guides/README）と配布物の意味整合性診断から、検出事項の `.agentdev/inspect/inbox/` 出力、`.agentdev/inspect/` 配下の git 永続化、完了報告までの制御構造を所有する。

inspect-docs command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜{NNN}）。

## 型判定: read-only-diagnostic型（STEP model 対象外）

本スキルは read-only-diagnostic型（検査対象を直接修正しない診断専用の型）であり、STEP model の対象外である（REQ-{NNNN}-{NNN}）。
**STEP resume point / export / import を持たない**。

- 工程は先頭から通しで実行する。中断が発生した場合は workflow を最初から再実行する（診断は対象の読み取りと検出事項ファイルの生成のみの冪等な処理であり、再実行で同等の結果を得る）
- 会話コンテキストを権威情報源とする再開点の再構成、状態の export / import を本スキルは定義しない

## 入力

- なし（実行時に全対象成果物を自動スキャン）

## 出力

- 診断結果（セッション内テキスト出力 + `.agentdev/inspect/inbox/inspect-docs-finding-{timestamp}.md`）
- 検出事項リスト（観点、対象、根拠、source-of-truth 判定、推奨経路）

## 副作用

- `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成
- `.agentdev/inspect/` 配下の変更に限る git commit/push（commit message: `chore(agentdev): capture inspect-docs finding`）
- 検査対象（docs/、`.opencode/`）のファイル変更は行わない

## 3層責務（deterministic check / semantic diagnosis / finding disposition）

| 層 | 担当 | 本スキルの位置づけ |
|---|---|---|
| deterministic check（機械的検査） | docs-check 等の機械検査レイヤ、決定的検証スクリプト | 対象外。機械的パターンマッチングで判定可能な検査を重複して保持しない |
| semantic diagnosis（意味診断） | inspect-docs workflow（本スキル）、inspect-skills workflow | **本スキルの担当**。docs 体系の意味整合性を診断し検出事項として出力する |
| finding disposition（検出事項の分類・採用） | inspect-promote workflow | 対象外。本スキルは検出事項の分類・採用を行わない |

## 制御平面（工程一覧）

本スキルの工程一覧を次に示す。
STEP ラベルは工程順序の整理ラベルであり、**resume point ではない**（read-only-diagnostic型、REQ-{NNNN}-{NNN}）。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | スキャン対象の収集 | command 実行開始 | 収集済み対象一覧 | [references/scan-and-doc-diagnostics.md](references/scan-and-doc-diagnostics.md) |
| STEP-2 | REQ 体系・文書種別別意味診断 | 対象一覧確定 | REQ/Decision/Design/guides/README の診断結果（診断担当への並列委譲と fan-in 統合後） | [references/scan-and-doc-diagnostics.md](references/scan-and-doc-diagnostics.md) |
| STEP-3 | 配布物整合性検査・route 判定 | STEP-2 完了 | 配布物診断結果、docs-check route 候補、未処理 artifact 確認結果 | [references/distribution-check-and-output.md](references/distribution-check-and-output.md) |
| STEP-4 | 検出事項出力・永続化・完了報告 | STEP-1〜3 の診断結果確定 | 検出事項ファイル、`.agentdev/inspect/` commit/push、完了報告 | [references/distribution-check-and-output.md](references/distribution-check-and-output.md) |

### 工程間の依存と分岐

- STEP-1 → STEP-2 → STEP-3 → STEP-4（分岐なし、常に同一順序で実行）
- スキャン対象ディレクトリが存在しない場合は該当カテゴリを空として扱い警告を出力する（エラー処理は各工程 reference 参照）

## STEP-2 意味診断の並列委譲構造

STEP-2 の意味診断（REQ 体系/6観点、Design、Decision/guides/README）は、範囲が重複しない診断担当への並列委譲で実行する（REQ-{NNNN}-{NNN}）。

- **診断担当分割**: 対象の文書種別で範囲が重複しない診断担当（REQ 体系/6観点担当、Design 担当、Decision/guides/README 担当）へ分割する。大きすぎる範囲は完了できる単位へ切り分ける。6観点の網羅確認は fan-in 後に親が行うため、担当の切り分けは網羅性を損なわない
- **候補整理の前置**: 委譲に先立ち、docs-check（利用可能な環境での実行結果の取り込み）、README 索引、`rg`、正規成果物の直接読取の既存手段で候補を収集し、診断担当ごとの対象範囲と根拠箇所（file:line 形式）へ整理して委譲時に明示する
- **委譲方式の選択**: 同期委譲で完了できる単位では同期方式を利用する。完了できない単位では非同期委譲を用い、子の完了まで親の実行コンテキストを維持する（親は子の完了待ちを明示し、背景子の中断を検出した場合は当該担当のみを再委譲する）
- **読取専用と親の単一 writer**: 診断担当は読取専用であり、検査対象ファイルを変更しない。横断矛盾判定、候補の重複排除、既知 defer/false positive 照合、6観点の網羅確認、finding の生成、git 永続化は親が単一 writer として実施する
- **失敗担当の識別と再実行**: 委譲ごとに担当識別子で結果を回収し、失敗した診断担当だけを同一対象範囲・同一根拠一覧で再委譲する。親による全系統の全面再診断は行わず、失敗回避のための全体逐次化も行わない
- **配布物診断は対象外**: 配布物整合性検査（STEP-3）は並列化の対象外であり、STEP-2 の fan-in 完了後に従来どおり実行する
- **現行工程順序の維持**: 並列化は STEP-2 内の意味診断に限定する。STEP-1 → STEP-2 → STEP-3 → STEP-4 の工程順序と read-only-diagnostic型は変更しない
- **起動手段**: 診断担当の起動手段、待機、並列実行制御の具体は harness 責務であり、AGENTS.md（ハーネス選定）に従う

担当分割表、委譲 prompt 要素、fan-in 手順、失敗再実行手順の詳細は [references/scan-and-doc-diagnostics.md](references/scan-and-doc-diagnostics.md) を参照する。

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-req-structure-diagnostics`: REQ 参照ID整合性、第一参照導線、現行/廃止/世代境界、6観点 structure review、文書分類一貫性、配布物整合性の判定ロジック
- `agentdev-doc-diagnostics`: 診断カテゴリ、共通証拠構造、finding 出力契約、文書種別別診断へのルーティング
- `agentdev-git-worktree`: ドメイン状態永続化プロシージャ（並列実行安全ステージング含む）
- `agentdev-conventional-commits`: commit message 規約
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）

## 候補探索（独立探索手段）

本スキルの構造診断候補の探索と整理は、docs-check（利用可能な環境での実行結果の取り込み。機械的検査を本スキル内で再実装しない）、README 索引、正規成果物の直接読取、`rg` 等の既存手段で行う。
agentdev-traceability の coverage、impact、check を一般文書探索、構造診断、依存関係探索の用途に利用しない。
候補には未解決参照、superseded 成果物への現行参照、参照先が取得できない記述、正規所有者のいない成果物、構造的重複候補を含む（STEP-2 意味診断の入力）。
収集した候補は STEP-2 の並列委譲に先立ち、診断担当ごとの対象範囲と根拠箇所（file:line 形式）へ整理し、委譲時に明示する。

- 決定的検査（参照実在、委譲先 skill 実在、YAML 構文、必須 field）は docs-check、整合性ルール群が所有する。本スキルは探索で得た候補を未検証 evidence として意味診断の入力に利用し、構造診断と意味診断を区別する
- SPLIT、MERGE、MOVE、DUPLICATE、RETIRE、DRIFT 等の意味判断を候補の構造情報だけから確定しない

## 共通制約

- **診断専用**: 許可される副作用は `.agentdev/inspect/inbox/inspect-docs-finding-*.md` の生成と `.agentdev/inspect/` 配下の git 永続化のみ（command ガードレールの範囲）
- **source-of-truth priority**: 現行 REQ > 承認済み Decision > Design > guides の順で矛盾を判定する（command 不変条件）
- **Design 参照は extension 経由**: document-model Design、docs-spec-rebuild-integrity Design 等の分類ポリシー・検査パターンは extension 経由で解決し、Design 内部パスを固定知識として参照しない

## 終了条件（termination）

- 検出事項ファイル（`.agentdev/inspect/inbox/inspect-docs-finding-{timestamp}.md`）の出力が完了している
- `.agentdev/inspect/` 配下の変更が commit/push 済みである（変更なし時は「変更なし」報告済み）
- 完了報告 template（`.opencode/commands/agentdev/templates/inspect-docs/standard.md`）に従った報告を出力した

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **inspect-docs command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
- **`agentdev-workflow-inspect-promote`**: 検出事項の後段（分類・採用）を担当する workflow skill
