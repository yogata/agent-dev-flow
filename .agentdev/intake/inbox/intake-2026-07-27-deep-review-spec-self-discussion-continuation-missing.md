# Intake Item: agentdev-deep-review SPEC の完了条件セクション欠落（TS-007 FAIL）

## 発生源

- PR: #1832 (Issue #1830 / OU-002, Epic #1828 Wave 1)
- 発生 phase: case-run での SPEC 内容検証（TS-007）時
- capture 分類: intake（具体的修正対象、積み残し作業候補）

## 問題

`docs/specs/skills/agentdev-deep-review.md` は AG-013 が合意した完了条件8項目（本質的争点がすべて閉じていること、妥当と合意した批判が反映されていること、撤回/棄却された批判が混入していないこと、部分合意の採用範囲と非採用範囲が明確であること、ユーザー判断事項が残っていないこと、修正版への再検証が完了していること、再検証後に新たな本質的争点が残っていないこと、批判を継続すること自体を目的とした議論だけが残っていないこと）を列挙していない。SPEC line 44-46「合意条件」は争点の閉じ方を定義するが、審議全体の完了条件ではない。固定観点全PASS否定、形式同一判定否定も明示されていない（line 45「形式的全会一致ではなく」は部分的重複のみ）。

配布スキル references/deep-review-protocol.md「合意条件と完了条件」は完了条件8項目を実装詳細として保持しているが、SPEC は振る舞い契約の正典であり SPEC 側での補完が必要。

## 推奨修正対象

`docs/specs/skills/agentdev-deep-review.md` へ「完了条件」セクションを新設し、8項目と固定観点全PASS否定、形式同一判定否定を明記する。

候補セクション（PR #1832 SPEC確定候補 SC-2 より）:

```markdown
## 完了条件
- 審議全体の完了は、形式的全会一致や固定観点全PASSではなく、本質的合意条件で判断する。
- 固定観点全PASSや形式同一判定を完了条件としない。
- 完了条件は次の8項目を満たすこと:
  1. 本質的争点がすべて閉じていること
  2. 妥当と合意した批判が反映されていること
  3. 撤回/棄却された批判が混入していないこと
  4. 部分合意の採用範囲と非採用範囲が明確であること
  5. ユーザー判断事項が残っていないこと
  6. 修正版への再検証が完了していること
  7. 再検証後に新たな本質的争点が残っていないこと
  8. 批判を継続すること自体を目的とした議論だけが残っていないこと
```

## 推奨対応

後続 spec-update Issue（`/agentdev/req-define` → `/agentdev/spec-save` 相当）で本 SPEC への追記を実施する。RU-20260726-01 AG-013 由来の合意事項であるため、新規 RU より既存 RU の再参照が適切。F-1（自律審議継続）と同時対応可能。

## 関連

- SPEC: docs/specs/skills/agentdev-deep-review.md
- 正規 REQ: docs/requirements/REQ-003.md REQ-003-034（争点単位合意）
- source RU: RU-20260726-01 AG-013
- Issue: #1830 (CLOSED/COMPLETED), Epic: #1828 (CLOSED/COMPLETED)
- PR: #1832 (Findings / Capture候補 セクション F-2)
- 実装詳細参照先: src/opencode/skills/agentdev-deep-review/references/deep-review-protocol.md「合意条件と完了条件」
