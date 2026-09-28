# intake: コマンドリファレンス README の「廃止コマンドの移行案内」節（:49-57）の将来 RETIRE 判定候補

- 観測日: 2026-09-28
- 観測元: case-close #3202（OU-005・source_ru: RU-0006、PR #3209 merge 済み・merge commit e4fb878e）の Capture 回収（PR 本文「Findings / Capture候補」intake）
- 種別: 情報寿命評価要求（RETIRE 判定候補・軽微。完了条件・検証への影響なし）

## 要求内容

`src/opencode/commands/agentdev/README.md` の「## 廃止コマンドの移行案内」節（:49-57）は、quickstart.md 同名節と同一トピックの独立節である。DEC-033（v4 公開運用モデル）・DEC-034（v4 cutover・self-hosting）ともに accepted、RD-003 情報寿命の論理を適用すると将来的に同種の RETIRE 判定候補になり得る。quickstart.md 側の同節は OU-005（Issue #3202・PR #3209）で RETIRE 判定・削除済み。

## 提案する補正

- コマンドリファレンス（配布物）側の節であるため導線価値判断を含み、OU-005 の対象範囲（docs/guides/quickstart.md）外として本 Issue では扱わなかった。
- 将来、コマンドリファレンス README の情報寿命棚卸し時に「## 廃止コマンドの移行案内」節（:49-57）の RETIRE 判定（削除 or 現行化の維持）を評価する。
- 判定にあたっては RD-003（RETIRE 判定根拠）と配布物としての移行案内導線の価値判断を併記して合意する。

## 根拠

- PR #3209（squash merge commit e4fb878e）の「Findings / Capture候補」に intake として記録済み。
- TS-008 参照確認（repo 全域 grep 3 種）で quickstart 節への参照 0 件を確認した際、`src/opencode/commands/agentdev/README.md:49` の同名節が唯一の残存出現として観察された（同所は quickstart 節へのリンク・アンカーを持たない独立節で、参照整理の対象外）。
