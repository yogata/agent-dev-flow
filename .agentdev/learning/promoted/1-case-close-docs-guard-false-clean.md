# case-close Step 3-1 docs guard の false-clean 予防（--files 標準化・files_checked 空確認）

## 背景

case-close Step 3-1 の targeted docs guard（REQ-0158-003）で `check_changed_docs.ts --base-ref <merge-base>` を実行した際、case-close は main ワークツリーで実行され PR ブランチを checkout しないため、HEAD は main 先端（= merge-base と同一）になり diff が空になる。PR が2ファイル変更しているのに `files_checked: []`・`failures: []` が返り false-clean になる事象が発生した（PR #1426）。

## 問題

`--base-ref` は PR ブランチ上で実行する前提だが、case-close 手順はその前提を明記していない。スクリプト側も `files_checked` 空時に warning を出さないため、実行者が空結果を検知できず pass 判断してしまう。false-clean は検査見逃しリスクを生む。

## 望ましい変更

(a) case-close Step 3-1 の起動例を `--files`（PR 変更ファイル明示）を標準とする。(b) check_changed_docs.ts が `files_checked` 空時に warning を出す。(c) case-close 手順に「`files_checked` が空でないことの確認」ステップを追加する。

## 対象範囲

### 対象

- `docs/specs/commands/case-close.md` Step 3-1（docs guard 起動手順明確化）
- `scripts/check_changed_docs.ts`（files_checked 空時 warning 追加）

### 対象外

- check_integrity.ts 等、他の `--base-ref` を使うスクリプト（横展開観点として参考だが本 Issue の対象外）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `docs/specs/commands/case-close.md` Step 3-1 | `--files` 標準化、`files_checked` 空確認ステップ追加、`--base-ref` の前提（PR ブランチ上実行）明記 |
| script | `scripts/check_changed_docs.ts` | `files_checked` 空時 warning 出力追加 |

## 既存対策確認

- **確認結果**: 既存対策あり（ただし手順の明確化・スクリプト警告なし）
- **該当ファイル**: `docs/specs/commands/case-close.md` Step 3-1（REQ-0158-003）、`scripts/check_changed_docs.ts`
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: `--base-ref` の前提（PR ブランチ上実行）が手順に明記されていない。main ワークツリー実行時に空 diff になることを案内していない。スクリプトが `files_checked` 空時に warning を出さないため実行者が検知困難

## 制約

- 既存の REQ-0158-003 手順との後方互換性（`--base-ref` を完全廃止せず、前提を明記しつつ `--files` を推奨）
- check_changed_docs.ts の既存テストが壊れないこと

## 受け入れ条件

- [ ] case-close Step 3-1 の起動例で `--files`（PR 変更ファイル明示）が標準として明記されていること
- [ ] case-close 手順に「`files_checked` が空でないことの確認」ステップが追加されていること
- [ ] check_changed_docs.ts が `files_checked` 空時に warning を出すこと
- [ ] `--base-ref` を使う場合の前提（PR ブランチ上実行）が明記されていること

## 元learning item / 根拠

- **要約**: case-close が main ワークツリーで `--base-ref` を使うと空 diff を返し docs guard が false-clean になる問題クラス（1件）
- **根拠**: PR #1426（Issue #1425）で `--base-ref 453cf9a8`（merge-base）実行結果の `files_checked: []` を確認時、PR が case-close.md と SKILL.md の2ファイルを変更しているのに空だったため不整合に気づいた。`--files` に切り替えて再実行し `files_checked` に2ファイルが入ることを確認してからマージへ進んだ
- **再発条件**: case-close 等 main ワークツリーで実行するコマンドが `--base-ref` で docs guard / integrity check を起動し、結果の `files_checked` 空を確認せず pass 判断した場合
- **横展開可能性**: `--base-ref` を使う整合性スクリプト全般（check_integrity.ts 等）で同パターン

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement, bug
- **関連Issue**: Issue #1425, PR #1426, REQ-0158-003, IR-056
