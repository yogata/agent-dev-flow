# 共有領域後片付けの具体ファイル名個別指定規律

## 背景

main root .agentdev/integrity/reports/ の後片付けで wildcard パターン（2026-11-12-integrity-report-*.md）を使用した結果、自分の生成分だけでなく同日の他工程起因の同名連番 scratch report も誤削除した（Case #4026 Wave 2・PR #4040 で実害報告済み）。対象は gitignore 対象の派生 scratch 出力で恒久証跡チャネル参照なし・base 版と他日付分は無傷であったが、共有領域での wildcard 一括削除の危険性が実証された

## 問題

worktree-operations.md の現行 cleanup 規律（追跡済みファイル削除禁止・未追跡のみ対象・git clean -fd・.agentdev/tmp 列挙削除）に「後片付けの削除は自分が作成した具体ファイル名を個別指定し wildcard を使用しない」規律が不在（grep・STEP-4 review Stream B で実測確認）。共有領域の連番・タイムスタンプ生成物に対する wildcard 一括削除は同時刻に他工程が生成する同名パターンを区別できない

## 望ましい変更

worktree-operations.md の cleanup 系規律へ「後片付けの削除は自分が作成した具体ファイル名を個別指定し wildcard を使用しない（連番・タイムスタンプ等の衝突し得るパターンでの共有領域 wildcard 削除は禁止）」を追加する

## 対象範囲

### 対象

- worktree-operations.md cleanup 系節（具体ファイル名個別指定・wildcard 不使用規律の追加）

### 対象外

- integrity reports の生成・回収機構の変更
- .agentdev/tmp/ 一時ファイル cleanup 規定（当該実行内削除・既存維持）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-git-worktree/references/worktree-operations.md cleanup 系節 | 後片付け削除の具体ファイル名個別指定・wildcard 不使用規律の追加 |

## 既存対策確認

- **確認結果**: 対策なし
- **該当ファイル**: src/common/skills/agentdev-git-worktree/references/worktree-operations.md（cleanup 規律に個別指定規律不在・STEP-4 review Stream B で実測確認）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 共有領域の後片付け削除における具体ファイル名個別指定・wildcard 不使用規律の欠落。他工程生成物の誤削除実害（PR #4040 で報告済み）

## 制約

- 削除対象は自分が作成した生成物に限定する（他人の生成物の削除は P-l〔untracked 所有者確認規律〕と連携）
- 恒久証跡チャネル参照のある出力は削除対象外（既存の回収契約に従う）

## 受け入れ条件

- [ ] worktree-operations.md の cleanup 系規律に具体ファイル名個別指定・wildcard 不使用規律が収録されていること
- [ ] 後続の共有領域後片付けで他工程生成物の誤削除が発生しないこと

## 元learning item / 根拠

- **要約**: 共有領域の wildcard 一括削除で同日他工程の同名連番 scratch report を誤削除（実害報告済み）
- **根拠**: Case #4026 Wave 2・PR #4040 本文 Findings の実害報告・worktree-operations.md cleanup 規律の実測確認（STEP-4 review Stream B が実測・2026-11-15）
- **再発条件**: 連番・タイムスタンプ等の衝突し得るパターンで共有領域の生成物を wildcard 削除する全状況
- **横展開可能性**: 共有領域（.agentdev/integrity/reports/ 等）で生成物の後片付けを行う全工程に適用可能。実行時禁止事項として横展開可能

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation, chore
- **関連Issue**: Case #4026・PR #4040
