# 学びアーカイブ（生きている learning プール）

未処分・保留中・再評価対象の learning item を保持する生きている learning プール（SHALL）。
/agentdev/learning-refine の実行時に inbox.md から移動されたエントリが格納され、/agentdev/learning-promote の処分判定や /agentdev/learning-refine の prune によって動的に変化する。

永久保存先ではなく、処分済みの learning item は削除される。昇格対象の根拠は staging スタブに残す。

## エントリフォーマット（13項目 + 移動日）

```markdown
## YYYY-MM-DD: タイトル

- **問題事象**: 何が起きたか
- **発生局面**: いつ/どこで発生したか。例: 実装、CI、レビュー、デプロイ
- **検知方法**: どう検知したか。例: CI失敗、lint警告、レビュー指摘、手動確認
- **根本原因**: なぜ起きたか
- **自律対応内容**: エージェントがどう修正・回避・対応したか
- **ユーザー確認有無**: ユーザー確認が関与したか。あり/なし
- **ADR/REQ/spec影響**: ADR/REQ/specへの影響可能性。なし、または具体的な影響先
- **横展開観点**: 同種の状況への適用方法
- **再発条件**: どのような条件で再発するか
- **予防策候補**: 将来の予防方法
- **想定反映先**: 反映先。例: コマンド/スキル/テンプレート/docs
- **関連**: 関連ファイルパス、Issue番号等
- **タグ**: `#タグ1` `#タグ2`
- **移動日**: YYYY-MM-DD（/agentdev/learning-refine実行日）

---
```

## 旧フォーマット互換

過去のエントリ（5項目形式: 事象/原因/対策/関連/タグ）は /agentdev/learning-refine 実行時に正規化される。

正規化マッピング:
- 状況/事象 → 問題事象
- 原因 → 根本原因
- 解決策/対策/教訓 → 自律対応内容（解決策・対策）/ 予防策候補（教訓）

## Prune ポリシー

archive.md は append-only ではなく、以下のタイミングでエントリが削除される:

- **refine 時 prune**（MAY）: 長期間再発していない単発レアケース。ただし判断基準・技術知識・プロジェクト固有知識を含む learning item は削除不可
- **promote 時 prune**（SHALL）: staged / rejected / duplicate の learning item。deferred・未処分の learning item は削除不可

---

## 2026-05-17: issue-backlog由来Issueの不明確さへの対処方針

- **問題事象**: issue-backlogで抽出した子Issue（例: staff-schedule#739）が、元issue/PRの「対象外」1行文のみを出典とするため、概要がタイトルの再述に過ぎず極めて不明確になった
- **発生局面**: 実装
- **検知方法**: Issue着手時の要件確認
- **根本原因**: issue-backlogは壁打ちフェーズのショートカット経路であり、構造的抽出のみを行う設計。元ソースに情報が少ない場合、深掘り能力がない（設計上の制約）
- **自律対応内容**: 方針Cを採用 — backlog Issueは「まだらな未整理リスト（プレースホルダー）」として許容し、着手時にissue-reqで壁打ち深掘りするフローを確立。フロー: issue-backlog（粗いIssue作成）→ 着手時にissue-req（壁打ち）→ issue-save-req（docs保存）→ issue-update（既存Issue更新）→ issue-work（実装）。既存Issue更新はissue-createではなくissue-updateを使用する点に注意
- **ユーザー確認有無**: あり
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 自動抽出によるIssue作成では、元ソースの情報量がそのままIssue品質の上限になる。情報量が少ないソースからの抽出では「粗いIssue + 後段での壁打ち」パターンが適用可能
- **再発条件**: issue-backlogで情報量の少ないソースからIssueを抽出する場合
- **予防策候補**: issue-backlog実行時に情報量の少ないIssueには「要壁打ち」ラベルを付与する
- **想定反映先**: `intake-open` コマンド
- **関連**: `.opencode/commands/issue/issue-backlog.md`
- **タグ**: `#ワークフロー` `#issue-backlog` `#要件定義` `#プロセス設計`
- **移動日**: 2026-05-22

---

## 2026-05-17: Markdownコマンド定義の段階的拡張

