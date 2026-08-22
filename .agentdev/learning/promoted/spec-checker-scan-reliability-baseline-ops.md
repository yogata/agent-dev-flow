# checker 走査の信頼性保証と NG baseline 導入運用

## 背景

再帰ファイル探索移行（PR 2357）で、旧 walk 実装のディレクトリ単位エラー握り潰し（catch-and-skip）が Windows のディレクトリロック時に一過性の走査減少（455→285件等）を生み、部分走査でも正常終了の体裁でレポートが出る構造が確認された。同移行で Bun 1.3.10（Windows）の node:fs globSync 制約（ドット始まりパス要素を列挙不可、junction/symlink を下降、withFileTypes 非対応）が実測され、補助経路（トップレベル readdir で発見 → cwd 直指定 glob）と祖先 lstat 検査で網羅・契約維持した。PR 2377 では checker を scripts ディレクトリを cwd に起動すると repoRoot 解決誤りで zero-targets fail-closed になった。baseline 運用では、ng-baseline.json の環境別表記重複 entry（PR 2254）と、新規検査クラス導入時の既知違反222件で main が赤固定になる問題（PR 2376）が発生し、additions manifest（provenance/reason 記録）による delta 0 初期化で導入安全化を実証した。

## 問題

- 走査エラーを握り潰す実装が部分レポートを静かに生み、列挙件数の期待値突合が各 checker に存在しないため検出手段がない
- Bun/Windows の globSync 制約は実測記録が残っているが、共通ヘルパー経由の限定とバージョン更新時の再実測が手順化されていない
- checker の起動 cwd 前提（repo root 起点）が共通実行契約に明記されていない
- 新規検査クラス導入時に既知違反で main が赤固定になるリスクと、additions manifest による初期化手順が標準化されていない
- baseline の環境別表記 entry は再生成タイミングで統合される見込みだが、その運用条件（直列実行可能な時期）が明文化されていない

## 望ましい変更

- 各 checker の出力に列挙件数の期待値突合（固定期待値または前回実行値からの大幅減少警告）を導入する（パターンマッチ・網羅検査設計の「二重確認」規約の適用）
- node:fs glob 利用は globWalkRel / enumerateFilesRel 共通ヘルパー経由に限定し、Bun バージョン更新時にドット要素列挙・withFileTypes 対応の再実測を手順化する
- checker 共通実行契約へ起動 cwd 前提（repo root 起点）を明記する
- 新規検査クラス導入手順へ「既知違反の additions manifest 初期化（provenance/reason 記録）と delta 0 確認」を標準ステップとして組み込む
- baseline の環境別表記 entry 統合を、並列実行していない時期の一括再生成タイミングで実施する運用を明記する

## 対象範囲

### 対象

- repo-agentdev-integrity の各 checker・共通ヘルパー（glob_walk.ts）
- checker 共通実行契約（checker-execution-contracts Design）
- integrity-contracts の baseline entry 運用契約
- 新規機械検査クラスの導入手順

### 対象外

- glob_walk.ts 共通ヘルパーの実装本体（移行済み）
- ng-baseline.json の既存 entry 編集（機械生成必須契約により手書き削除禁止）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | docs/designs/integrity/checker-execution-contracts.md | 列挙件数の期待値突合規約、起動 cwd 前提（repo root 起点）、glob 共通ヘルパー限定と Bun バージョン再実測を明記 |
| spec | docs/designs/integrity/integrity-contracts.md（baseline entry 運用契約） | 新規検査導入時の additions manifest 初期化手順と環境別表記統合の運用条件を明記 |
| skill | .opencode/skills/repo-agentdev-integrity/SKILL.md（repo-local） | checker 起動手順（repo root 起点）の明記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: glob_walk.ts 共通ヘルパー（ENOENT 以外伝播・ドット要素補助経路・リンク非下降、移行済み）、IR-065/066 ルールファイル（existence_probe 等の許容条件）、ng-baseline additions manifest 運用（PR 2376 実績）、エラー伝播方針の Design確定候補（intake item 2026-08-21-node-fs-glob-design-complement.md）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 構造的対策（共通ヘルパー）は移行済みだが、(1) 列挙件数の期待値突合、(2) 起動 cwd 前提の明記、(3) Bun バージョン更新時の再実測手順、(4) 新規検査導入時の baseline 初期化標準ステップ、(5) 環境別表記統合の運用条件が文書化されていない

## 制約

- baseline 編集は機械生成（--update-ng-baseline）のみ。手書き削除は禁止
- baseline 更新は並列 Wave 実行中に実施しない（同一 baseline 二重更新禁止）
- Bun の globSync が内部で一部エラーを握り潰す可能性は残存する前提で件数突合で検出する

## 受け入れ条件

- [ ] checker の列挙件数期待値突合（二重確認）規約が文書化されている
- [ ] checker 起動 cwd 前提（repo root 起点）が共通実行契約に明記されている
- [ ] glob 共通ヘルパー限定と Bun バージョン再実測手順が明記されている
- [ ] 新規検査導入時の additions manifest 初期化手順（provenance/reason 記録、delta 0 確認）が明記されている
- [ ] 環境別表記 entry 統合の運用条件が明記されている

## 元learning item / 根拠

- **要約**: 走査実装の静かな部分レポート排除と baseline 導入安全化（評価スコア: H=29/40、I=26/40）
- **根拠**: PR 2357（エラー握り潰しで一過性走査減少の実観測、globSync 制約の実測）、PR 2377（checker の cwd 起点前提、zero-targets fail-closed）、PR 2254（環境別表記重複 entry の冗長化）、PR 2376（既知違反222件の additions manifest 初期化で delta 0 導入）
- **再発条件**: 走査エラー握り潰しの残存、repo root 以外からの checker 起動、baseline 初期化なしの新規検査導入
- **横展開可能性**: checker・走査実装を持つプロジェクト全般、Bun/Windows 環境知見を含む

## 推奨Issue分類

- **分類**: feature（契約・手順の正式化）
- **推奨ラベル**: enhancement, integrity
- **関連Issue**: Issue 2353（PR 2357）、Issue 2373（PR 2377）、Issue 2206（PR 2254）、Issue 2372（PR 2376）
