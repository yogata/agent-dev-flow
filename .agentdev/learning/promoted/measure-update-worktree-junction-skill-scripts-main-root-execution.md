# measure-update-worktree-junction-skill-scripts-main-root-execution

## 背景

case-close STEP-3 のトレーサビリティ独立再検査（3完全性ゲート）を worktree（.worktrees/3060-fix）root 起点で実行した際、`.opencode/skills/agentdev-traceability/scripts/src/check.ts` の bun 実行が Module not found で失敗した。`.opencode/skills/agentdev-*` は junction 構造のため worktree へ未伝播である。main root 側の check.ts 実体から `--root <worktree root>` を明示指定して PR HEAD ツリーを検査対象に実行し、9 pass / 0 fail を確認した。

同種の事例が既に deferred pool に存在する（2026-09-05 記録・09-07 移動: targeted docs guard を main repo 実体から `--root` + `--files` 併用で検査）。今回で2件目の発生となり、統合クラスタとして評価した（8軸 28/40、本実行で最高スコア）。

## 問題

worktree で junction 系 skill scripts（配布 skill 実体を junction 経由で解決する scripts）を実行する検査は、構造的に worktree 内からは実行不能だが、その代替手順「main root 実体から `--root <worktree root>` を指定して実行する」が配布 skill reference に明記されていない。既存の正典は `agentdev-quality-gates/references/qg-4-final-acceptance.md` L389-391 の「worktree root 起点で完全性が確定できない場合、main 側 root で check を再実行（読取系 check の実行のみ）」というトレーサビリティ完全性ゲート限定の前提手順のみで、targeted docs guard・契約テスト・配布境界 checker 等の scripts 検査全般に適用される汎用手順は worktree 構造的制約の文書に不在である。

## 望ましい変更

- `agentdev-git-worktree` の worktree 構造的制約文書（worktree-operations.md 構造的制約節）に、「junction 系 skill の scripts を用いる検査は worktree 内から実行できず、main root 実体から `--root <worktree root>`（必要に応じて `--files` 併用）で実行する」汎用手順を追記する。
- QG-4 final acceptance の既存 main 側 root 再実行前提手順との相互参照を整備する。

## 対象範囲

### 対象

- `.opencode/skills/agentdev-git-worktree/references/worktree-operations.md`（構造的制約節への汎用手順追記）
- `.opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md`（相互参照候補）

### 対象外

- check.ts 等の scripts 実装変更（`--root` 引数は既存の正規手段であり変更不要）
- junction 構造自体の変更（配布 skill 配置規約の変更を含まない）
- case-run / case-close の workflow 制御構造の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | .opencode/skills/agentdev-git-worktree/references/worktree-operations.md 構造的制約節 | junction 系 skill scripts 検査の「main root 実体 + --root 指定実行」汎用手順の追記 |
| QG 基準 | .opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md | 既存 main 側 root 再実行前提手順（L389-391）との相互参照（候補） |
| case-close 検査手順 | case-close 関連 reference | トレーサビリティ独立再検査等の worktree 実行時手順への注記（候補） |

## 既存対策確認

- **確認結果**: 既存対策あり（QG-4 トレーサビリティ系に限定。scripts 検査全般の汎用手順は不在）
- **該当ファイル**: .opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md L389-391（worktree root 起点で完全性が確定できない場合の main 側 root 再実行・読取系 check 限定）、.opencode/skills/agentdev-git-worktree/references/worktree-operations.md 構造的制約節（junction 未伝播の正典化。記載は gitignore 受け渡し不可の一般論と bun test 依存整備の junction 手順）
- **ギャップ分類**: fix gap（適用範囲の欠落）
- **ギャップ詳細**: QG-4 の main 側 root 再実行前提手順はトレーサビリティ完全性ゲート限定であり、worktree 構造的制約文書には「junction 系配布 skill scripts の検査を main root 実体から --root 指定で実行する」汎用手順が記載されない（本文確認済み）。targeted docs guard（2026-09-05）と traceability check（本件）の2事例が同一パターンで発生している

## 制約

