# pr_desc.md の verify-only 根拠欄に Design 名への壊れた相対リンク 2件（DIST-1）

## 観測内容

配布物テンプレート `src/opencode/skills/agentdev-workflow-templates/templates/pr_desc.md:39`（verify-only 根拠欄の記入規則を案内する HTML comment）に、実在ファイルに解決しない相対リンクが 2 件含まれる:

- `[case-run.md](../../../../../case-run Design)「verify-only 根拠欄の記入規則」`
- `[case-close.md](../../../../../case-close Design)「verification-only PR の files_checked 空確認」`

リンクターゲット `../../../../../case-run Design`・`../../../../../case-close Design` はスペースを含む非パス文字列であり、実在ファイルに解決しない。正しい参照先は `docs/designs/commands/case-run.md`・`docs/designs/commands/case-close.md`。

導入経緯: 2026-09-14 実施の前回全数走査（相対リンク クリーン）以降、2026-09-19 commit `3801398d` の追加行（Case #2979 OU-002「4 Design 名 v4 後継張替え」）で導入。同 commit の「Design 名後継張替え」は他の参照先では正常適用済み（grep で同型壊れリンクは本 2 件のみ確認）。

## 影響

- severity: medium。HTML comment 内の案内文の参照切れで PR 本文出力への直接影響はないが、配布物テンプレートの参照破綻として docs-spec-rebuild-integrity Design（文意保持・壊れた参照表現検査、5パターン準拠）の検査対象。
- 配布物整合性検査（inspect-docs 配布物カテゴリ）で継続的に検出される。

## 課題（改善要求）

壊れたリンク 2 件を修正する:

- 案 A: case-run Design / case-close Design の正しい相対パス（`docs/designs/commands/case-run.md` 等、pr_desc.md からの相対パス）へ張替える
- 案 B: リンク形式をやめ、Design 名の名言及（リンクでない参照表現）へ変更する

修正は req-define を要しない軽微修正。実現方法・経路の確定は req-define / case 側の判断。

## 既存要件との関連

- docs-spec-rebuild-integrity Design（配布物の文意保持・壊れた参照表現/リンク切れ検査）— source_of_truth
- Case #2979 OU-002（当該行の導入元。張替えミスの残存）
- agentdev-workflow-templates（pr_desc.md の所有配布スキル）

## 出典

- 検出事項: `.agentdev/inspect/inbox/inspect-docs-finding-20260922T051848Z.md` の DIST-1（backlog-auto run3 stage 1 の inspect-docs 診断、2026-09-22、confidence: high〔機械的に一意判定: ターゲット非実在〕、severity: medium）
- 同一検出事項の run3 再掲: `.agentdev/inspect/inbox/inspect-docs-finding-20260922T102316Z.md` の DIST-1（backlog-auto run3 stage 1 再実行〔基準コミット fea22bf4〕で「内容同一・未修正」と明記して再掲載。run3 基準では pre-existing 表記。診断記録本体は stage 1 commit b0a51049 で git 履歴保存済み）。重複のため本成果物へ集約し、再掲ファイルは reject（即時削除）
- 分類: promote（自律確定。現物検証済みの明確な不整合〔pr_desc.md:39 実読確認〕、修正対象と正しい参照先の一意特定、採否の機械的一意判定、adversarial-review〔in-context〕で反証 4 件棄却・accepted finding 1 件〔出典併記による重複統合〕を反映、unresolved 0件。Jev probability 1.0）
