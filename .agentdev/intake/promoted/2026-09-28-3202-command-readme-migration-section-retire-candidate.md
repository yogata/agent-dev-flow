# コマンドリファレンス README「廃止コマンドの移行案内」節（:49-57）の将来 RETIRE 判定候補

- 元 item: .agentdev/intake/inbox/2026-09-28-3202-command-readme-migration-section-retire-candidate.md
- 観測元: case-close #3202（OU-005・RU-0006、PR #3209 merge e4fb878e）の Capture 回収
- 対象: src/opencode/commands/agentdev/README.md:49-57（2026-09-28 現存確認済み。quickstart.md 側同名節は OU-005 で削除済み）

## 課題

配布物（コマンドリファレンス）側の同名節が唯一の残存出現。DEC-033（v4 公開運用モデル）・DEC-034（v4 cutover）とも accepted の現状で、RD-003 情報寿命の論理を適用すると将来的に同種の RETIRE 判定候補。

## 判定要件（合議事項）

- RETIRE 判定（削除 or 現行化の維持）は RD-003（RETIRE 判定根拠）と配布物としての移行案内導線の価値判断を併記してユーザー合意によること。
- 配布物であるため導線価値判断を含み、docs/guides 側（OU-005 対象範囲外）として本 Case では扱わなかった経緯を保持。

## route 提示（backlog-review 判断用）

- 将来の配布物情報寿命棚卸し Case での評価対象として保持。単独で Case 化する優先度は低い（軽微・完了条件への影響なし）。
