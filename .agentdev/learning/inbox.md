# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-09 bun test は repo root から dot-directory 配下の test を位置フィルタで発見できない

- **発生源**: PR #2717（Issue #2708 / OU-009）テスト結果
- **クラス**: ツール制約（反復的誤実行の予防）

`bun test` を repo root で実行した場合、位置フィルタ指定でも `.opencode/` 等 dot-directory 配下の test file が発見対象にならない。`.opencode/skills/repo-agentdev-integrity/scripts/` の test suite を実行する場合は scripts dir を cwd として起動する必要がある（case-run 3 cwd 分割実行の契約と整合）。

## 2026-09-09 worktree への node_modules 非伝播で integrity suite が環境起因 fail する

- **発生源**: PR #2718（Issue #2706 / OU-007）、PR #2717（Issue #2708 / OU-009）テスト結果
- **クラス**: 環境前提（worktree 構造的制約）

git worktree には root の node_modules が伝播しないため、worktree で integrity suite を実行すると `Cannot find package 'zod'`（extension_state.ts import）等の import 失敗が発生する。加えて junction 未伝播の worktree では IR-055 delta-from-baseline テストが baseline パス変換のずれで未編集ファイルを「新規違反」として検出し fail する（変更ゼロの baseline commit で再現確認済み、main root では不発生）。bun install の安易な実行は tsconfig 系ファイル書き戻しリスク（AGENTS.md 警告規定）を伴うため、worktree でフル suite を実行する際はこの既知の環境依存を前提に結果を解釈する。

## 2026-09-09 Windows/Bun のオフライン配布 bundle は target:node 生成と // @bun バナー除去を固定する

- **発生源**: PR #2729（Issue #2724 / Epic #2723 W1）テスト結果
- **クラス**: 環境前提（配布 bundle 生成条件）

Windows/Bun 環境で配布用の単一 ESM bundle を作る場合、`target: node` で生成し、`// @bun` バナーを除去しないと consumer 側で UTF-8 parse error になる。今後のオフライン bundle 作成時は生成条件（target 指定とバナー除去）を固定し、配布同梱前に consumer 実行系での起動を検証する。

## 2026-09-09 Bun.build は require.resolve をビルド時絶対パスへ展開する

- **発生源**: PR #2730（Issue #2725 / Epic #2723 W2）テスト結果
- **クラス**: 環境前提（配布 bundle 生成条件）

Bun.build は `require.resolve("...")` をビルド時の絶対パス文字列へ展開する。runtime で node_modules を前提としない offline bundle では、(1) 実行時に必要なデータ資産（辞書等）は実ファイルで同梱し、(2) 既定解決がビルド場所を参照するライブラリは公式の上書き経路（環境変数等）で配布物相対へ固定する、という構成が配置場所独立の要件を満たす。ビルド場所の worktree が削除された後は焼き付きパスが解決不能になるため、test や standalone 実行で現れる環境依存 failure は bundle 生成時点のビルド場所依存として解釈する。

## 2026-09-09 textlint kernel は plain object report の severity を構成側で正規化する

- **発生源**: PR #2730（Issue #2725 / Epic #2723 W2）テスト結果
- **クラス**: ライブラリ仕様（検査結果の分類）

textlint kernel では、規則が `report(node, plainObject)`（RuleError 非介在）で severity を省略すると規則構成の `options.severity` に関係なく error 固定になる。拒否対象と助言対象の区別を設定側で所有する場合は、kernel 報告 severity ではなく構成側の拒否対象集合（hardRuleIds 等の限定列挙）で分類する。

## 2026-09-09 worktree の独立 bun プロジェクトは各 package で個別 bun install が必要

- **発生源**: PR #2745（Issue #2735 / Epic #2734 W1）テスト結果
- **クラス**: 環境前提（worktree 構造的制約）

worktree で integrity suite を実行する場合、textlint plugin 配下に加えて `src/opencode/skills/agentdev-project-extensions/scripts/` など独立 bun プロジェクト（package.json + bun.lock 構成）でも個別に bun install が必要（node_modules 未伝播の構造的制約）。未実施のまま suite を実行すると zod 解決失敗が現れる。REQ-018（worktree 構造的制約とテスト fallback）関連の補足知見。

## 2026-09-09 対象解決の既定除外は node_modules と歴史記録で加算優先の意味論が異なる

- **発生源**: PR #2745（Issue #2735 / Epic #2734 W1）テスト結果
- **クラス**: ライブラリ仕様（対象解決の意味論）

`**/node_modules/**` を加算設定（additional_targets）で上書き可能にすると glob の `**` 展開が依存配置へ入り込み、TS-004 の node_modules 非含有と矛盾する。TS-004（node_modules 非含有）と TS-005（docs/reports 再包含）の同時成立から「node_modules は加算でも対象外、歴史記録サブツリーは加算優先の再包含対象」の2クラス意味論が一意に確定した。

## 2026-09-09 配布ソースのコメントへの REQ/Design ID 参照は ADF-COVERS 宣言へ集約する

- **発生源**: PR #2745（Issue #2735 / Epic #2734 W1）case-close E4-1 gate 違反
- **クラス**: 規約運用（配布物への concrete-id 混入防止）

実装コメントへの REQ/Design ID 参照は配布物では ADF-COVERS 宣言行以外に書けない（distribution-boundary の concrete-id 検出対象）。契約参照は ADF-COVERS 宣言へ集約し、本文コメントは Design セクション名や「設計契約」等の一般化表現を使うのが配布安全な書き方。

## 2026-09-09 配布手順本文への REQ 行手順化は concrete ID を書かず Design 節名参照へ集約する

- **発生源**: PR #2748（Issue #2743 / Epic #2740 W2）case-run 配布依存境界 gate（初回 concrete_id_hits=12）
- **クラス**: 規約運用（配布物への concrete-id 混入防止）

配布物本文へ REQ/DEC の concrete ID（REQ-{NNNN}-{NNN} 形式等）を記載すると配布依存境界 gate が検出する。配布手順へ REQ 行を手順化する際は、本文では concrete ID を書かず Design 節名参照と内容記述へ集約し、正規の ID 参照はファイル先頭の ADF-COVERS 宣言行（IR-059 免除）へ置くのが正規パターン（PR #2748 で 11件を置換して実証済み）。TS-004/TS-005 のような REQ 行 ID を引く検証記述は docs 配下または一時証跡に限定する。
