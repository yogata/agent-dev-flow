# REQ Impact Map

各 active REQ が影響する integrity rule と artifact を記載するマップ（REQ-0108-152）。10 以上の active REQ をカバーする。

## Impact Matrix

| REQ | タイトル | 影響する Rule IDs | 影響する Artifact |
|-----|---------|------------------|------------------|
| REQ-0101 | 文書・REQ管理基準 | IR-001, IR-002, IR-003, IR-004, IR-017, IR-018, IR-022 | REQ, REQ index, DOC-MAP |
| REQ-0103 | Artifact責任分界 | IR-006, IR-008, IR-014, IR-016, IR-024 | commands, skills, templates, SPEC |
| REQ-0108 | Integrity/Validation/Tests | IR-001~IR-024 (全件) | 全 artifact |
| REQ-0107 | Reporting/Writing Quality | IR-013, IR-019 | templates, guides |
| REQ-0104 | Workflow/Command Protocol | IR-006, IR-024 | commands |
| REQ-0105 | RU lifecycle / Requirement Unit 管理 | IR-016 | domain state |
| REQ-0106 | Case実行オーケストレーション / Epic・Wave | IR-006, IR-013, IR-016 | commands, templates |
| REQ-0109 | REQ再構成運用 | IR-004, IR-011, IR-015 | REQ, mapping-table, retired REQ |
| REQ-0112 | ADR status正規化 | IR-005, IR-010 | ADR, ADR index |
| REQ-0113 | Skill References SPEC分離 | IR-008, IR-014 | skills, skill references |
| REQ-0114 | case-auto最大自走モード | IR-006, IR-016 | commands |
| REQ-0119 | コマンド・スキル・サブエージェント責務分界の再基準化 | IR-006, IR-008, IR-014, IR-024 | commands, skills |
| REQ-0123 | workflow-lifecycle 宣言的純化とコマンド固有手順の目的別スキル移管 | IR-006, IR-008, IR-014 | commands, skills |
| REQ-0124 | AgentDevFlow inspect-* 検出コマンド群と inspect lifecycle | IR-006, IR-024 | commands |
| REQ-0125 | inspect-skills / Command/Skill参照妥当性検出 | IR-008, IR-014 | commands, skills |
| REQ-0126 | inspect-promote / 検出finding分類・昇格 | IR-016 | domain state |
| REQ-0127 | Intake command群 (capture / from-github / promote) | IR-016 | domain state |
| REQ-0128 | Learning-promote | IR-016 | domain state |
| REQ-0129 | Backlog-review | IR-016 | domain state |
| REQ-0130 | case-run / 実装パイプライン | IR-006, IR-013, IR-016 | commands, templates |
| REQ-0131 | case-close / 完了処理 | IR-006, IR-013, IR-016 | commands, templates |
| REQ-0132 | case-open / Issue作成 | IR-006 | commands |
| REQ-0133 | case-update / Issue更新 | IR-006 | commands |
| REQ-0110 | Git worktree cleanup 信頼性 | — (infrastructure) | — |
| REQ-0102 | 要件定義・保存 | IR-001, IR-002 | REQ |

## Impact Categories

### High Impact (5+ rules)
- **REQ-0108**: 全 integrity rule に影響 (IR-001~IR-024)
- **REQ-0101**: REQ 管理基準として広範囲に影響 (7 rules)
- **REQ-0103**: artifact 配置規約として広範囲に影響 (5 rules)

### Medium Impact (3-4 rules)
- **REQ-0109**: REQ 再構成運用 (3 rules)
- **REQ-0119**: コマンド・スキル・サブエージェント責務分界 (4 rules)
- **REQ-0104**: Command protocol (2 rules)
- **REQ-0106**: Case 実行オーケストレーション (3 rules)
- **REQ-0107**: Reporting (2 rules)

### Low Impact (1-2 rules)
- **REQ-0102**, **REQ-0105**, **REQ-0112**, **REQ-0113**, **REQ-0114**, **REQ-0123**, **REQ-0124**, **REQ-0125**, **REQ-0126**, **REQ-0127**, **REQ-0128**, **REQ-0129**, **REQ-0130**, **REQ-0131**, **REQ-0132**, **REQ-0133**

### No Direct Impact
- **REQ-0110**: Git worktree cleanup 信頼性（infrastructure 層）

## 3-Layer Gate Structure

| Layer | Trigger | 実行 Rules | Target |
|-------|---------|-----------|--------|
| Full Audit | 定期実行、重大変更、リリース前 | IR-001 ~ IR-024 (全24件) | 全 artifact |
| Delta Guard | PR 作成時、通常開発時 | 変更ファイル種別に対応する rules | 変更関連 artifact |
| Impact Guard | 特定 REQ/ADR 変更時 | 該当 REQ の Impact Matrix 行の rules | 影響範囲 artifact |

### Delta Guard Rule Selection

| 変更種別 | 実行 Rules |
|---------|-----------|
| Command 追加/変更 | IR-006, IR-007, IR-013, IR-024 |
| Skill 追加/変更 | IR-007, IR-008, IR-014 |
| REQ 追加/変更 | IR-001, IR-002, IR-004, IR-022 |
| ADR 追加/変更 | IR-005, IR-010 |
| SPEC 変更 | IR-017, IR-023 |
| Template 変更 | IR-012, IR-013 |
| Source/projection 変更 | IR-016 |

### Recurrence Triage

再発 finding 検出時の対応ループ:

1. **検出**: finding が baseline-known に存在するか確認
2. **分類**: known (baseline済み) vs new
3. **再発判定**: known finding が再度検出された場合:
   - rule/detector の誤検知 → rule を修正 (false positive)
   - 真の再発 → detector を強化、または prevention gate を追加
   - baseline 判定ミス → baseline を更新
4. **改善 loop**: rule catalog / baseline / impact map / exception を更新
5. **記録**: トリアージ結果を integrity report に記録
