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

## cross-skill 参照の false positive: path 存在検査の精度限界

- **問題事象**: `checkScriptTemplateReferencePaths()` が cross-skill の相対パス参照を false positive として8件検出。skill 内からの参照は skill-relative だが、他の skill から参照されるパスはリポジトリルート相対として解釈されるため、実在するファイルが "missing" と判定される
- **発生局面**: 実装（case-run Step 6 の integrity-check 拡張）
- **検知方法**: integrity-check 実行時の 35 ReferencePath results（27 ok, 8 ng）
- **根本原因**: path 存在検査が参照元ファイルのディレクトリを基準に相対パスを解決するが、cross-skill 参照では参照元 skill のディレクトリではなくリポジトリルートが意図されるケースがある。Markdown 内の相対パス解決ルールとファイルシステムの相対パス解決ルールの差
- **自律対応内容**: false positive を既知の制約として受け入れ、完了報告に明記。修正はスコープ外
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（REQ-0108-115/116 の要件は充足）
- **横展開観点**: integrity-check の path 存在検査全般に適用。Markdown 内リンクとファイルシステムパスの解決ルール差異に起因する false positive パターン
- **再発条件**: (1) skill A が skill B のファイルを相対パスで参照、(2) 参照元を基準にパス解決すると実在しないパスになる、(3) リポジトリルート基準なら実在する
- **予防策候補**: (1) 参照元の種別（command/skill）に応じたベースディレクトリ切替、(2) Markdown link 解決ルールの明文化、(3) false positive を抑制する除外パターンの導入
- **想定反映先**: agentdev-integrity の checkScriptTemplateReferencePaths() 改善、または REQ-0108 の path 解決ルール明文化
- **関連**: Issue #544, PR #545, REQ-0108-115/116, check_integrity.ts
- **タグ**: `#integrity-check` `#false-positive` `#path-resolution` `#cross-skill`
- **移動日**: 2026-06-04

---

## case-open での Issue 本文エンコーディング破損が case-run/case-close に波及

- **問題事象**: case-open が作成した Issue #576 の本文が日本語文字化け（EUC-JP 的な文字単位破損）し、全テキストが読取不能になった。case-run は一部チェックボックスを更新したが、文字化けにより正確な位置特定が困難で 13/17 チェックボックスが未更新のまま残った。case-close で本文全体を正しい日本語で再構築し解決。
- **発生局面**: case-open（Issue作成）→ case-run（実装）→ case-close（完了処理）の3フェーズにまたがる波及
- **検知方法**: case-close Step 2 で Issue 本文を `gh issue view --json body` で読み取り時、全セクションが文字化けしていることを検知
- **根本原因**: Windows 環境の gh CLI で `--body-file` 経由で UTF-8 本文を書き込んだ際、PowerShell のエンコーディング変換が介入して文字化けが発生。case-open のサブエージェントが agentdev-gh-cli スキルの書き込み手順（`[System.IO.File]::WriteAllText` + UTF8Encoding($false)）を正しく適用しなかった可能性が高い
- **自律対応内容**: case-close で Issue 本文を正しい日本語で再構築し、`--body-file` 経由で更新。17/17 チェックボックスを完了に設定
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用上の知見であり、仕様変更は不要）
- **横展開観点**: case-open 以外のサブエージェント（case-run、case-close 等）が `gh issue create` / `gh pr create` を実行する場面でも同一リスクが存在する
- **再発条件**: Windows 環境でサブエージェントが `--body-file` 書き込み手順を正しく適用しない場合に再発。特に agentdev-gh-cli スキルが load されていない、または `[System.IO.File]::WriteAllText` の代わりに PowerShell ネイティブ書き込みを使用した場合
- **予防策候補**: case-open/case-run/case-close コマンド定義で agentdev-gh-cli スキルの load を強制する。または integrity-check に「Issue 本文の文字化け検出」チェックを追加する
- **想定反映先**: agentdev-gh-cli スキル（強化）、agentdev-learning-capture スキル（参考事例）、または case-open/case-run/case-close の guardrails
- **関連**: Issue #576, PR #578
- **タグ**: `#encoding` `#gh-cli` `#windows` `#case-open`
- **移動日**: 2026-06-06

---

## Epic Wave 2 並列PRの同一ファイル変更によるマージコンフリクト

