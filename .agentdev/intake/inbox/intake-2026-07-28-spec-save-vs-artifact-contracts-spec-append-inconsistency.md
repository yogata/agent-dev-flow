# intake: spec-save.md と artifact-contracts.md の spec-append 同名見出し時挙動が不整合

## 発生日

2026-07-28

## 発生元

- Epic: #1881 (alloc-composite-id + spec-append)
- Issue: #1887 (OU-006: agentdev-spec-file-manager.md 提供操作セクション更新)
- PR: #1914
- 取得元: PR #1914 本文「## Findings/ Capture候補」セクション

## 問題事象

`docs/specs/commands/spec-save.md`（lines 162-171）と `docs/specs/responsibilities/artifact-contracts.md`（lines 500-510）で spec-append の「同名見出し時の挙動」と「合格基準」が不整合:

- spec-save.md L164: 「`content` の見出し行と同名の見出しが既存 SPEC ファイルに存在する場合、spec-save は warn を出力し、追加処理は継続する」
- artifact-contracts.md L502: 「`target_area` と完全一致する見出しが既存 SPEC ファイルに存在する場合、追加をスキップし follow-up 報告を行う」
- 合格基準も artifact-contracts.md は「target_area と完全一致する見出しが1つだけ存在すること」、spec-save.md は「anchor 特定 + Markdown 構造保持 + frontmatter updated + status 変更しない」と表現が異なる。

## 影響

- spec-append 実行時の同名見出し検出で warn継続 か skip+follow-up かが SPEC 間で異なり、実装時の判断が不明確。
- artifact-contracts.md（OU-003 PR #1907 で更新済み）を正とすると spec-save.md 側の更新が別途必要。

## 発生局面

実装（case-close時の PR 本文 capture 回収）

## 検知方法

PR #1914 の Findings セクションで明示。spec-save.md L162-171 と artifact-contracts.md L500-510 を比較。

## 想定される対応方向

- spec-save.md「spec-append 操作時のセクション追加ロジック」節を artifact-contracts.md（正）へ整合させる（skip + follow-up へ統一）
- または artifact-contracts.md を spec-save.md へ整合させる（warn 継続へ統一）。いずれか正規所有を確定させる。

## 関連

- Epic: #1881
- Issue: #1887 (OU-006)
- 対象ファイル: `docs/specs/commands/spec-save.md` L162-171, `docs/specs/responsibilities/artifact-contracts.md` L500-510
- 正規所有候補: artifact-contracts.md（cross-cutting 契約のため）

## 出典引用

PR #1914 本文「## Findings/ Capture候補」より:

> `docs/specs/commands/spec-save.md`（lines 162-171）の「同名見出し時の挙動」と「合格基準」が `docs/specs/responsibilities/artifact-contracts.md`（OU-003 で更新、lines 500-510）と不整合... artifact-contracts.md（OU-003 最新）を正とする場合、spec-save.md の「spec-append 操作時のセクション追加ロジック」節の更新が別途必要。

## タグ

#intake #spec-save #artifact-contracts #spec-append #spec-inconsistency #epic-1881