- **問題事象**: issue-work コマンドに複数Issue並列実行を追加する必要があった（135行→244行）
- **発生局面**: 実装
- **検知方法**: 機能追加要件の発生
- **根本原因**: 既存の単一Issueフローを壊さずに新機能を組み込む必要があった
- **自律対応内容**: Step 0 の条件分岐で新旧パスを分離。分岐点で「有効数 = 1 → 従来フロー、≥2 → 新モード」とし、Steps 1-12 の内容は一切変更しない。新モード専用の Step 0b/0c/Phase D を追加
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 既存Stepの内容不変 + 分岐点でのみ新規パスを注入するパターンは、他のコマンドでも後方互換性を保つ拡張に適用可能
- **再発条件**: 既存コマンドに新機能を追加する場合
- **予防策候補**: 拡張時は分岐点のみの変更とし、既存パスのロジックは不改変とする設計原則を明文化する
- **想定反映先**: コマンド設計ガイドライン、`case-run` コマンド
- **関連**: `.opencode/commands/issue/issue-work.md`
- **タグ**: `#コマンド設計` `#後方互換性` `#段階的拡張`
- **移動日**: 2026-05-22

---

## 2026-05-17: LLM + 正規表現ハイブリッド分析

- **問題事象**: 複数Issue間の依存関係判定で正規表現単独では「トリプル化に伴き」等の暗黙的依存を見逃した（バックテストで判明）
- **発生局面**: 実装
- **検知方法**: バックテスト
- **根本原因**: 正規表現では自然言語に埋め込まれた暗黙的関係を検出不可
- **自律対応内容**: LLM意味解析を主、正規表現を補助とする2層構成を設計。4レベル分類（L0-L3）の明確な枠組みをプロンプトに与えて判定品質を安定化
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 自然言語に埋め込まれた暗黙的関係の検出にはLLM意味解析を主軸に据え、正規表現は明示的パターンの高速検出に限定する構成が実用的
- **再発条件**: 自然言語から関係性を抽出する必要がある場合
- **予防策候補**: テキスト解析系の設計では必ずLLM + ルールベースの2層構成を検討する
- **想定反映先**: 依存関係解析モジュール
- **関連**: なし
- **タグ**: `#依存関係` `#ハイブリッド分析` `#プロンプト設計`
- **移動日**: 2026-05-22

---

## 2026-05-22: skill rename 時の directory move は git mv で追跡性を保持

- **問題事象**: `agentdev-commands-creator` を `agentdev-command-creator` にリネームする際、delegate agent が旧ディレクトリの内容を新ディレクトリに Write + 旧ディレクトリを削除する手順を取った。git は自動的に rename として検出したが、手順としては git mv の方が追跡性が高い
- **発生局面**: 実装（case-run Phase B）
- **検知方法**: git diff --cached --stat で `rename` として表示されたことで確認
- **根本原因**: delegate agent が git コマンドを使わず Write/Delete で実装したため
- **自律対応内容**: 結果的に git が rename を正しく検出したため追加対応なし
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: ファイル・ディレクトリのリネームを delegate に指示する際、`git mv` を使うよう明示的に指示すべき
- **再発条件**: ファイル・ディレクトリのリネームを delegate する際
- **予防策候補**: delegate の prompt で「ディレクトリリネームには `git mv` を使用すること」を明記する
- **想定反映先**: case-run コマンドの delegate 指示テンプレート
- **関連**: Issue #326, PR #327
- **タグ**: `#git` `#rename` `#delegate`
- **移動日**: 2026-05-22

---

## Epic #421: 並列PRの順次マージ時コンフリクト予防

- **問題事象**: 5子IssueのPR（#427〜#431）がすべて main から独立して分岐していたため、順次マージ時に6ファイルでマージコンフリクトが発生した。特に PR #430（Wave 3）は Wave 1-2 の変更と多数衝突した
- **発生局面**: 実装（Epic Orchestrator case-run の PR マージフェーズ）
- **検知方法**: Oracle検証でテストマージを実施し発見
- **根本原因**: Epic Orchestrator が各 Wave の subagent に main ベースの worktree を提供し、先行 Wave のマージ結果を後続 Wave のブランチに取り込まなかったため。PR は個別には main に対して CLEAN だが、累積マージ状態に対してはコンフリクトを起こす
- **自律対応内容**: 各PRを順次リベース（main の最新状態に rebase）→ コンフリクト手動解決（テンプレート削除の維持、reference ファイルは --theirs 採用）→ force push → マージ。PR #430 は6ファイルのコンフリクト解消が必要だった
- **ユーザー確認有無**: なし（エージェントが自律的に解決）
- **ADR/REQ/spec影響**: なし。case-run の実行時挙動の問題であり仕様の不備ではない
- **横展開観点**: 2+ Wave の Epic で、後続 Wave が先行 Wave のファイルを変更する場合に常に発生するリスク
- **再発条件**: 1 Epic 内で複数 Wave が共通ファイルを変更し、各ブランチが main から独立分岐している場合
- **予防策候補**: (a) case-run の Epic Orchestrator が各 Wave 開始時に、先行 Wave の累積マージ結果を後続 Wave のブランチに rebase する仕組みを追加、(b) 参照整合性更新（Wave 3等）を最終 Wave としてスケジュールし、先行 Wave をすべてマージ後に worktree を作成する
- **想定反映先**: `agentdev-workflow-orchestration` スキル（Wave実行後のリベース推奨追加）、または case-run コマンド定義（Step 8 以降の PR マージ手順）
- **関連**: Epic #421, PR #427〜#431, `agentdev-workflow-orchestration`
- **タグ**: `#epic-orchestrator` `#merge-conflict` `#wave-scheduling`
- **移動日**: 2026-05-31

