# req-define-detailed-gates.md の廃止語彙参照の解消

## 観測事実

- Case #4026 Wave 1 境界 case-close（2026-11-13・E6-2 廃止キーワード検索）で、`src/common/skills/agentdev-req-analysis/references/req-define-detailed-gates.md` 85行が req-impact-map.md の削除済み「影響する Artifact」列を語彙参照していることを検出した（Wave 1 子 Issue の対象外領域・修正は Wave 2 のどの子 Issue にも含まれない）。
- 削除済み列の語彙参照であり、代替経路文言が併記されているため実行影響はないが、B3-3（検出ビューの正本再定義）後の語彙整備対象として残存している。
- Wave 2 境界まで intake 化が行われておらず、Case #4026 stage 4（2026-11-13）の Capture 回収で本 item を作成した。

## 具体的な修正対象

- `src/common/skills/agentdev-req-analysis/references/req-define-detailed-gates.md` 85行の req-impact-map.md 削除済み「影響する Artifact」列への語彙参照を、現行の正本（req-impact-map.md・IR frontmatter の AUTOGEN 導出対応表）への参照へ更新する。

## 関連

- Epic #4026 Wave 1 境界取りまとめコメント（E6-2 検出記録・コメント 6832172799）
- req-impact-map.md・rule-ownership.md（B3-1・REQ-047-011〜013 の機械導出化）
