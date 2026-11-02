# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

## [2026-10-27T07:20+09:00][workflow_deviation][case-open STEP-4][Case #3866]
- 検知: prepare_definition_pr.ts の DefinitionEdit 行区切り保全契約（newText は oldText の行区切りを保全し行の追加のみ許可・行の削除・統合を拒否）により、REQ 表の空行削除（REQ-108 表統合・ACT-REQ-002）や行移動〔行数減少を伴う分割編集〕を DefinitionEdit で表現できなかった（--validate-input が行構造事前確認で fail-closed 拒否）。
- 対処: REQ-108 空行削除を REQ-117.md 新規作成と同一の前段配置経路（worktree 内への node writeFileSync UTF-8 明示・oldText 一意性検証つき・stagePaths 経由 commit）で適用し、逸脱として PR #3867 本文へ記録。行移動（REQ-010-080）は12行ブロックの行数同数並べ替え（1 edit）で DefinitionEdit 契約内に収めた。
- 学び: DefinitionEdit 契約の行区切り保全は「行の追加のみ許可」が実装の正であり、行削除型の docs 整合操作（空行削除・行削除）は artifact_actions の適用計画段階で前段配置経路への事前割当てが必要。prepare_definition_pr の validateInput 分離入口（REQ-117-010 実装対象）に前段配置対象の明示化を組込む改善候補。

## [2026-10-27T10:45+09:00][intake_candidate][case-close Epic Wave クローズ][Case #3866]
- 検知: Epic Wave クローズの配布依存境界 最終 gate で 21件 violations を検出。本一式の PR 単位の検査（case-run 段階）では配布依存境界 gate を PR 前置として実施しておらず、REQ/AG 識別子（REQ-117-XXX・AG-XXX）を配布物（src/common/skills/** の script コメント・references・README）へ記述したまま merge していた。加えて配布 README への repo-*（repo-local 検査基盤）参照も検出。
- 対処: Epic Wave クローズ工程で 21件全て是正（識別子除去・repo-* 参照除去）し最終 gate pass。実装記録は REQ トレーサビリティ（covers 宣言・sidecar）で管理され、配布物本文中の識別子は不要であることを再確認。
- 学び: 配布物に触れる PR の検証に配布依存境界 gate の前置を組み込む（case-run 前置 gate の強化候補）。REQ 識別子は covers 宣言（inline または sidecar）で保持し、配布物本文へは書かない規律の周知が改善候補。
- 出典: PR #3880・#3881・#3882・#3884・#3885 の Findings と Epic Wave クローズ時の検出記録

## [2026-11-02T19:30+09:00][learning_candidate][req-define draft YAML 生成][Case #3887]
- 検知: RU-0255 draft の CR-002 行が YAML plain-scalar でコロン＋空白を含み、PyYAML safe_load でパーサエラーになる構造が req-define draft 保存時に混入した。
- 対処: commit 87621f165 でコロン含み scalar を引用符付きへ修正し、PyYAML safe_load による深部検査（194/194）で parser-valid を確認済み。
- 学び: draft本文（マーカー区切りテキスト）から YAML frontmatter を生成・編集する経路では、plain-scalar にコロン＋空白が入るだけでパーサが落ちるため、生成直後に safe_load での検証を前置する。検証なし保存は req-define 系の失敗原因として再発しやすい。
- 出典: PR #3888 本文（YAML parse 検証結果）、commit 87621f165

## [2026-11-02T19:30+09:00][learning_candidate][traceability sidecar 登録][Case #3887]
- 検知: REQ-004-069〜075 の design covers を sidecar 2 件へ登録する際、inline ADF-COVERS 宣言と sidecar の重複（同一対応関係の二重管理）と関係表記ゆれが duplicate-inconsistencies の検出対象になった。
- 対処: case-ready 検証で duplicate-inconsistencies 0 件になるよう、inline 宣言と sidecar を同一の論理対応関係として正規化（design 役割の完全集合を sidecar 側へ統一、REQ-004-074 は REQ-108-006、REQ-004-075 は REQ-107-007 を規定参照接続とし重複追加しない）。
- 学び: sidecar 登録は inline 宣言との重複排除が前提。対応関係の追加時は duplicate-inconsistencies を必ず機械突合し、表記ゆれ（REQ 行 ID の桁・区切り）は機械検査でしか発見できないため手作業での目視照合に頼らない。
- 出典: PR #3888 本文（traceability check 結果）、traceability/agentdev-req-file-manager.yaml、traceability/agentdev-workflow-req-define.yaml

## [2026-11-02T19:30+09:00][learning_candidate][post-merge full integrity][Case #3887]
- 検知: post-merge の check_integrity full audit で phase 系 SKILL 3 件の templates/phase-readme.md 参照欠落（IR ReferencePath、pre-existing）を検出。参照行は commit 3ef748a8a（#3855）で追加され、本 Case 変更領域外。pre-merge 機械工程（targeted docs guard、distribution boundary）では観測されない full audit 系の検出。
- 対処: 本 Case では pre-existing 分類として記録し、修正は対象範囲外として次回 phase 系 docs 変更 Case への追随修正候補として残置。同 full audit で検出された ReqFreshness 1 件（本変更起因、req-health-metrics.md の frontmatter updated 更新漏れ）は case-close 対象範囲内修正として commit 266a8df2 で解消。
- 学び: pre-merge の targeted 検査では full audit 系の検出（ReferencePath、ReqFreshness 等）が観測されない。merge 直後の full integrity 実行を case-close 標準工程へ組み込むことで、変更起因の freshness 違反を直近で是正できる。設計書変更時に frontmatter updated を同一 PR で更新する規律の再確認が改善候補。
- 出典: Issue #3887 AC 判定コメント（2026-11-02）、check_integrity 実行記録（postmerge-check-integrity-2.json）、commit 266a8df2

## 2026-11-02T12:45+09:00 Case #3889（訂正 Case）Capture

### 1. install.ps1 の LocalMode 検証には consumer レイアウト変換が必要

- 問題クラス: workflow deviation / 環境構築
- 内容: install.ps1 は consumer 専用公開入口であり、実行ディレクトリ直下に src/opencode/ が存在すると誤実行防止（REQ-050-006）で exit 1 する。本 repo（agent-dev-flow）を clone して -LocalMode の配置検証をする際は、clone 内で src/ を .agentdev-plugin/src/ へ移動し、textlint guard の vendor/（導入時生成依存・gitignore）を正規配置から読み取り専用複製する必要がある
- 発生条件: TS-C003（Local 版 plugin 公開入口検証）の環境構築。実際に exit 1 を確認し、consumer レイアウト変換で解消（install apply/check とも ok）
- 証跡: C:/WINDOWS/TEMP/opencode/ts3889-local/execution-log.md 第 0 節・install-apply.log

### 2. MSYS パス変換による clone 誤配置の落とし穴

- 問題クラス: implementation error / 環境依存
- 内容: Git Bash（MSYS）で `git clone C:/... C:/WINDOWS/TEMP/...` 形式を使うと、一部コンテキストで先頭 / を持つ POSIX 風パスへ変換され C:\c\WINDOWS\... へ誤配置する場合がある。Windows 形式パス指定で再実行し、誤配置ツリーは配下のみを確認して削除した
- 予防: MSYS から Windows 絶対パスを渡す引数は Windows 形式（バックスラッシュまたはドライブレター）で統一するか、MSYS_NO_PATHCONV 系の抑制を検討する
- 発生条件: Case #3889 TS-C003 サブエージェントの clone 初回実行
- 証跡: C:/WINDOWS/TEMP/opencode/ts3889-local/execution-log.md 第 0 節注記
