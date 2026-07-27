# intake: search-target-area.ts 完全一致実装修正が Wave 2/3 Issue に未割当

## 発生日

2026-07-27

## 発生元

- Epic: #1881 (Wave 1 完了、Wave 2/3 残)
- Issue: #1882 (OU-001), #1883 (OU-002)
- PR: #1902, #1903
- 取得元: PR #1903 本文「後継作業への参照事項」セクション、PR #1902 本文「補足」セクション

## 問題事象

Epic #1881 の完了条件に下記2件が含まれているが、Wave 2/3 の子 Issue (#1884, #1885, #1886, #1887) のいずれも直接の担当スコープとして明示していない:

- `src/opencode/skills/agentdev-spec-file-manager/scripts/src/search-target-area.ts` が見出し行全体との完全一致のみを受け付ける実装になっていること
- 正規表記 `### IR-044` で回帰テストが全て PASS すること

PR #1903 は SPEC 契約（見出し行本体完全一致、前方一致廃止）を形式化したのみで、search-target-area.ts の実装修正は「後継 Issue で実施する」と明記して本 Issue スコープから外した。同じく PR #1902 も SPEC 形式化のみで実装修正は後継 Issue に委譲している。

## 影響

- Epic #1881 の完了条件が Wave 2/3 を完了しても達成されない可能性がある。
- search-target-area.ts の前方一致許容が残存するため、`### IR-044` 等の正規見出しを未検出としてスキップするリスクが継続する。
- spec-save 実行時の target_area マッチング精度が SPEC 契約と実装で乖離する。

## 発生局面

計画（req-define/case-open）+ 実装（Wave 1 case-close 時の PR 本文 capture 回収）

## 検知方法

PR #1903 の「後継作業への参照事項」セクションで「search-target-area.ts 実装修正は後継 Issue で実施する」と明記されていること、かつ Wave 2/3 Issue (#1884〜#1887) のタイトルがいずれも SPEC 更新のみで実装修正を含まないことを確認。

## 想定される対応方向

下記いずれかを要件定義工程で確定させる必要がある:

- 既存 Wave 2/3 Issue のいずれか（#1887 が最も近い）へ search-target-area.ts 実装修正スコープを追加する
- 新規 Issue を起票して Wave 4（または Wave 3 末尾）へ組み込む
- Epic 完了条件から実装修正を外し、SPEC 契約のみで完結する運用に変更する

## 関連

- Epic: #1881
- Wave 1 Issue: #1882, #1883
- Wave 2 Issue: #1884 (OU-003 artifact-contracts.md)
- Wave 3 Issue: #1885 (OU-004 req-define.md), #1886 (OU-005 spec-save.md), #1887 (OU-006 agentdev-spec-file-manager.md)
- 実装対象ファイル: `src/opencode/skills/agentdev-spec-file-manager/scripts/src/search-target-area.ts`
- SPEC 契約: `docs/specs/commands/spec-save.md` に既に形式化済み（PR #1903 にて）

## 出典引用

PR #1903 本文「後継作業への参照事項」より引用:

> search-target-area.ts 実装修正（見出し行本体との完全一致への移行）は Epic 完了条件にあるが、本 Issue では SPEC 契約のみ形式化し、実装修正は後継 Issue で実施する。本 PR の SPEC 変更と実装修正は独立して進行可能

## タグ

#intake #search-target-area #spec-implementation-gap #epic-completion-criteria #wave-planning