- **問題事象**: Epic #580 Wave 2 で4本のPR (#590, #591, #588, #589) を並列作成後、順次 squash merge した際、#588 (Semantic Conflicts) と #589 (Runtime Boundary) で system.md および integrity report のマージコンフリクトが発生。手動で rebase + コンフリクト解決が必要だった。
- **発生局面**: case-run Epic Orchestrator → Wave 2 並列実行 → squash merge 順序処理
- **検知方法**: `gh pr merge` が `GraphQL: Pull Request has merge conflicts` エラーを返却
- **根本原因**: 並列Wave内の複数PRが同一ファイル (docs/specs/system.md) を変更。#584 が REQ range を修正、#585 が flow separators を修正、#583 が REQ range + table + classification を修正。#583 は #584/#585 の変更を取り込んでいなかった。
- **自律対応内容**: ローカルで `git fetch origin pull/{N}/head` → `git rebase origin/main` → コンフリクト解決 → `git push origin pr-{N}:{original_branch} --force-with-lease` → `gh pr merge {N} --squash` の手順で解決。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用上の知見）
- **横展開観点**: Wave 内並列実行で同一ファイルを変更する可能性がある場合、サブエージェントへのプロンプトで「他のPRと重複する変更は最小限にする」または「変更対象ファイルの重複を避ける」ガイダンスが必要。
- **再発条件**: Wave内並列実行で複数のサブエージェントが同一ファイルを変更する場合。特に system.md, AGENTS.md などの共通設定ファイル。
- **予防策候補**: (1) Wave内でファイル変更対象を事前に分割しサブエージェントに指示、(2) Merge順序を考慮したファイル分割、(3) 最初のPRマージ後に残りのPRをrebaseする運用を標準化
- **想定反映先**: agentdev-workflow-orchestration スキルの Epic Orchestrator protocol
- **関連**: Epic #580, PR #588, #589
- **タグ**: `#epic` `#merge-conflict` `#parallel-execution` `#wave-scheduling`
- **移動日**: 2026-06-06

---

## サブエージェントの連続editによる関数定義破損（Wave 3 #586）

