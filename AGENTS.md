<!-- ADF-COVERS(implementation): REQ-102-001, REQ-102-002, REQ-102-003, REQ-102-004, REQ-122-002 -->
# AGENTS.md

AgentDevFlow を編集するエージェント向けのリポジトリガイドレール。

## 行動規範

- **実験前提の3原則（最上位ルール）**: 本節の他の行動規範に矛盾する場合に優先する。判断根拠と採用判断の正は `docs/designs/foundations/design-principles.md`「## 0. 実験前提の3原則（最上位ルール）」節と DEC-064（accepted）にある。
  1. 実験・ロールバック許容: 本リポジトリの変更は実験として扱い、Git 履歴による復元でロールバックに対応する。対照表・バックアップ資産などの防衛的恒久資産の維持を移行・整理の前提条件としない。
  2. 後方互換性の完全破棄: 旧表記・旧パス・旧契約への移行補助層（crosswalk、Baseline、マイグレーションスクリプト）を恒久資産として維持せず、LLM/スクリプトによる一括直接修正を標準手段とする。履歴性は Git 履歴で担保する。
  3. 測定不能停滞の排除と二択即決: 再評価条件が実測不能・確定不能のままの保留（測定待ち）を禁止し、測定待ち案件は「仮説の即時導入」または「完全削除」の二択で即決する。完全削除処分は処分理由の明示をもって決済記録とし、黙認と区別する。deferred 機構（REQ-038-006）と blocked 機構（REQ-120）そのものは存続させ、「測定待ちを理由とする保留」のみを禁止する（狭義解釈）。
- 基本言語は日本語。例外無く、中国語での出力を禁止する。文章表層品質の執筆規範の参照語彙は `agentdev-textlint-guard` Plugin（配布資産として維持）の標準規則と用語 prh 辞書とする。本体リポジトリにおける textlint 自動検査運用（プロジェクト側設定・書込み前検査・最終検査）は DEC-065 により終了済みであり、参照語彙としてのみ利用する。
- 思考・thinking・出力における基本言語は日本語。
- 文書種別の配置基準、用語政策（英字許容リスト、訳語表）は `docs/designs/responsibilities/document-type-responsibilities.md` を参照すること。
- req-define に構造化された要件が渡された場合は別エージェントでの使用を想定し、AskUserQuestion を使用せずに質問すること。
- 本リポジトリは AgentDevFlow プラグインを管理する。
- Windows 環境で既存 UTF-8（BOM なし）ファイルを編集する際は edit ツール（per-line string replace）を優先し、Write ツール（全面上書き）は新規ファイル作成時に限定すること。Write ツールが既存 UTF-8 ファイルを cp932 で書き出し文字化けを生む事象が実証済みのため。
- Windows 環境で PowerShell 標準 cmdlet（Get-Content / Set-Content）経由の既存 UTF-8（BOM なし）/LF ファイル一括読み書きは避けること。cp932 解釈や CRLF 書き出しによりファイルを破壊し得るため、標準手段は edit ツール、node の readFileSync/writeFileSync、[System.IO.File] の明示エンコーディング指定とする。詳細は `docs/knowledge/windows-powershell-bulk-io-corruption.md` を参照すること。
- Windows 環境で PowerShell のリダイレクト演算子（`>` / `>>` / `*>`）やパイプによるファイル出力も、cp932 再符号化による UTF-8 破損の対象である。証跡退避を含むファイル出力は上記の標準手段で行うこと。詳細は `docs/knowledge/windows-powershell-bulk-io-corruption.md` を参照すること。
- worktree 操作（実装、検証、証跡退避を含む）中の書込み guard 運用指針は `src/common/skills/agentdev-git-worktree/references/worktree-operations.md`「書込み guard 運用指針」節を参照すること。guard による書込みブロックは fail-closed として維持し、ブロック解除・迂回ではなく標準手段へ切替する。
- 同一ファイルへの複数 edit は、相互非依存の oldString 選択または順次実行に限定する。書込み guard によるブロック（fail-closed 拒否）後は、grep 等の実取得でファイルの現在状態を確認してから oldString を組み立てて再適用する。guard の解除・迂回を行わない。詳細は `src/common/skills/agentdev-git-worktree/references/worktree-operations.md`「同一ファイルへの複数 edit の規律」節を参照すること。

## ハーネス選定

- oh-my-openagent を導入済み
- Git 操作（push を含む）の認証は非対話経路で設定済みであり、対話認証の待機なしに対象の Git 操作が完了する。認証失敗、対話要求、タイムアウトを検出した場合は、待機を反復せず失敗、必要な処置、再開条件を報告する。資格情報の値を解析証拠やログへ出力しない。設定手順と当環境の認証経路実績は `docs/knowledge/git-noninteractive-auth.md` を参照すること。
