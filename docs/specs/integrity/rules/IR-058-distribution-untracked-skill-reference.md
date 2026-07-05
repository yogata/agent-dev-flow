---
status: accepted
---

# IR-058: distribution-untracked-skill-reference

| Field | Value |
|-------|-------|
| rule_id | IR-058 |
| description | 配布物（`src/opencode/commands/agentdev/**/*.md`、`src/opencode/skills/**/*.md`）が `.opencode/skills/` 配下にのみ存在し `src/opencode/skills/` に存在しないスキルを参照している場合、配布物の自己完結性（self-contained）違反として検出する（REQ-0159-003、ADR-0134）。検出時は `src/opencode/skills/` への昇格を促すメッセージを出力する |
| severity | strict |
| category | integrity-rule-gap |
| detection_method | `check_integrity.ts` の `checkDistributionUntrackedSkillReference` が実装する。ステップ1: `.opencode/skills/` 配下のディレクトリ一覧から `src/opencode/skills/` に存在しないもの（projection-only）を抽出し、`repo-*` プレフィックス（ADR-0106 repo-local）を除外する。ステップ2: 各 projection-only スキル名について、配布物ファイル群を走査し、パス参照（`.opencode/skills/<name>`、`src/opencode/skills/<name>`）、バッククォート参照（`` `<name>` ``）、日本語散文参照（`<name> スキル`、`<name>スキル`）、`load_skills` リテラル参照のいずれかで出現するか確認する。出現した場合は src 昇格を促す NG を出力する |
| affected_artifacts | [src/opencode/commands/agentdev/**/*.md, src/opencode/skills/**/*.md, .opencode/skills/<name>/] |
| related_req | [REQ-0159-001, REQ-0159-002, REQ-0159-003] |
| related_spec | [../integrity/integrity-rule-catalog.md, ../local/runtime-package-boundary.md] |
| gate_level | full-audit, delta-guard, impact-guard |
| false_positive_risk | 低。スキル名は kebab-case であり語境界マッチで偽陽性は限定的。`repo-*` プレフィックスは ADR-0106 により repo-local として除外。ルールカタログ・vocabulary-registry・IR-058 ルールファイル自体・runtime-package-boundary SPEC は検出語を正当に含むため exemption 対象とする |
| regression_test | `check_integrity.test.ts` の `IR-058 distribution-untracked-skill-reference` ブロック。projection-only かつ配布物から参照されるスキルを置いた fixture で NG が出力されること、参照無し fixture で OK が出力されること、`repo-*` スキルは参照されても検出されないことを検証する |
| baseline_status | new |
| finding_route | intake |
| triage_action | 新規検出時は対象スキルを `src/opencode/skills/` へ昇格（REQ-0159-001）。昇格基準、手順は `runtime-package-boundary.md`「配布物依存スキルの src 昇格」セクション参照。repo-local 専用スキルとして扱う場合は `repo-*` プレフィックスへ rename するか、IR-058 exemption 登録の正当性を別途確認する |
| last_verified | 2026-07-03 |

## 検査項目

`check_integrity.ts` が以下を検査する。

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | projection-only スキル（`.opencode/skills/` 配下、`src/opencode/skills/` 配下に不在、`repo-*` 以外）が配布物から参照されていないこと | strict fail |
| 2 | 検出時はスキル名、参照元ファイルパス、行番号、`src/opencode/skills/<name>/` への昇格を促すメッセージを出力すること | - |
| 3 | projection-only スキルが存在しない場合は OK を出力すること | - |

## 検査対象範囲（scope）

| 区分 | パターン |
|------|----------|
| include | `src/opencode/commands/agentdev/**/*.md`、`src/opencode/skills/**/*.md` |
| projection source | `.opencode/skills/<name>/`（projection-only 抽出の対象） |

## exemption（検出対象外）

| 対象 | 理由 |
|------|------|
| `integrity-rule-catalog.md` | 検出ルール自体の記述。スキル名を正当に言及する |
| `rules/IR-058-*.md`（本ファイル） | IR-058 ルール定義。スキル名を例示する |
| `runtime-package-boundary.md` | 配布境界 SPEC。境界例示としてスキル名を正当に記載する |
| `vocabulary-registry.md` | 語彙対照表。検出語彙を正当に列挙する |
| `repo-*` プレフィックス | ADR-0106 により repo-local 専用スキルとして配布対象外。配布物からの参照があっても consumer 配布を前提としない（別課題） |

## 検出パターン（reference 確認）

スキル名 `<name>` に対する参照検出正規表現（`buildIr058ReferencePattern`）は以下を出現とみなす。

| パターン | 例 |
|----------|-----|
| パス参照 | `.opencode/skills/japanese-tech-writing`、`src/opencode/skills/japanese-tech-writing` |
| バッククォート参照 | `` `japanese-tech-writing` `` |
| 日本語散文参照 | `japanese-tech-writing スキル`、`japanese-tech-writingスキル` |
| `load_skills` リテラル | `load_skills=["japanese-tech-writing"]` |

## 段階導入運用

本ルールは新規導入であり、baseline 0 で開始する。full audit を即 fail gate 化する。既知の正当な projection-only スキル（`repo-*`）は exemption 対象として検出対象外とする。

## See Also

- [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- [rule-ownership.md](../rule-ownership.md)
- [../../local/runtime-package-boundary.md](../../local/runtime-package-boundary.md)（配布物依存スキルの src 昇格）
