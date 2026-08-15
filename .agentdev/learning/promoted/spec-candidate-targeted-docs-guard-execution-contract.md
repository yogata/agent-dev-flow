# check_changed_docs.ts（targeted docs guard）実行契約の手順化（spec 候補）

## 背景

targeted docs guard（`check_changed_docs.ts`）の運用で4件の誤作動が発生した。いずれもスクリプトの CLI 実行契約（モード・引数形式・起動手段）が手順書・ヘルプ文言に明示されず、実行時の試行錯誤に起因する:

1. コミット前に `--base-ref` モードのみ実行し files_checked 空の warning を pass と誤認しうる（PR 2115 / Issue 2105）
2. コミット前の作業ツリー変更が `--base-ref`（git diff base...HEAD）で検出されず「対象ファイルが検出されませんでした」（PR #2124 / Issue 2120）— 1と同根（異 Epic での再発）
3. Node v26 で `node` 直接 / `npx tsx` 起動が import/require 混在により `ReferenceError` で失敗。`bun run` では成功（PR #2126 / Issue 2123）
4. PowerShell で `--files "A B C"` とスペース区切り一覧を引用符で囲み単一 argv 扱いになり TARGET-EMPTY 誤 FAILURE（PR 2133 / Issue 2129）

## 問題

guard 実行契約の未手順化により、(a) 誤 pass（検証漏れ）、(b) 誤 FAILURE（時間消費）、(c) 起動試行錯誤が反復する。guard 判定の信頼性を損なう。

## 望ましい変更

1. ガード実行手順への明記: コミット前は `--files` モード（変更ファイル明示指定）、コミット後は `--base-ref` モードで再実行
2. ヘルプ文言（FILES_DELIMITER_NOTES 等）への shell 別注意喚起: `--files` は引用符なし複数 argv または comma 区切り単一引数で渡す（pwsh の引用符まとめ渡しは不可）
3. 起動コマンドの明示: `bun run` で起動する（Node v26 で node/tsx 直接起動は失敗）。起動手段を SKILL.md・標準手順に明記
4. （拡張候補）`--base-ref` モードが作業ツリーに未コミット変更を検出した際に警告する機能追加

## 対象範囲

### 対象

- `check_changed_docs.ts` の USAGE / ヘルプ文言
- case-run / case-close 等の guard 実行手順が記載される references
- （候補）スクリプト側の未コミット変更検出警告

### 対象外

- `--base-ref` / `--files` のモード設計自体の変更（仕様どおりの挙動）
- comma 区切り受入仕様（v2:REQ-0158-001）の変更
- check_test_impact.ts 等の他スクリプト（同種の可変引数 CLI には横展開観点のみ適用）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| script | `src/opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts` | USAGE の shell 別注意喚起（引用符なし複数 argv / comma 区切り）、起動コマンド（bun run）明記、未コミット変更検出警告（候補） |
| skill reference | `src/opencode/skills/repo-agentdev-integrity/` 関連手順書、case-run / case-close の guard 実行 references | 「コミット前 --files・コミット後 --base-ref」使い分けと bun run 起動の手順化 |
| spec 候補 | `docs/specs/integrity/targeted-docs-guard-implementation.md` | 実行契約（タイミング・引数形式・起動手段）の節追加候補 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `docs/specs/integrity/targeted-docs-guard-implementation.md`（files_checked 空時の確認規定、false-clean 予防: case-close は `--files` 標準・`--base-ref` 補助、main worktree HEAD==merge-base の空 diff 警告）、USAGE 文言（"space-separated recommended"）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 既存規定は case-close 向け。case-run のコミット前タイミング運用、shell 別引数形式（pwsh 引用符）、起動コマンド（bun run）の3点が未手順化

## 制約

- 既存 SPEC の false-clean 予防規定（case-close は --files 標準）と整合させて拡張する（置き換えない）
- argv 内空白の split 追加は空白混入ファイル名との両立問題があるため、文言・手順側の対応を優先する

## 受け入れ条件

- [ ] コミット前後のモード使い分けが guard 実行手順に明記されている
- [ ] `--files` の引数形式（引用符なし複数 argv / comma 区切り）がヘルプ文言に shell 別に明記されている
- [ ] bun run 起動が手順書に明記されている
- [ ] （拡張採用時）未コミット変更検出警告が実装されている

## 元learning item / 根拠

- **要約**: check_changed_docs.ts の実行契約（モード・引数・起動）が未文書化で、誤 pass・誤 FAILURE・起動失敗が4件（3種）発生
- **根拠**: PR 2115（files_checked 空 warning の pass 誤認リスク）、PR #2124（コミット前検出漏れ）、PR #2126（Node v26 起動失敗、PR 2125 でも同一事象）、PR 2133（TARGET-EMPTY 誤 FAILURE、引用符除去で解消）
- **再発条件**: コミット前に --base-ref のみ実行 / pwsh で引用符付きスペース区切りを --files に渡す / bun 以外で起動する場合
- **横展開可能性**: 中程度。可変引数 CLI（check_test_impact.ts 等）を pwsh から呼ぶ全 workflow（req-save、spec-save、case-close）に波及

## 推奨Issue分類

- **分類**: chore（手順・文言整備。拡張候補採用時は fix）
- **推奨ラベル**: documentation, developer-experience, powershell
- **関連Issue**: 2105, 2120, 2123, 2129（いずれもクローズ済みの発生元）
