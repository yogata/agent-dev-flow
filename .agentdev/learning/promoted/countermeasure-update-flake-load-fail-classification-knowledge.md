# flake・並列負荷・依存生成順序由来分類の knowledge 補強

## 背景

並列負荷・タイミング系・spawn 系・キャッシュ競合・依存生成順序による非決定性 fail（flake）の由来分類に反復コストが発生している（8 件・Case #3961/#3968/#4002/#4004/#4026/#4068）。3分割同時並列実行で既知 12 件外のタイミング系 fail 11 件が負荷下のみで出現し単独再実行で全件解消、plugins 分割 full-run の実行順序・負荷依存 flakiness、bun キャッシュ競合の疑い、vendor bundle 生成完了前の並列起動による連鎖 fail 等

## 問題

docs/knowledge/worktree-environment-fail-classification.md に「flake」「負荷」「並列実行」の記載が不在（grep 実測・全文確認）。由来分離 3 手手段（main root 対照・baseline 再現・同一条件実行）は実在するが、(1) flake（非決定性）という語彙と負荷由来という分類ラベルが不在 (2) 並列実行・キャッシュ競合・依存生成順序の変異列挙が不在 (3) 独立再観測回数記録・依存生成完了後の直列実行規律が不在。QG-4「fail 由来分類」節（4分類・単独/フル再実行証跡手順）と windows-bun-test-spawn-timeout-classification.md（負荷対照実行）が既存被覆であり、追記はこの差分に対して行う

## 望ましい変更

既存知識 worktree-environment-fail-classification.md へ (1) flake・負荷由来という分類ラベルの追加 (2) 既知 SSoT 照合 → 負荷なし単独再実行 → 分類確定の順序規律と観測 fail の分類順序「並列観測 → 照合 → 単独再実行 → 分類確定」の明記 (3) 並列実行・キャッシュ共有・依存生成と並列起動の変異列挙 (4) 独立再観測回数の記録要件・依存生成（bun install・build:engine 等）完了後の直列実行前置を追記する

## 対象範囲

### 対象

- docs/knowledge/worktree-environment-fail-classification.md（flake 語彙・負荷分類ラベル・変異列挙・直列実行前置の追記）

### 対象外

- QG-4 の fail 由来分類契約の変更（4分類・証跡手順は既存維持）
- windows-bun-test-spawn-timeout-classification.md の timeout 由来分類の変更
- テスト自体のタイミング系改修

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/worktree-environment-fail-classification.md | flake・負荷由来分類ラベル・変異列挙・直列実行前置の追記 |

## 既存対策確認

- **確認結果**: 対策あり（大部分）
- **該当ファイル**: docs/knowledge/worktree-environment-fail-classification.md（由来分離 3 手手段実在）・src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md（fail 由来分類節 L394-431 実在）・docs/knowledge/windows-bun-test-spawn-timeout-classification.md（負荷対照実行 L21 実在）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: flake 語彙・負荷分類ラベル・並列/キャッシュ/依存生成順序の変異列挙・独立再観測回数記録・依存生成完了後の直列実行規律の収録欠落

## 制約

- 既知 flake の登録は既知不合格 SSoT（.agentdev/tmp/c-alpha2-baseline/known-failures-fixed.md 等）の運用と整合させる
- 負荷 flake の分類は単独（負荷なし・直列）再実行での pass 実測を根拠とし、タイミング運を根拠にしない

## 受け入れ条件

- [ ] 既存知識に flake・負荷由来の分類ラベルと分類順序規律（並列観測 → 照合 → 単独再実行 → 分類確定）が収録されていること
- [ ] 並列実行・キャッシュ共有・依存生成順序の変異が列挙されていること
- [ ] 依存生成完了後の直列実行前置が明記されていること

## 元learning item / 根拠

- **要約**: 並列負荷・タイミング系・キャッシュ競合・依存生成順序による非決定性 fail の由来分類規律が既存知識に不在（8 件）
- **根拠**: worktree-environment-fail-classification.md 全文のファイル読取実測で flake・負荷・並列実行の記載不在（grep 実測・2026-11-15）・8 件の変異観測（Case #3961/#3968/#4002/#4004/#4026/#4068）
- **再発条件**: 並列実行・負荷・キャッシュ共有・依存生成と並列起動の環境で bun test / gate を実行する条件
- **横展開可能性**: 並列検証・CI 負荷環境全般で汎用的に適用可能な分類規律

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation, chore
- **関連Issue**: なし