- QG-4 前提手順の「main 側 root での再実行は読取系 check の実行のみ」という制約を本手順も引き継ぐ（書込み系操作を main root から実行しない）
- scripts 実行形態は `bun <path>` 形式（bun run は package.json scripts 解決を挟むため Module not found の別因になり得る。deferred 既存知見）
- worktree 内の検査結果と main root 実体からの検査結果を混在させない（対象 root を --root で明示して PR HEAD ツリーを検査対象にする）

## 受け入れ条件

- [ ] worktree-operations.md 構造的制約節に「junction 系 skill scripts の検査は main root 実体から --root 指定で実行する」手順が記載されている
- [ ] QG-4 final acceptance の既存 main 側 root 再実行手順との関係が相互参照されている
- [ ] worktree 環境で targeted docs guard・traceability check・契約テスト等の代表的検査について、main root 実体 + --root 指定での実行手順が文書化されている

## 元learning item / 根拠

- **要約**: worktree で junction 系 skill scripts 実行不能となる構造的制約と、main root 実体 + --root 指定実行による代替手順（統合クラスタ2件）
- **根拠**: worktree-operations.md 構造的制約節に汎用手順が不在（本文確認済み）。8軸評価 28/40・2事例蓄積・横展開性4・再発可能性4。deferred 既存エントリ（targeted docs guard）は本成果物の関連事例として参照するのみで全文保存されないため prune 規則上 staged 非該当、living pool に残置（次回再評価対象）
- **再発条件**: worktree で junction 系 skill の scripts を実行する検査（case-run / case-close の各検査で高頻度）
- **横展開可能性**: 本プロジェクトの worktree 運用全般（case-run / case-close で worktree 検査は高頻度）。他プロジェクトでも junction/junction 相当の配布構造を採る場合に同様の制約が発生し得る

元 inbox エントリ全文（staged prune の証拠保存。出典: `.agentdev/learning/inbox.md` 2026-09-22 記載）:

```markdown
## 2026-09-22: worktree での agentdev-traceability scripts 実行不能と main root 実体からの --root 指定実行

- **問題事象**: worktree（.worktrees/3060-fix）で `bun run .opencode/skills/agentdev-traceability/scripts/src/check.ts` が Module not found で失敗。`.opencode/skills/agentdev-*` は junction 構造のため worktree へ未伝播（repo- プレフィックス検査基盤 scripts は git 管理実体として worktree に存在し実行可）
- **発生局面**: case-close STEP-3 のトレーサビリティ独立再検査（3完全性ゲート）を worktree root 起点で実行した際
- **検知方法**: bun run の `error: Module not found ".opencode/skills/agentdev-traceability/scripts/src/check.ts"`
- **根本原因**: worktree の構造的制約（node_modules・junction 未伝播）。agentdev-traceability/scripts は junction 経由で解決される配布 skill 実体のため worktree チェックアウトに含まれない
- **自律対応内容**: main root 側の check.ts 実体から `--root <worktree root>` を明示指定して PR HEAD ツリーを検査対象に実行し、9 pass / 0 fail を確認
- **ユーザー確認の有無**: なし
- **Decision/REQ/spec影響**: なし（check.ts の --root 引数は検証対象リポジトリルート明示の正規手段）
- **横展開観点**: worktree で junction 系 skill scripts（agentdev-traceability 等）を使う検査は、main root 実体からの --root 指定実行で代替可能。QG-4 前提手順の「worktree root 起点で完全性が確定できない場合の main 側 root 再実行」と組み合わせて運用する
- **再発条件**: worktree で junction 系 skill の scripts を実行する場合（case-close / case-run の各検査で高頻度）
- **予防策候補**: worktree 検査手順への「main root 実体 + --root 指定」経路の明記
- **想定反映先**: agentdev-git-worktree の worktree 構造的制約節・case-close 検査手順
- **関連**: Issue #3060 対応記録コメントの検証差分（トレーサビリティ独立再検査行）
- **タグ**: #worktree #junction #traceability-check #case-close
```

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: Issue #3060（対応記録コメントの検証差分が関連）
