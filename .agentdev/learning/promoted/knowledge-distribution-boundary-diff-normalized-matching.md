# 配布依存境界 gate 差分突合の見かけ差分解釈（番号ラベル・パス表現差の正規化比較）の知識化

## 背景

case-close STEP-3 の配布依存境界 最終 gate で base 差分突合を行う際、手順番号の付け直しと profile 間のパス表現差が「新規違反」と区別できない見かけ差分として現れる事象が Case #3161 と Case #3169 の2観測で発生した。いずれも突合手順の解釈で解消したが、判断は個別の自律対応に依存しており手順として明文化されていない。

## 問題

- base 差分突合の突合キーに行ラベル（手順番号付き見出し・行頭書式）が含まれるため、手順挿入による番号シフトが後続行のラベル変化として差分に現れ、新規違反の追加と既存違反の行移動を判別できない
- `--profile source`（worktree 実体・`.worktrees/{N}-{type}/src/...`）と `--profile link`（main root・junction 経由の `.opencode/...`）は同一実体を異なる root 起点・異なるパス表現で列挙するため、生のファイル差分比較では同一違反が別エントリに現れ「新規」誤判定となる

## 望ましい変更

配布依存境界 gate の base 差分突合手順として次を明文化する。

- 件数突合に加え、detail 文言の番号ラベル込み比較で対称差（同一文言・番号ラベル違いのみ）を確認するステップ
- カテゴリ・行・スニペット一致 + パス prefix 正規化後の比較による profile 間突合
- 可能であれば checker 側で正規化済みパスを出力するオプションの追加検討

## 対象範囲

### 対象

- case-run STEP-S5 と case-close STEP-3 の検証差分突合手順（配布依存境界 Design 由来の差分突合記述）
- repo-agentdev-integrity scripts（checker 出力の正規化対応候補）

### 対象外

- 配布依存境界 checker・gate 契約自体の変更（検出規約は不変。突合時の解釈手順の整備が対象）
- baseline の管理方式変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | agentdev-workflow-case-run / agentdev-workflow-case-close の配布依存境界 gate 手順 reference | 番号ラベル込み対称差確認・パス prefix 正規化比較の突合手順明記 |
| 配布skill reference | agentdev-quality-gates references | 配布境界ベースライン突合の正規化ルール補記候補 |
| 配布skill scripts | .opencode/skills/repo-agentdev-integrity/scripts/ | checker 正規化済みパス出力オプションの検討候補 |

## 既存対策確認

- **確認結果**: 直接の既存対策なし・同系近縁あり
- **該当ファイル**: なし（近縁: deferred の「2026-08-09 command 薄型化による既存参照の行移動で baseline 比較が新規 delta を生む制約」「委譲メタデータの baseline 数値は参考値であり完了判定は再検索の実測で行う」「NG baseline の bucket key は語彙置換で陳腐化する」— baseline 突合の見かけ差分系の一般知見。ただし配布境界 gate の detail 文言突合に特化したものは無い）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: 配布境界 gate の突合手順に正規化比較ルール（番号ラベル込み対称差・パス prefix 正規化）の明文化がない

## 制約

- 正規化比較は「見かけ差分の解釈」のための手段であり、本変更起因の新規違反の検出強度を落としてはならない（対称差確認で新規違反 0 件を機械的に確定する形を維持）
- worktree 物理パス / junction 論理パスの表現差は Windows 環境固有の構造差に依存する

## 受け入れ条件

- [ ] 突合手順に「件数突合 + detail 文言の番号ラベル込み対称差確認」が明記されること
- [ ] profile 間突合の「カテゴリ・行・スニペット一致 + パス prefix 正規化比較」が明記されること

## 元 learning item / 根拠

- **要約**: 配布依存境界 gate の base 差分突合における見かけ差分（番号シフト・パス表現差）の解釈手順
- **根拠**: 2観測。
  - inbox「配布依存境界 gate の base 差分突合は detail 文言の番号ラベル込み比較で差分の実質を判定する」（Case #3161・PR #3164）: 手順挿入で番号 4→5 に付け直しが発生し、base 16件 → 現行 16件の件数突合は一致するのに added/removed の行ラベル変化が現れた。番号ラベル込み対称差確認で新規違反 0 件を確定
  - inbox「配布境界ベースライン突合で --profile source と --profile link のパス表記差を正規化比較で解消した」（Case #3169・PR #3173）: source 側 `.worktrees/3169-feature/src/...` と link 側 `.opencode/...` のパス prefix 差を node による正規化比較で新規 0 件と確認
- **再発条件**: 配布依存境界 gate の base 差分突合を、番号付き手順書編集 Case または source/link 複数 profile の結果突合で実施する場合
- **横展開可能性**: baseline 突合系の解釈手順として他の配布物検査・検証差分比較にも適用可能。配布境界 gate 突合への適用は限定される

## 推奨Issue分類

- **分類**: refactor
- **推奨ラベル**: documentation
- **関連Issue**: なし
