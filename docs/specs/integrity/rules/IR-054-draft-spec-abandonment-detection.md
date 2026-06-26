# IR-054: draft SPEC 放置検出

| Field | Value |
|-------|-------|
| rule_id | IR-054 |
| description | draft status の SPEC（`docs/specs/**/*.md`、frontmatter `status: draft`、ADR-0123 定義）が一定期間更新されず放置されることを検出すること（REQ-0154-002）。本ルールは draft SPEC の `updated` frontmatter と実行日の差分が閾値を超過した場合に報告する。status 値そのものの変更、accepted SPEC の陳腐化は対象外（REQ-0154 適用範囲外） |
| severity | heuristic |
| category | document-drift |
| detection_method | (1) `docs/specs/**/*.md` から frontmatter `status: draft` の SPEC を抽出（`accepted`、`status` なしは対象外）。(2) 各 draft SPEC の frontmatter `updated`（YYYY-MM-DD）を基準日として読み取る。(3) 実行日（today）と `updated` の差分日数を算出。(4) 差分日数が閾値（30日、後述「IR-054 閾値設計」参照）を超過した場合、draft 放置候補として報告 |
| affected_artifacts | [docs/specs/**/*.md（frontmatter `status: draft` のみ）] |
| related_req | [REQ-0154-002, REQ-0108-150, REQ-0108-151] |
| related_spec | [integrity-rule-catalog.md, integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。`updated` frontmatter が実態と乖離している場合（更新忘れ）、放置でない SPEC が報告される。レポートは候補提示であり、SPEC owner による確認を前提とする。`updated` frontmatter 自体の正確性は別ルール（REQ-0108-002 必須 field、既存）で担保する |
| regression_test | (未実装)。既知 true positive として `updated` を閾値以上過去日とした draft SPEC fixture が報告されること、accepted SPEC、status なし SPEC が報告されないことを検証する |
| baseline_status | new |
| finding_route | intake |
| triage_action | 報告された draft SPEC を (a) accepted へ昇格（case-close SPEC 確定チェック）、(b) 内容更新のうえ `updated` を最新化、(c) 廃止判断のいずれかへ分類する |
| last_verified | (新規登録時) |

## IR-054 閾値設計（REQ-0154-002）

draft SPEC 放置検出の閾値、判定アルゴリズム、レポート形式を規定する。本節が SPEC 詳細の原本であり、docs-check 実装（`check_integrity.ts`）は本節に従う。

**閾値**:

| 項目 | 値 | 根拠 |
|------|------|------|
| 基準日 | frontmatter `updated`（YYYY-MM-DD） | SPEC ファイルが最後に編集された日。ADR-0123 で SPEC lifecycle のメタデータとして定義済み |
| 比較日 | docs-check 実行日（today） | 定期実行、PR 実行時の現在日 |
| 期間閾値 | 30日 | SPEC が draft から accepted へ昇格するまでの妥当な作業期間。RU-0001 先例（draft SPEC 放置問題）の再発防止を目的とし、放置と正常進行の境界を区別する |

閾値は本 SPEC で固定値（30日）とする。環境変数等での上書きは行わず、必要に応じて本 SPEC の改訂（REQ-0154-002 に基づく SPEC 更新）で変更する。

**判定アルゴリズム**:

```
for each file in glob('docs/specs/**/*.md'):
    frontmatter = parse_yaml_frontmatter(file)
    if frontmatter.status != 'draft':
        continue  # accepted または status なしは対象外
    if not frontmatter.updated:
        continue  # updated frontmatter なしは別ルール（IR-002 相当）対象
    age_days = today - parse_date(frontmatter.updated, '%Y-%m-%d')
    if age_days > 30:
        report(file, age_days, frontmatter.updated)
```

**レポート形式**:

draft 放置候補は docs-check の検出事項（finding）形式で報告する。

```
IR-054: draft SPEC 放置候補
  対象: docs/specs/commands/case-run.md
  status: draft
  最終更新日: 2026-06-21
  経過日数: 35日（閾値30日超過）
```

**対象外**:

| 対象外 | 理由 |
|--------|------|
| frontmatter `status: accepted` の SPEC | accepted SPEC は SPEC lifecycle の最終状態。陳腐化検出は別課題（本ルール対象外、REQ-0154-002 は draft のみ対象） |
| frontmatter `status` なしの SPEC | status 付与自体が別課題（REQ-0154-001 の SSoT 表で `-` 表示）。本ルールは status が存在し `draft` である SPEC のみ対象 |
| ADR-0123 で定義された status 値の変更 | REQ-0154 適用範囲外 |