---

## Epic #421: case-run サブエージェントの stale 参照見落とし

- **問題事象**: intake-promote.md に10件の stale な `intake-open` 参照が残っていた。5子Issueのいずれも intake-promote.md を更新対象としていなかった（スコープ外判定）
- **発生局面**: レビュー（Oracle検証フェーズ）
- **検知方法**: Oracle検証で `intake-open` 参照の全件grepを実施し発見
- **根本原因**: REQ-0039 のスコープ定義で intake-promote.md が更新対象に含まれていなかった。各子Issueは自身のスコープ内のファイルのみを更新し、他コマンドへの波及効果を検査していなかった
- **自律対応内容**: 該当10件を `intake-open` → `req-backlog` に更新（commit 66bf316）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。実行時の見落とし
- **横展開観点**: コマンドの削除・名称変更を伴う要件変更では、コマンド定義ファイル以外の参照元（他コマンドからの呼び出し、スキル内の参照、テストコード）を常にgrepで網羅確認すべき
- **再発条件**: コマンドの削除・名称変更がスコープに含まれる場合
- **予防策候補**: case-run の実装フェーズで「削除・変更対象キーワードの全コードベースgrep」を必須ステップとする
- **想定反映先**: case-run コマンド定義（乖離検出ステップの強化）
- **関連**: Epic #421, commit 66bf316, intake-promote.md
- **タグ**: `#stale-reference` `#scope-gap` `#intake-open-deletion`
- **移動日**: 2026-05-31

---

## Epic #421: Epic ステータステーブルの更新漏れ

- **問題事象**: Epic #421 のステータス追跡テーブルで、子Issue #422/#425/#423/#424 が `🔄 進行中` のままだった。#426 のみ更新されていた
- **発生局面**: レビュー（Oracle検証フェーズ）
- **検知方法**: Oracle検証で Epic 本文を確認し発見
- **根本原因**: case-run のサブエージェントが親 Epic のステータス更新を行わなかった。Epic Orchestrator の Wave 開始時に親エージェントが一括で `🔄 進行中` に更新したが、完了時の更新は case-close の責務とされており、各サブエージェントは完了報告のみ行った
- **自律対応内容**: 親エージェントが Epic #421 本文を直接編集し、5子Issueすべてを `✅ 完了` に更新
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。`agentdev-epic-tracker` の運用上の問題
- **横展開観点**: Epic Orchestrator の全実行で同様のリスクあり
- **再発条件**: Epic Orchestrator で Wave 完了後にステータステーブルを更新しない場合
- **予防策候補**: Epic Orchestrator の Wave 完了後に、親エージェントが該当 Wave の子Issue ステータスを一括更新するステップを明示的に追加する
- **想定反映先**: `agentdev-workflow-orchestration` スキル（Wave完了後のステータス更新ステップ）
- **関連**: Epic #421, `agentdev-epic-tracker`
- **タグ**: `#epic-orchestrator` `#status-tracking` `#epic-tracker`
- **移動日**: 2026-05-31

---

## Case #452: サブエージェントが完了報告しながらファイルを未編集

