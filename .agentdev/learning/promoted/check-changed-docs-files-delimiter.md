# check_changed_docs.ts --files 引数の区切り形式明示と comma 区切り受入

## 背景

case-close Step 3-1 で check_changed_docs.ts の --files に comma 区切り文字列（"file1,file2,file3"）を渡すと、1つのファイルパスとして解釈され fs.existsSync で除外され files_checked が空になり TARGET-EMPTY（strict severity）が発火した。check_changed_docs.ts の --files パーサは `while (i < args.length && !args[i].startsWith("--")) parsed.files.push(args[i])` で次トークンを順次 file として積む space 区切り仕様。case-close.md の実行コマンド例は `--files <PR 変更ファイル一覧>` と抽象表記で区切り文字が未明示。comma 区切りは仕様外。

## 問題

1. check_changed_docs.ts のヘルプテキスト、エラーメッセージで --files の区切り形式（space 区切り）が未明示。
2. case-close.md Step 3-1 の実行コマンド例、SPEC targeted-docs-guard-implementation.md の呼出例で区切り形式が未明記。
3. comma 区切りで渡すと1ファイル扱いになり files_checked が空になり TARGET-EMPTY strict failure が発火する。

## 望ましい変更

check_changed_docs.ts の usage メッセージで --files の区切り形式（space 区切り）を明示する。comma 区切りも併用受入（split on comma）を実装して堅牢化する。case-close.md / SPEC targeted-docs-guard-implementation.md の呼出例で space 区切りを明示する。

## 対象範囲

### 対象

- `scripts/check_changed_docs.ts`（usage メッセージ、--files パーサ拡張）
- `docs/specs/integrity/targeted-docs-guard-implementation.md`（呼出例に区切り形式明記）
- `src/opencode/commands/agentdev/case-close.md`（Step 3-1 実行コマンド例に区切り形式明記）

### 対象外

- check_changed_docs.ts のその他の引数（--help, --strict-only 等）の仕様変更
- 新規ファイル検出アルゴリズムの変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| code | scripts/check_changed_docs.ts | usage メッセージで --files の区切り形式（space 区切り）を明示、--files パーサ拡張で comma 区切り受入（split on comma） |
| spec | docs/specs/integrity/targeted-docs-guard-implementation.md | 呼出例に --files の区切り形式（space 区切り推奨、comma 区切りも受入）を明記 |
| command | src/opencode/commands/agentdev/case-close.md | Step 3-1 実行コマンド例に --files の区切り形式を明示 |

## 既存対策確認

- **確認結果**: なし（usage/SPEC で区切り形式未明示）
- **該当ファイル**: なし
- **ギャップ分類**: fix gap
- **ギャップ詳細**: check_changed_docs.ts のヘルプテキスト、SPEC 呼出例で --files の区切り形式が未明記。comma 区切りで渡すと1ファイル扱いになる仕様外挙動の警告もない。

## 制約

- 既存の space 区切り仕様を維持しつつ、comma 区切り受入を追加（後方互換性担保）。
- TARGET-EMPTY strict failure の判定ロジック自体は変更しない（files_checked が正当に空でない場合の検出機能は維持）。
- case-run、spec-save 等 --files を使用する全 workflow で同一事象が発生し得るため、呼出例の明示は case-close 以外にも展開を検討（本成果物の対象外だが関連 Issue で扱う候補）。

## 受け入れ条件

- [ ] check_changed_docs.ts の usage メッセージで --files の区切り形式（space 区切り）が明示されている
- [ ] check_changed_docs.ts の --files パーサが comma 区切りを受入（split on comma）する
- [ ] docs/specs/integrity/targeted-docs-guard-implementation.md の呼出例に区切り形式が明記されている
- [ ] src/opencode/commands/agentdev/case-close.md Step 3-1 の実行コマンド例に区切り形式が明示されている

## 元learning item / 根拠

- **要約**: check_changed_docs.ts --files の区切り形式（space 区切り）が usage/SPEC/呼出例で未明示。comma 区切りで渡すと1ファイル扱いになり TARGET-EMPTY strict failure が発火。
- **根拠**: inbox#4 (Epic #1515 Wave 2): case-close Step 3-1 で comma 区切りで渡し files_checked 空、TARGET-EMPTY strict failure 発火。script ソース L121-126 の --files パーサ確認で space 区切り仕様を発見。space 区切りで再実行し files_checked 3件、PASS
- **再発条件**: --files に comma 区切りで複数ファイルを渡す場合
- **横展開可能性**: case-run、spec-save 等 --files を使用する全 workflow で発生し得る

## 推奨Issue分類

- **分類**: fix（スクリプト usage 明示、comma 受入拡充）
- **推奨ラベル**: enhancement, bug
- **関連Issue**: Issue #1520, PR #1526, Epic #1515 Wave 2, OU-005 false-clean 3層防御
