# 既存対策の更新: worktree 運用における workspace 外一時ファイル書込みの標準手段切替指針

## 背景

case-open STEP-5 横断依存検査（Case #3101、Case #3139）で、検査入力 JSON を harness 環境情報が pre-approved と明示する一時ディレクトリ（C:\WINDOWS\TEMP\opencode）へ write ツールで保存しようとしたところ、agentdev-textlint-guard Plugin が「write targets a path outside the project root; blocked per fail-closed」でブロックした。
harness 側の事前承認表示は repo 側 guard の判定に反映されない。
同種の事象が deferred.md に3件記録されている（2026-08-15 の distribution-boundary-guard ブロック、2026-09-19 の OS 一時ディレクトリの project root 外判定、2026-09-20 の承認済み temp を含む fail-closed block）。guard 自体は AGENTS.md 行動規範と整合した正しい動作であり、問題は検査入力等の一時ファイルの置き場所指針が機械的検査エンジンの README に定められていないことにある。

## 問題

- 機械的検査エンジン（横断依存検査等）の入力 JSON 等の一時ファイルの置き場所について、scripts/README.md に指針が定められておらず、実行のたびに harness 提示 temp への書込み試行 → guard ブロック → 代替手段への切替が繰り返される。
- worktree-operations.md「書込み guard 運用指針」節の集約範囲に workspace 外 write ブロック事例が含まれず、Windows 環境の標準手段切替知見が分散している。
- write ツールの guard ブロック後に別の API 経路（node writeFileSync 経由等）で同一の workspace 外パスへ書込み可能であった実観測がある。これは API 固有の挙動の観察にすぎず、書込み許可を意味しない。この経路を運用上の選択肢として扱わない旨が指針として明記されていない。

## 望ましい変更

- 機械的検査エンジンの scripts/README.md に検査入力 JSON の置き場所指針を追記する: workspace 外 temp 禁止、一時ファイルは project root 内（worktree 配下の明示的一時パス・gitignore 領域）に限定して配置（commit 対象外・検査後削除）。
- worktree-operations.md「書込み guard 運用指針」節に workspace 外 write ブロック事例（harness 提示 temp も project root 外扱い）の知見を集約する。
- 一時ファイルの置き場所は project root 内（worktree 配下の明示的一時パス・gitignore 領域）に限定する。guard ブロック後の別 API 経路（node writeFileSync 等）による workspace 外書込みの代替は採用しない（guard 迂回にあたる）。

## 対象範囲

### 対象

- 機械的検査エンジンの scripts/README.md（横断依存検査 `inspect_cross_dependencies.ts` の README 等の注記追記）
- `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md`「書込み guard 運用指針」節への事例集約

### 対象外

- guard（agentdev-textlint-guard、distribution-boundary-guard）の fail-closed 動作自体の変更（設計どおり。迂回・緩和しない）
- AGENTS.md 行動規範の変更
- 既存 deferred エントリ（2026-08-15・2026-09-19・2026-09-20 分）の移動・prune

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-workflow-case-open/scripts/README.md | 検査入力 JSON の置き場所指針（workspace 外 temp 禁止・project root 内一時パス〔worktree 配下・gitignore 領域〕限定・検査後削除）の注記追加 |
| 配布skill reference | src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | 「書込み guard 運用指針」節への workspace 外 write ブロック事例（harness 提示 temp の project root 外扱い・project root 内配置への切替）の集約追記 |

## 既存対策確認

- **確認結果**: 既存対策あり（guard 自体と AGENTS.md 行動規範）
- **該当ファイル**: src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md「書込み guard 運用指針」節（実在確認済み）、AGENTS.md 行動規範（Windows UTF-8 / PowerShell 破壊回避の標準手段規定）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: (1) 機械的検査エンジンの scripts/README.md に検査入力 JSON の置き場所指針が定められていない（--input \<input.json\> のみ規定）。(2) worktree-operations.md「書込み guard 運用指針」節の集約範囲に workspace 外 write ブロック事例（harness 提示 temp の project root 外扱い・project root 内配置への切替・別 API 経路による迂回を非採用とする注意）がない。

## 制約

- guard による書込みブロックは fail-closed として維持し、ブロック解除・迂回ではなく標準手段への切替を正規とする（AGENTS.md 書込み guard 運用指針）。
- guard ブロック後の別 API 経路（node writeFileSync 等）による workspace 外書込みは、guard 迂回にあたるため採用しない。write ツールの guard 判定対象外であったという実観測は API 固有の挙動の観察であり、書込み許可を意味しない（AGENTS.md が Windows 標準手段として認可する node readFileSync/writeFileSync は project root 内の作業を前提とする）。
- 一時ファイルは git 未追跡とし、検査後に削除して worktree が clean であることを確認する運用を維持する。

## 受け入れ条件

- [ ] 検査入力 JSON 等の一時ファイルの置き場所指針（workspace 外 temp 禁止・worktree 配下一時パス推奨・検査後削除）が該当 README に追記されている
- [ ] worktree-operations.md「書込み guard 運用指針」節に workspace 外 write ブロック事例と標準手段切替の知見が集約されている
- [ ] guard ブロック後の別 API 経路（node writeFileSync 等）による workspace 外書込みを迂回として採用しない旨が明記されている

## 元learning item / 根拠

- **要約**: worktree 運用における workspace 外一時ファイル書込みの guard ブロックと標準手段切替の問題クラス（8軸評価 29/40、発生 5件〔inbox 2 + deferred 3〕）。
- **根拠**:
  - Case #3101（PR #3102）: 横断依存検査の検査入力 JSON を workspace 外 temp へ write ツールで保存しようと guard ブロック → worktree 配下一時パス（.worktrees/3101-definition/\.tmp-crossdep-input-ru0123.json、git 未追跡）へ切替し検査後削除。
  - Case #3139: 同一問題の再発。harness の pre-approved 表示は guard 判定に反映されない。node writeFileSync（bash 経由）で同一パスへ書込み可能なことを実観測（API 固有の挙動の観察であり、書込み許可を意味しない。運用上の選択肢としては採用しない）。
  - deferred 照合3件（本成果物生成時点で deferred.md に現存・移動しない）: deferred.md:814（2026-08-15、distribution-boundary-guard ブロック・worktree 内配置で回避）、deferred.md:2320（2026-09-19、OS 一時ディレクトリも project root 外判定）、deferred.md:2402（2026-09-20、承認済み temp 含む fail-closed block・node -e + PS ヒアドキュメント方式）。根本原因（project root 外書込みを guard が fail-closed で拒否）、再発条件（一時ファイル等の project root 外書込み）、予防策（root 内配置・標準手段への切替）の一致を確認済み。
- **再発条件**: workflow が harness 提示の workspace 外 temp へ write ツールで一時ファイルを書込む場合に毎回再発。
- **横展開可能性**: worktree 配下で機械的検査を実行する全 workflow（case-open、case-run、case-close、backlog-auto 等）で発生し得る。Windows 環境固有の運用知見として高い再利用性。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation（手順・注記追記）
- **関連Issue**: Case #3101（PR #3102）、Case #3139