- **問題事象**: case-run で委譲したサブエージェントのうち3件が「完了」を報告したが、実際には対象ファイルを編集していなかった（REQ-0043-024 APPEND、REQ-0042-031〜036 APPEND、REQ-0041.md FIX-003）。乖離検出（spec-compliance）で発覚し、手動で再編集した
- **発生局面**: 実装（case-run の委譲タスク完了確認フェーズ）
- **検知方法**: spec-compliance 乖離検出で「対象ファイルに変更がない」ことを検知
- **根本原因**: サブエージェントへの委譲プロンプトに「編集完了後にファイル内容を確認すること」という検証ステップが含まれていなかった。サブエージェントは目標を理解しても実際のファイル書き込みをスキップし、正常終了を報告した
- **自律対応内容**: 乖離検出後、該当3件を手動で直接編集して修正
- **ユーザー確認有無**: なし（乖離検出→自律修正）
- **ADR/REQ/spec影響**: なし。委譲プロンプトの品質問題
- **横展開観点**: 全 case-run の委譲タスクで同リスクあり。特に「ファイル新規作成」「ファイル追記」タスクで発生しやすい
- **再発条件**: サブエージェントに編集タスクを委譲し、委譲プロンプトに事後検証ステップが含まれていない場合
- **予防策候補**: (a) 委譲プロンプトに「編集完了後、Read tool で対象ファイルの該当箇所を読み直し、変更が反映されていることを確認すること（MUST）」を必須ステップとして追加、(b) case-run の Step 完了判定に「対象ファイル diff 確認」を含める
- **想定反映先**: case-run コマンド定義（委譲プロンプトの検証ステップ必須化）
- **関連**: Issue #452, PR #453, REQ-0043.md, REQ-0042.md, REQ-0041.md
- **タグ**: `#subagent-trust` `#delegation-quality` `#spec-compliance`
- **移動日**: 2026-05-31

---

## Case #470: Windows環境でのworktree削除時Permission deniedとリトライ

- **問題事象**: `git worktree remove` 実行時に Permission denied エラーが発生した。`.worktrees/470-feature/.sisyphus/` をクリーンアップした直後でも、プロセスがディレクトリをロックしている可能性があり、1回目の remove が失敗した
- **発生局面**: 実装（case-close Step 7 worktree削除）
- **検知方法**: `git worktree remove` のstderr出力で Permission denied を検知
- **根本原因**: Windows環境ではファイルハンドルが即座に解放されない場合があり、`Remove-Item` 直後のディレクトリ削除でロックが残る。VS Codeのファイルウォッチャーやアンチウイルススキャンが原因の可能性
- **自律対応内容**: クリーンアップ後に `git worktree remove` を再試行し、2回目で成功を確認。`git worktree list` でmainのみ残っていることを検証
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。Windows環境の実行時挙動
- **横展開観点**: Windows環境での全worktree削除操作で発生する可能性あり。agentdev-git-worktreeスキルの削除手順にリトライの言及なし
- **再発条件**: Windows環境で `.sisyphus/` クリーンアップ直後に `git worktree remove` を実行する場合
- **予防策候補**: (a) worktree削除手順に「Permission denied時は短い間隔でリトライ（最大2回）」を追加、(b) クリーンップ後に1秒程度待機してから remove を実行
- **想定反映先**: `agentdev-git-worktree` スキル（worktree削除手順のリトライ記述）
- **関連**: Issue #470, PR #471, `.worktrees/470-feature/`
- **タグ**: `#windows` `#worktree` `#permission-denied` `#retry`
- **移動日**: 2026-05-31

---

## Issue #474: RU作成時の実在確認不足による誤検出項目の混入

- **問題事象**: RU-0001（REQ-0039移行後の整合性ドリフト9項目）のうち3項目（D-01: REQ-0033旧パス参照、D-02: テストファイルstale参照、D-06: ADR-0009 status二重記載）が、case-run の Explore 調査で実際のファイル内容と照合した結果、修正不要（誤検出）と判明した。D-01は対象ファイルが既にretired/に移動済みで該当参照なし、D-02はテストファイル自体が存在しない、D-06は正常な構造であった
- **発生局面**: 実装（case-run の Step 6 Explore 調査フェーズ）
- **検知方法**: case-run での Explore エージェントによる実際のファイル内容確認。RUの記述内容と実際のファイル状態の不一致を発見
- **根本原因**: RU作成（intake → promote → req-backlog）の段階で、ドリフト候補の実際のファイル内容確認が行われず、想定・推測に基づいて項目がリストアップされていた。特にD-02はファイルの存在確認すら抜けていた
- **自律対応内容**: case-run の Explore 調査で実際のファイル状態を確認し、3項目を修正不要と判定してIssue本文に反映。残り6項目のみを実装対象とした
- **ユーザー確認有無**: なし（エージェントが自律的に判定）
- **ADR/REQ/spec影響**: なし。ワークフロー改善の知見
- **横展開観点**: 全RU作成時に同様の実在確認不足が発生する可能性あり。intake-promote や req-backlog での検証強化が考えられる
- **再発条件**: 大規模移行・リファクタリング後のドリフト一括修正で、想定に基づいて変更候補をリストアップする場合
- **予防策候補**: (a) req-backlog でRU生成時に、各ドリフト項目の実際のファイル存在・内容確認を必須ステップとする、(b) intake-promote で promoted artifact に「未検証」フラグを付与し、case-run での検証を明示化する
- **想定反映先**: `agentdev-workflow-lifecycle` スキル（RU生成時の品質ゲート）、または `agentdev-req-file-manager` スキル（intake-promote 段階での検証強化）
- **関連**: Issue #474, PR #475, `.agentdev/backlog/req-units/RU-0001.md`（削除済み）
- **タグ**: `#ru-quality` `#false-positive` `#intake-pipeline` `#drift-detection`
- **移動日**: 2026-05-31

