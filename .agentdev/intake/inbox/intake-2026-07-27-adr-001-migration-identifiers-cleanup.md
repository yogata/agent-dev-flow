# Intake Item: ADR-001 移行時識別子（WS-9, 案B, 10シナリオ）cleanup

## 発生源

- PR: #1820 (Issue #1814 / OU-002, Epic #1812 Wave 1)
- 発生 phase: case-run 検証（accepted ADR 更新規則の SPEC 検証時）
- capture 分類: intake（具体的修正対象、積み残し作業候補）

## 問題

`docs/adr/ADR-001.md` に移行時識別子が3箇所残存する。Epic #1812 で確定した「accepted ADR の更新規則」（REQ-001-056..060、agentdev-adr-guidelines SPEC）により、これらは非意味修正として直接除去可能となった。ただし ADR-001 の編集は当該 Issue #1814 の対象外（MUST NOT）であり、本 PR では直接修正せず Findings として記録した。

## 推奨修正対象

`docs/adr/ADR-001.md` の3箇所:

1. **L101（決定5 管理方式 表）**: `Local backend | 必須範囲に維持。仕様は最小契約へ縮小（WS-9 で対応）`
   - 「WS-9」は非意味ラベルとして直接削除可能（決定内容は不変）
2. **L102（決定5 管理方式 表）**: `draft 形式 | 案B（承認済 change brief）へ縮小。詳細は別途 REQ で定義`
   - 「案B」ラベルは案番号のみ削除可能（決定内容は具体文で維持）
3. **L114（決定6 リリース条件）**: `4. 必須シナリオ（10シナリオ）が通る`
   - 10シナリオの定義は SPEC、実行結果は Release Report が所有。ADR-001 本文の当該記載が規範表現に該当するか（=意味変更か非意味修正か）は、適用時に別途判断が必要

## 推奨対応

新ルール（accepted ADR の非意味修正直接更新）の初適用例として、別 Issue（ADR-001 cleanup）または inspect/promote 経由で処理することが望ましい。L114 の「10シナリオ」表記は規範表現の可能性があるため、適用前に agentdev-adr-guidelines SPEC の「意味変更6件」と「非意味修正6件」の判定基準へ照らす必要がある。

## 関連

- references: docs/adr/ADR-001.md (L101, L102, L114)
- Issue: #1814 (CLOSED), Epic: #1812
- PR: #1820 (Findings / Capture候補 セクション)
- REQ: REQ-001-056..060（accepted ADR の意味的不変契約）
- SPEC: docs/specs/skills/agentdev-adr-guidelines.md（accepted ADR の更新規則）
