# QG-4 pre-existing 判定の baseline detached worktree 再現手順

## 背景

Case #3158（case-close STEP-2、QG-4 フル suite 正規形）で IR-055 runtime-unresolved-reference delta 回帰テストが 1件 fail した。 当該テストが参照する delta baseline object `bac3ca4b...` がワークツリーから参照不能（fatal: bad object）である一方、テストは継続動作し、PR 変更対象外ファイル由来の検出 2件を報告した。

## 問題

- delta 比較の基準 commit object がクローン内に存在しない場合、比較が参照可能な範囲で動作し、検出件が当該変更と無関係の既存状態になり得る
- QG-4 fail 由来分類契約（agentdev-quality-gates「fail 全件由来分類・由来不明 0 件」機械受理基準）は存在するが、baseline object 参照不能時の再現手順が知識化されていない

## 望ましい変更

QG-4 で baseline 再現を要する integrity suite fail の由来分類手順として、(i) 単独再実行、(ii) PR 分岐点 baseline commit の detached worktree（stash 不使用標準手順・ワークツリー変更ゼロ）での同一テスト再現、(iii) main root（base と同一 commit・変更ゼロ）での確認、の3点確認により pre-existing（由来不明 0件）と分類する手順を知識化する。

## 対象範囲

### 対象

- case-close QG-4 で baseline 再現を要する integrity suite fail 全般
- agentdev-quality-gates の QG-4 fail 由来分類手順

### 対象外

- delta baseline commit object の永続化・ラベリング方針（対象範囲の新規決定。ユーザー承認により intake item 2026-09-27 として起票済みの件）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/（新規知識文書候補） | baseline detached worktree 再現による pre-existing 分類手順（3点確認） |
| 配布skill | src/opencode/skills/agentdev-quality-gates/ | QG-4 fail 由来分類の実践例として参照 |

## 既存対策確認

- **確認結果**: あり（fix gap 相当）
- **該当ファイル**: agentdev-quality-gates SKILL.md（fail 全件由来分類・由来不明 0 件の機械受理基準）
- **ギャップ分類**: なし（運用実践手順の知識化）
- **ギャップ詳細**: baseline object 参照不能時の具体的再現手順が未記録

## 制約

- detached worktree は stash 不使用の標準手順でワークツリー変更ゼロを維持すること
- merge 判断の blocker からの除外は由来不明 0 件の確認後とすること

## 受け入れ条件

- [ ] 3点確認（単独再実行・baseline detached worktree・main root）による pre-existing 分類手順が知識化されること

## 元 learning item / 根拠

- inbox 2026-09-27「integrity suite の delta baseline object が参照不能な際は baseline commit の detached worktree 再現で pre-existing 分類する（case-close QG-4）」（Case #3158、PR #3160、check_integrity.test.ts、Issue #1782〔IR-055〕）: 3点確認で pre-existing と分類し QG-4 停止報告 1回のユーザー確認（再開条件充足と merge 継続指示）を経て merge 判断から除外
- 付帯決定: delta baseline commit `bac3ca4b...` の永続化・ラベリング方針は intake item として別途起票（ユーザー承認済み、2026-09-27）