---

## Issue #480: case-close Step 8b での旧仕様による不要な git checkout 実行

- **問題事象**: case-close Step 8b でローカル変更（RU-0001/RU-0005 の欠落）を検出し、旧仕様に従い `git checkout --` でHEADから復元してしまった。これは今回修正したバグ（REQ-0106-015）そのものの事例であり、新しい case-close.md では自動リセットが禁止されている
- **発生局面**: 完了処理（case-close Step 8b 実行前同期）
- **検知方法**: Step 8b の pull 前チェックでローカル変更を検出。旧仕様の自動リセットが実行された
- **根本原因**: Issue #480 の修正内容（case-close.md の Step 8b 自動リセット廃止）がまだ main にマージされる前のタイミングで case-close を実行したため、旧仕様の case-close.md に従ってしまった。自 Issue の修正が自 Issue の close 処理に適用されていない
- **自律対応内容**: pull 後に hash 不一致を検出し、自マージコミット + 外部コミット（PR #484）を分離判定して継続
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。すでに REQ-0106-015〜017 で要件化済み
- **横展開観点**: 自 Issue でコマンド定義を変更する場合、その変更が case-close に適用されるのはマージ後。マージ前の case-close は旧仕様で動作する
- **再発条件**: コマンド定義ファイル自体を変更する Issue の case-close で、変更内容が case-close の動作に影響する場合
- **予防策候補**: (a) コマンド定義を変更する Issue の case-close では、Step 8b の動作を最新の main ではなく PR ブランチの内容で判定する、(b) case-close 実行前に「自 Issue が case-close の動作に影響するコマンド定義を含むか」をチェックし、含む場合は注意喚起する
- **想定反映先**: `agentdev-learning-capture` スキル（再発防止知見として記録済み）
- **関連**: Issue #480, PR #482, REQ-0106-015〜017
- **タグ**: `#self-referential-change` `#case-close` `#git-checkout` `#timing-issue`
- **移動日**: 2026-05-31

---

## Issue #480: post-pull hash 不一致時の自マージ + 外部コミット分離判定

- **問題事象**: case-close Step 8b で pull 後に pre-pull HEAD と post-pull HEAD が不一致。`git log --oneline` で2コミット（自マージ PR #482 + 外部 PR #484）が取り込まれた。自マージのみであれば Step 2-8 の評価はそのまま有効だが、外部コミットが含まれると厳密には再評価が必要
- **発生局面**: 完了処理（case-close Step 8b post-pull 検証）
- **検知方法**: pre-pull HEAD と post-pull HEAD の比較で不一致を検出
- **根本原因**: case-close の pull タイミングと他 PR のマージが競合。自 Issue の PR 以外に別 PR が main にマージされていた
- **自律対応内容**: 外部コミット（PR #484）の内容を確認し、integrity-check の用語是正であり本 case-close の評価対象に影響なしと判定して継続
- **ユーザー確認有無**: なし（実質影響なしと判定して継続）
- **ADR/REQ/spec影響**: なし。case-close の運用上のエッジケース
- **横展開観点**: 複数 PR が同時にオープンされている環境では常に発生する可能性あり
- **再発条件**: case-close の pull タイミングで他 PR がマージされている場合
- **予防策候補**: (a) post-pull hash 不一致時に自マージ以外のコミットが含まれていれば、そのコミットが Step 2-8 の評価に影響するかを確認するステップを明示化する、(b) 影響する場合は Step 2 から再評価する
- **想定反映先**: case-close コマンド定義（Step 8b の hash 不一致時の分離判定フロー）
- **関連**: Issue #480, PR #482, PR #484
- **タグ**: `#case-close` `#hash-mismatch` `#concurrent-merge` `#multi-pr`
- **移動日**: 2026-05-31

---
