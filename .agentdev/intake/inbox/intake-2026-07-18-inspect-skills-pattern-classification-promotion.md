# Intake Item: 4観点の責務越境パターン分類表の SPEC 昇格検討

## 発生源

- PR: #1535 (Issue #1533 / OU-002, direct_case)
- 発生 phase: case-close SPEC 確定候補分析 (Step 3-2)
- capture 分類: intake (将来検討事項 = 横断的再利用進捗監視)

## 問題

`src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md`「誤認パターンと診断分類」セクションに、4観点（semantic-duplication / semantic-contradiction / canonical-definition-deviation / semantic-contract-missing）の責務越境パターンを分類表として集約した。

現状は inspect-skills の運用ビュー（references）に集約し REQ-0125-004 準拠。ただし、同じ分類が他の inspect-* skill（inspect-docs、inspect-extensions）や品質ゲート skill（agentdev-quality-gates）でも横断的に参照される可能性がある。横断的再利用が進んだ段階で SPEC 昇格を検討する知見として蓄積。

## 推奨修正対象

現時点では修正不要（見送り）。以下のトリガー条件が発生した場合に SPEC 昇格を検討:

1. inspect-docs / inspect-extensions が同等の責務越境パターン分類を必要とした場合
2. agentdev-quality-gates が QG-3 実装乖離分類で同等のパターンを参照した場合
3. 複数 skill で重複してパターン表を維持する運用コストが顕在化した場合

昇格先候補: `docs/specs/responsibilities/artifact-responsibilities.md`（責務分担マッピングの補完セクション）、または新設 SPEC `docs/specs/quality/semantic-diagnostic-patterns.md`

## 関連

- references: src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md (L128-145)
- Issue: #1533 (CLOSED)
- PR: #1535 (SPEC確定候補セクション、merge 1c10ad2)
- REQ: REQ-0125-003 (診断観点)、REQ-0125-004 (skill 集約)
