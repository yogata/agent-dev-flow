---
title: 配布依存境界 gate の base 差分突合では番号ラベル込み対称差確認とカテゴリ・行・スニペット一致 + パス prefix 正規化比較で見かけ差分を解釈する
created: 2026-09-28
updated: 2026-09-28
---

# 配布依存境界 gate の base 差分突合では番号ラベル込み対称差確認とカテゴリ・行・スニペット一致 + パスプレフィックス正規化比較で見かけ差分を解釈する

## 知識内容

case-run STEP-S5 / case-close STEP-3 の配布依存境界 gate で base 差分突合を行う際、手順番号の付け直しと profile 間のパス表現差は「新規違反」と区別できない見かけ差分として現れる。突合手順として次を明文化・実施する:

1. **番号ラベル込み対称差確認**: 件数突合に加え、detail 文言の番号ラベル込み比較で対称差（同一文言・番号ラベル違いのみ）を確認する。手順挿入による番号シフトは後続行のラベル変化として差分に現れるが、文言が同一で番号ラベル違いのみの対称差は既存違反の行移動であり新規違反ではない
2. **カテゴリ・行・スニペット一致 + パスプレフィックス正規化比較**: `--profile source`（worktree 実体・`.worktrees/{N}-{type}/src/...`）と `--profile link`（main root・junction 経由の `.opencode/...`）は同一実体を異なる root 起点・異なるパス表現で列挙する。カテゴリ・行・スニペットの一致を突合キーとし、パスはプレフィックス正規化後の比較で profile 間突合を行う
3. **可能であれば checker 側で正規化済みパスを出力するオプションの追加検討**

**制約**: 正規化比較は「見かけ差分の解釈」のための手段であり、本変更起因の新規違反の検出強度を落としてはならない。対称差確認で新規違反 0 件を機械的に確定する形を維持する。worktree 物理パス / junction 論理パスの表現差は Windows 環境固有の構造差に依存する。

## 適用条件

- 配布依存境界 gate の base 差分突合を、番号付き手順書編集 Case（手順挿入・付け直しを含む）で実施する場合
- source / link 複数 profile の結果突合を行う場合（Windows 環境の worktree + junction 構成を含む）

## 適用対象

- case-run STEP-S5 と case-close STEP-3 の配布依存境界 gate 検証差分突合手順
- agentdev-quality-gates の配布境界ベースライン突合
- baseline 突合系の解釈手順として他の配布物検査・検証差分比較への適用（配布境界 gate 突合への適用は限定）

## 根拠

- Case #3161（PR #3164）: 手順挿入で番号 4→5 に付け直しが発生し、base 16件 → 現行 16件の件数突合は一致するのに added/removed の行ラベル変化が現れた。detail 文言の番号ラベル込み対称差確認で新規違反 0 件を確定
- Case #3169（PR #3173）: `--profile source`（`.worktrees/3169-feature/src/...`）と `--profile link`（`.opencode/...`）のパスプレフィックス差を node による正規化比較で新規 0 件と確認

## 関連知識

- [配布物への具体 ID 配置](distribution-concrete-id-placement.md)（配布物参照境界の検査契約）

## 反映先候補

以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、RU 化せず本節に保持する（2026-09-28 ユーザー承認済み）:

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | agentdev-workflow-case-run / agentdev-workflow-case-close の配布依存境界 gate 手順 reference | 番号ラベル込み対称差確認・パスプレフィックス正規化比較の突合手順補記候補 |
| 配布skill scripts | .opencode/skills/repo-agentdev-integrity/scripts/ | checker 正規化済みパス出力オプションの検討候補 |