- **問題事象**: Wave 3 (#586) のサブエージェントが `check_integrity.ts` の `checkReqBacklogResidual` 関数に対し、exempt パターン追加の連続editを2回実行した際、いずれも内側の `scanDir` 関数定義を oldString に含めてしまい関数ボディ全体を削除。2回目も同一ミスを繰り返し、最終的に `checkPatternResidual` と `checkReqBacklogResidual` が融合する破壊的状態になった。3回目の手動修復で復旧。
- **発生局面**: case-run Wave 3 → サブエージェントのedit操作
- **検知方法**: スクリプト実行時のJSON出力空、および関数定義の目視確認
- **根本原因**: edit ツールの oldString マッチングが意図より広範囲にマッチし、内側関数定義を含む範囲を置換。複数行 oldString で内側スコープ境界（function定義行）を含むと、意図しない削除が発生しやすい。
- **自律対応内容**: 関数全体を正しく再構築してeditで修復。3回目で成功。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: サブエージェントが入れ子関数を持つファイルを連続editする場面で一般的なリスク
- **再発条件**: oldString に内側関数の定義行を含む置換を連続実行
- **予防策候補**: (1) edit後に Read tool で該当関数の全体を確認する手順を徹底、(2) 大きな関数の部分editでは oldString を最小限に限定、(3) 連続edit前に全体構造を把握してから実行
- **想定反映先**: agentdev-workflow-orchestration のサブエージェント protocol
- **関連**: PR #592, Issue #586
- **タグ**: `#edit-tool` `#subagent` `#function-corruption` `#typescript`
- **移動日**: 2026-06-06

---

## Windows環境でのsymlink代替としてjunctionを使用

- **問題事象**: Windows環境で`.opencode/`ディレクトリをソースからプロジェクト構造内へリンクする際、標準の`mklink`（symlink）コマンドが管理者権限を要求し失敗した
- **発生局面**: 実装（PR #602 feature/issue-596）
- **検知方法**: 自律検出（実装中に`mklink`実行時に権限エラーを検知）
- **根本原因**: Windowsのsymlink作成には管理者権限が必要だが、開発環境では必ずしも権限が与えられない
- **自律対応内容**: `mklink /J`（junction）を使用した。junctionはdirectoryのみ対応だが管理者権限不要。`.opencode/`を`.gitignore`に追加し、clone後は`sync-opencode.ps1 -Mode apply`でjunctionを再作成する設計とした
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: Windows環境での開発セットアップ手順でsymlink/junctionの使い分けが必要な場面に適用可能
- **再発条件**: 今後もWindows環境でのsymlink/junction選択が必要な場合に再発可能
- **予防策候補**: プラットフォーム固有のシェルスクリプトを用意する、開発環境セットアップガイドに明記する
- **想定反映先**: 開発環境構築手順（README等）、`sync-opencode.ps1`
- **関連**: PR #602, Issue #596, `.gitignore`, `sync-opencode.ps1`
- **タグ**: `#windows` `#symlink` `#junction` `#platform-specific` `#workaround`
- **移動日**: 2026-06-06

---

## baseline分類の乖離と解決

- **問題事象**: integrity audit実行時に使用したpractical finding分類（7種）が、先行REQ-0108-148で規定されていた分類（4種）と乖離していた
- **発生局面**: 実装（PR #603 #598）→ 解決（PR #606 #600）
- **検知方法**: 自律検出（REQ-0108-148と実装のbaseline分類を比較して発見）
- **根本原因**: baseline作成時の分類が先行REQより細かく設計され、個別実装が先行したため
- **自律対応内容**: Wave 3（PR #606）のrule catalogで分類を拡張・統合し、REQ-0108-148に合致する形式へ調整した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（仕様内での整合性調整）
- **横展開観点**: baselineや個別ルール実装前に先行REQ定義を確認するプロセスが必要
- **再発条件**: baseline作成とREQ定義のタイミングずれ、実装先行による仕様逸脱
- **予防策候補**: baseline作成時にREQ定義との整合性チェックを実施、rule catalog化で分類を固定化
- **想定反映先**: agentdev-workflow-orchestrationのintegrity audit手順、baseline作成プロトコル
- **関連**: PR #603, PR #606, Issue #598, Issue #600, REQ-0108-148
- **タグ**: `#integrity` `#baseline` `#spec-drift` `#rule-catalog` `#self-corrected`
- **移動日**: 2026-06-06

---

## Wave内ファイル変更非重複設計パターン

- **問題事象**: なし（成功パターン）
- **発生局面**: 設計・実装（Epic #595全体）成功事例
- **検知方法**: 対比分析（前Epic #580の並列Wave 2でのコンフリクトとの比較）
- **根本原因**: 前Epic #580では並列Wave 2のPRが同じファイルを編集してmerge conflictが発生したが、Epic #595ではRU設計時にファイル変更範囲の非重複を事前設計したため
- **自律対応内容**: RU間のファイル変更範囲を明示分離し、Wave順序で依存関係を正しく反映した設計を行った。結果として全6 PRがconflict-freeでmergeできた
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: Epic並列実行で同一ファイルを変更する可能性がある場合、事前のファイル変更範囲設計が有効
- **再発条件**: N/A（成功パターンであり再利用すべき）
- **予防策候補**: Epic計画段階でWaveごとの変更対象ファイルを整理し、前後Waveとの依存関係を明確に記載する
- **想定反映先**: agentdev-workflow-orchestrationのEpic Orchestrator protocol、wave設計ガイドライン
- **関連**: Epic #595, PR #602-#607, Epic #580（対比事例）
- **タグ**: `#epic` `#merge-conflict` `#wave-planning` `#parallel-execution` `#positive-lesson`
- **移動日**: 2026-06-06

---

## PowerShell バッククォートが gh CLI 引数で BEL 文字に展開される

- **問題事象**: `gh pr create` の `--body` 引数に PowerShell バッククォート `` `a `` を含むテキスト（例: `` `apply` ``）を渡すと、バッククォート `` `a `` が BEL 文字 (0x07) に展開され、テキストが破損（例: `Apply` → `^Gpply`）。GitHub 上の PR 本文が文字化けした状態で作成された
- **発生局面**: case-run（PR作成）— PR #609
- **検知方法**: `gh pr view` で読み戻し時に PR 本文の `Apply` が `^Gpply` になっていることを検知
- **根本原因**: PowerShell はバッククォートをエスケーププレフィックスとして扱い、`` `a `` を BEL 文字に展開する。`--body` に直接渡すと PowerShell が先に文字展開してから gh CLI に渡すため、制御文字が混入する
- **自律対応内容**: Write tool で一時ファイルを作成し、`--body-file` で指定する方式に切替えて解決（agentdev-gh-cli スキルの標準手順に合致）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（agentdev-gh-cli スキルですでに `--body` 直接指定が禁止されているため）
- **横展開観点**: 全ての gh CLI 書き込み操作で `--body` 直接指定が禁止されているが、サブエージェントがこの制約を遵守しない場合に同様の問題が発生する
- **再発条件**: PowerShell 環境で `--body` にバッククォートを含むテキストを直接渡す場合
- **予防策候補**: agentdev-gh-cli スキルの `--body` 禁止ルールの厳格化、またはサブエージェントへのプロンプトでの再確認
- **想定反映先**: agentdev-gh-cli スキル（参考事例追加）
- **関連**: PR #609, Issue #608
- **タグ**: `#powershell` `#encoding` `#gh-cli` `#backtick` `#windows`
- **移動日**: 2026-06-06

---

## spec compliance sweep で直接矛盾リスト外の古い参照を検出

- **問題事象**: Issue #610 の「直接矛盾9件」リストに含まれていなかった `docs/specs/workflow-contracts.md` に `/agentdev/integrity-check` の古い参照が残存していた。case-run の spec compliance check で検出・修正した。
- **発生局面**: 実装（case-run）→ spec compliance check → 追加修正
- **検知方法**: case-run 中の spec compliance sweep（grep ベースの残存参照検査）で自律検出
- **根本原因**: Issue 作成時の直接矛盾リストが手動整理であり、`workflow-contracts.md` が見落とされていた。コマンド名変更の影響範囲を完全に網羅する機械的検証が実行前には存在しなかった
- **自律対応内容**: spec compliance check で検出後、`workflow-contracts.md` を追加更新（10件目の docs 更新として）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用上の知見）
- **横展開観点**: コマンド名変更・namespace移動を伴う実装では、Issue の直接矛盾リストだけでなく、機械的な全文検索（grep/ripgrep）を必ず実行すべき
- **再発条件**: 手動整理の影響範囲リストに依存し、機械的検証を省略した場合
- **予防策候補**: (1) case-run の spec compliance check を標準ステップとして位置づけ、(2) コマンド名変更・namespace移動の PR では必ず全文 grep を実行する guardrail を case-run に追加
- **想定反映先**: case-run コマンドの guardrails、agentdev-spec-compliance スキル
- **関連**: Issue #610, PR #611, `docs/specs/workflow-contracts.md`
- **タグ**: `#spec-compliance` `#grep-sweep` `#namespace-migration` `#self-corrected`
- **移動日**: 2026-06-06

---

## [2026-06-06] SKILL.md 行数超過 — agentdev-no-ai-slop-writing (542行)

- **問題事象**: `agentdev-no-ai-slop-writing` SKILL.md が 542 行で、500 行閾値を超過している。`references/` ディレクトリが存在し、内容の一部を抽出することで行数削減の余地がある。
- **発生局面**: integrity-check (F-002)
- **検知方法**: integrity-check 自動検出
- **根本原因**: スキル内容の蓄積により行数が閾値を超過
- **自律対応内容**: なし（検出のみ）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 全スキルで発生し得る行数肥大化
- **再発条件**: スキル内容を継続的に追加・拡充する運用
- **予防策候補**: 内容を `references/` 配下に抽出し、SKILL.md 本体を 500 行以下に縮小する
- **想定反映先**: agentdev-no-ai-slop-writing スキル、agentdev-skill-authoring スキル
- **関連**: integrity-check F-002
- **タグ**: `#skill-size` `#integrity-check` `#document-drift`
- **移動日**: 2026-06-06

---

## [2026-06-06] USE FOR / DO NOT USE FOR の専用セクション不足（17/21スキル）

- **問題事象**: 21技能のうち 17 技能が `## USE FOR` / `## DO NOT USE FOR` を専用セクションとして持たず、frontmatter `description` フィールドに埋め込んでいる。専用セクションを持つのは 4 技能のみ（`agentdev-workflow-lifecycle`, `agentdev-workflow-routing`, `agentdev-workflow-templates`, `repo-agentdev-integrity`）。
- **発生局面**: integrity-check (F-003)
- **検知方法**: integrity-check 自動検出
- **根本原因**: 表記規約の不在。description 埋め込みと専用セクションのどちらを正とするか未決定
- **自律対応内容**: なし（検出のみ）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 全スキルのフォーマット統一
- **再発条件**: 新規スキル作成時にフォーマット規約がない場合
- **予防策候補**: 表記規約を見直し、description 埋め込みと専用セクションのどちらを正とするか決定する
- **想定反映先**: agentdev-skill-authoring スキル、全スキル
- **関連**: integrity-check F-003
- **タグ**: `#skill-format` `#integrity-check` `#document-drift`
- **移動日**: 2026-06-06

---

## [2026-06-06] Junction 管理の不備 — namespace 分割時の残骸 junction

- **問題事象**: namespace 分割 (#611) 時に `agentdev-integrity` → `repo-agentdev-integrity` へ移行したが、旧 junction `.opencode/skills/agentdev-integrity` が残存。リンク先が存在せず、glob やディレクトリ走査で OS error が発生する。
- **発生局面**: integrity-check (F-001)
- **検知方法**: integrity-check 自動検出
- **根本原因**: namespace 移行時に旧 junction の cleanup 手順が未定義
- **自律対応内容**: なし（検出のみ）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: namespace 移行・ディレクトリ構成変更時に一般的に発生し得る
- **再発条件**: namespace 変更時の junction cleanup 手順が未定義の場合
- **予防策候補**: namespace 変更時の junction cleanup 手順を定義する。pre-commit hook での broken junction 検出を検討する
- **想定反映先**: sync-opencode.ps1、integrity-check
- **関連**: integrity-check F-001, PR #611
- **タグ**: `#junction` `#windows` `#namespace-migration` `#obsolete-structure`
- **移動日**: 2026-06-06

---

## [2026-06-06] スクリプトエンコーディング破損が HEAD にコミットされている

- **問題事象**: 3本の整合性スクリプト（合計 ~148KB）が単一行化・エンコーディング破損した状態で HEAD にコミットされている。最終変更コミット e32b935 で発生。`bun` / `npx tsx` ともパース不能。
- **発生局面**: integrity-check (F-004)
- **検知方法**: integrity-check 自動検出
- **根本原因**: ビルド・コミットパイプラインで TypeScript ファイルの有効性チェックがない
- **自律対応内容**: なし（検出のみ）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 全TypeScriptプロジェクトで発生し得る
- **再発条件**: コミットパイプラインでファイル有効性チェックがない場合
- **予防策候補**: ビルド・コミットパイプラインで TypeScript ファイルの有効性チェックを導入する。pre-commit hook での構文検証を検討する
- **想定反映先**: pre-commit hook、CI パイプライン
- **関連**: integrity-check F-004, コミット e32b935
- **タグ**: `#encoding` `#integrity-check` `#pre-commit` `#integrity-rule-gap`
- **移動日**: 2026-06-06

---

## 2026-06-04: 大規模テストファイル(2700+行)の修正委譲でタイムアウト発生

- **問題事象**: check_integrity.test.ts (2771行、52箇所のload_skills参照) の修正をdeep categoryのsubagentに委譲したところ、30分のタイムアウトでタスク失敗。変更自体は適用されていたが、タスク管理上は失敗扱いとなり結果回収ができなかった
- **発生局面**: 実装（case-run Step 5 の委譲）
- **検知方法**: background_output(task_id) の "Task not found" エラー。git status で変更が適用済みであることを確認
- **根本原因**: (1) 2771行のテストファイル全体の修正を単一タスクに詰め込んだ、(2) load_skills参照のコンテキスト理解に時間を要した、(3) deep categoryのタイムアウト(30分)を超過した
- **自律対応内容**: (1) git statusで変更が適用済みであることを確認、(2) bun test でテストパスを検証、(3) タイムアウトしたが変更は正しく適用されていたことを確認して次ステップに進んだ
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 大規模ファイル(1000行超)の修正を委譲する全パターンに適用。特にテストファイルのfixture書き換えは行数が多くても変更パターンが機械的
- **再発条件**: (1) 1000行超のファイル修正を単一タスクに委譲する、(2) 変更箇所がファイル全体に散在する、(3) subagentがコンテキスト理解に時間を要する
- **予防策候補**: (1) 大規模ファイルは修正箇所ごとに分割して並列委譲する（例: fixture修正用とテスト削除用）、(2) 機械的な置換パターンの場合はAST-grepやedit toolで直接実行する方が高速、(3) quick categoryで検証のみを別タスクにする
- **想定反映先**: case-runの委譲分割ガイドライン、またはSisyphusの実装委譲ベストプラクティス
- **関連**: Issue #572, PR #573, check_integrity.test.ts
- **タグ**: `#delegation` `#timeout` `#large-file` `#test-fix`
- **移動日**: 2026-06-04

---
