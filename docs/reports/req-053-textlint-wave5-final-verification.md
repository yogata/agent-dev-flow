---
id: REQ-053-TEXTLINT-WAVE5-FINAL-VERIFICATION
title: "textlint Wave5 最終検証・完了証拠・実行記録"
status: accepted
created: 2026-09-10
source_issue: "#2739"
parent_epic: "#2734"
---

<!-- ADF-COVERS(implementation): REQ-053-014, REQ-053-016, REQ-053-019, REQ-053-020, REQ-053-021, REQ-053-037, REQ-053-038, REQ-057-024 -->

# textlint Wave5 最終検証・完了証拠・実行記録

本 Report は、textlint 是正キャンペーン Epic（#2734）の最終 Wave 5（Issue #2739、RA-005 最終検査・完了証拠・実行記録）の実行記録である。最終 HEAD の実ファイル全文を gate.ts で再検証し（TS-002）、Wave2 正式初期判定との規則構成突合を行い（TS-001）、REQ-053-014 から REQ-053-021 の完了証拠契約を Wave3/4 のファイル単位記録との参照集約で満たす。あわせて IR-055 baseline の再生成（REQ-057-024、TS-006 の一部）、DEC-028 の状態整合確認、抽選再検証（TS-007）を記録する。

実行環境は worktree `.worktrees/2739-refactor`、base は main HEAD 627def84（Wave3 merge a44f6bae、Wave4 merge edec3024 を含む）。実行識別情報（委譲単位 DEL-2739-1）と最終 HEAD の確定値は該当 PR 本文に記録する。実行日時は 2026-09-10。本 Report 自身は `docs/reports/**` 既定除外により textlint 検査対象外である（REQ-053-039）。

## 1. 最終 HEAD gate 再検証（TS-002、REQ-053-014/016）

実行形式: `bun run src/opencode/plugins/agentdev-textlint-guard/gate.ts --root . --json`（worktree root、HEAD 627def84 の実ファイル全文。2026-09-10 実測）。

| 項目 | 実測値 |
|---|---|
| 解決対象ファイル数 | 493（docs 263 / commands 47 / skills 174 / additional 9） |
| 拒否対象違反（hardCount） | **0（終了コード 0）** |
| 初期不合格ファイル（拒否対象違反あり） | 0 ファイル（空一覧） |
| 検査不能 | 0 |
| 助言指摘（全 corpus） | 4,382 件 / 422 ファイル |
| 助言指摘（docs 系） | 2,328 件 / 201 ファイル |
| 助言指摘（src 系） | 2,054 件 / 221 ファイル |

解決対象 493 件の内訳は Wave2 実測（docs/reports/req-053-textlint-wave2-calibration.md 第 5 節）と同一である。Issue #2739 本文の「504ファイル」は case-open 時のベースライン参考値であり、実測 493 は #2731 corpus 移動由来の差異（Wave3/4 記録の stale-reference 記録と同内容）を引き継ぐ。助言指摘は CR-001 により是正完了条件の対象外であり、本 Wave では助言削減を目的とした corpus 編集を実施していない。

## 2. 規則構成ハッシュ突合（TS-001、REQ-053-037）

### 2.1 Wave2 記録値の環境依存性の確定

Wave4 記録第 3 節の注意事項に従い、prh 規則の `options.rulePaths` に含まれる絶対パスの取扱いを確定した。規則構成は `composeRuleDescriptors`（`src/opencode/plugins/agentdev-textlint-guard/lib/rules.ts`）が標準辞書を `defaultPrhDictionaryPath()` の絶対パス（実行環境の plugin dir 基準）で options へ混在させる。したがって canonical JSON(options) を生のまま hash 入力にすると、clone 配置位置に依存する値になる。

本実行の再現計算（文字列結合のみでメインリポジトリへは I/O しない仮想パスを併用）:

| 計算条件 | 生 hash（正規化なし） |
|---|---|
| worktree 実位置（`.worktrees/2739-refactor` 基準絶対パス混在） | `c24b0d78fbc98da4b4f40b6025016dd1791e1d31ab7b3a26fb7cb7c3f35b0a30` |
| Wave2 計算時相当（メインリポジトリ直下 plugin dir 相当の絶対パス混在） | `5a9d74a6915eb40bbd26d61faf3557cf49d14bf51bd62422818126de11709f52` |

同一規則構成から clone 配置位置だけで生 hash が変動することが実証された。これが Wave4 で Wave2 記録値 `8b6aea87e3987e9b3f5347a883bb8f7e436a5b9d712c617553c0f6d96af59c73` と不一致だった原因である。Wave2 記録値は連結実装の詳細が手順テキストに未確定なため逆算再現できないが、上記実証により Wave2 記録値が環境依存値であったこと自体は確定した。

### 2.2 正規化手順の確定（環境非依存ハッシュ）

rulePaths を plugin dir 相対表現へ正規化してから hash 入力を構成する手順を本節に確定する。以後の再計算は本手順を用いる。

1. `prepareInspection(root)` を実行し `composition.rules`（ruleId + options）を取得する
2. prh の `options.rulePaths` 各要素を正規化する: 要素が plugin dir 配下なら plugin dir 相対（標準辞書は `rules/default-prh.yml`）に、それ以外（プロジェクト用語辞書）ならプロジェクトルート相対にする。区切りは `/` に統一し、配列は辞書順ソートする
3. rules を ruleId 辞書順にソートし、`ruleId + "\t" + キー辞書順正規化 canonical JSON(options)` の行を `\n` 連結する
4. prh 標準辞書内容の SHA-256、prh rulePaths 数、依存版一覧（`describeEngineVersions`）、`hardRuleIds` 辞書順連結を順に `\n` で付与し SHA-256 を取る

正規化後の規則構成ハッシュ（SHA-256）:

**`fa6c8b5c8493acc92f441ce3f4c5d5ccf90e4f6bdc4a3847e88f9c0be30bf9c9`**

worktree 実位置構成と Wave2 計算時相当の仮想位置構成の両方から同一値を得ており、本値は clone 配置位置に依存しない。

### 2.3 構成要素突合（版記録による同一性立証）

| 突合要素 | Wave2 記録（第 4 節） | 本実行実測 | 判定 |
|---|---|---|---|
| 採用規則数 | 29（ja preset 23 + ai preset 5 + prh 1） | 29（同一内訳） | 一致 |
| prh 標準辞書 SHA-256 | `98c1ac19d8f6f2f85b4cab978ea9f752f35c93c14040c3227f0567f6a21b500e`（12 語） | 同一値 | 一致 |
| 拒否対象 5 規則 | no-hankaku-kana / no-invalid-control-character / no-nfd / no-zero-width-spaces / prh | 同一 | 一致 |
| 依存版 | kernel 14.8.4 / markdown 14.8.4 / ja-technical-writing 12.0.2 / ai-writing 1.7.0 / prh 6.1.0 | 同一 | 一致 |
| プロジェクト用語辞書 | なし | なし | 一致 |
| 検査入口 | `gate.ts --root . --json` | 同一 | 一致 |

実装不変の証明: `git log 4b596742..627def84 -- src/opencode/plugins/agentdev-textlint-guard/lib/rules.ts src/opencode/plugins/agentdev-textlint-guard/vendor/textlint-engine.bundle.json src/opencode/plugins/agentdev-textlint-guard/rules/default-prh.yml` は空であり、規則構成を構成する実装・bundle・辞書は Wave2 merge commit 4b596742 以降変更されていない。

行動的証拠: 同一規則構成の下で Wave2 正式初期判定（4,375 件）と本実行（4,382 件）の規則別助言内訳は 18 規則中 15 規則が完全一致し、差分 +7 件（sentence-length +3、no-mix-dearu-desumasu +3、no-doubled-conjunction +1）は Wave4 記録第 2 節で #2748 の src 2 ファイル修正へ全量帰属証明済みである。突合対象は規則構成の同一性と拒否対象違反ゼロの維持であり、助言件数の一致は要求しない（Wave2 記録第 7 節）。

上記の構成要素完全一致、実装不変の git 証明、行動的証拠、および正規化後 hash の環境非依存性により、正式初期判定と最終検証が同一規則構成で実行されたことを版記録で立証する（REQ-053-037）。

## 3. ファイル単位完了証拠の集約（TS-003、REQ-053-014〜019）

ファイル単位の完了証拠（ファイルパス、初期判定、修正有無、確認した品質観点、最終判定、残存不備、blocked の判断必要事項）は Wave3 と Wave4 の実行記録に全対象分が存在する。本節で集約する。

| 実行記録 | 対象 | ファイル単位記録 | 集計 |
|---|---|---|---|
| docs/reports/req-053-textlint-wave3-docs-correction.md 第 4.1 節 | docs 系 263 ファイル | 263 行 | 合格 263 / 修正不要 263 / 残存不備 0 / blocked 0 |
| docs/reports/req-053-textlint-wave4-src-correction.md 第 4.1 節 | src 系 230 ファイル | 230 行 | 合格 230 / 修正不要 230 / 残存不備 0 / blocked 0 |
| **合計** | **493 ファイル** | **493 行** | **合格 493 / 残存不備 0 / blocked 0** |

集計値（493）は第 1 節の gate 再検証の解決対象数と一致し、第 1 節の拒否対象違反ゼロ（全 493 ファイル合格）と一致する（REQ-053-019）。初期不合格ファイルは Wave2 正式初期判定で空一覧のため、REQ-053-017（初期不合格の合格変更禁止）と REQ-053-018（誤検出証明）の適用対象は 0 件である。REQ-053-015（一部修正では当該ファイル全体の合格根拠にならない）の遵守は Wave3/4 の全文検査による最終判定で実現済みである。本実行は Wave3/4 の修正時判断を継承せず、最終 HEAD 627def84 の実ファイル全文への規則再適用で合否を判定した（REQ-053-016）。

## 4. 初期状態と最終状態の比較（REQ-053-020、TS-002）

固定した同じ規則（第 2.3 節の構成要素）による比較:

| 項目 | 初期状態（Wave2 正式初期判定） | 最終状態（本実行） | 判定 |
|---|---|---|---|
| 不合格ファイル数（拒否対象違反あり） | 0 | 0 | 初期ゼロの項目はゼロ維持 |
| 既知不備数（拒否対象区分の baseline 登録） | 0 | 0 | ゼロ維持。規則緩和・baseline suppression・事後降格は実施していない（DEC-028、REQ-053-037/038） |
| 決定的破損数 | 0 | 0 | ゼロ維持（第 5 節の integrity suite 実行を含む） |
| 解決対象ファイル数 | 493 | 493 | 同一（Wave2 実測と同一対象解決） |
| 助言指摘 | 4,375 件 / 422 ファイル | 4,382 件 / 422 ファイル | CR-001 により突合対象外。+7 は #2748 由来（Wave4 記録第 2 節） |

Issue #2739 本文（TS-002 verification）の初期状態記載「解決対象533ファイル・助言9,559件」は case-open 時のベースライン参考値であり、#2731 corpus 移動以前の対象解決に基づく stale-reference である。REQ-053-020 の比較対象は固定した同じ規則による初期状態と最終状態であるため、Wave2 正式初期判定（同一規則・同一対象解決の 493）を初期状態の正として用いる。拒否対象違反ゼロは初期から最終まで維持され、REQ-053-020 の完了条件（初期不備の減少と最終ゼロ、初期ゼロ項目のゼロ維持、blocked 残存なし）を満たす。

## 5. 検査群の実行と IR-055 baseline 再生成（TS-006 の一部、REQ-057-024）

### 5.1 integrity suite（配布依存境界 baseline、source profile）

実行形式: `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --profile source --root . --json`（worktree root、2026-09-10 実測）。

再生成前の実行では IR-055 の delta が 1 件検出された: `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md` L146 の `docs/designs/` 参照（main 既存、commit 57f63087 導入）。この 1 件が baseline 再生成前の既知 delta 全数である（`agentdev-git-worktree` の前置確認運用（REQ-057-024）と case-run S3-5 の実測と一致）。

### 5.2 baseline 再生成と判断根拠

再取得手順（docs/designs/integrity/distribution-boundary.md「concrete-id ベースライン再取得手順」）に従い、`--update-ir055-baseline` で baseline（`.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json`）を最終状態へ再生成した。対象 commit は worktree HEAD（main 627def84 と同一）、profile は source である。

| 項目 | 再生成前 | 再生成後 |
|---|---|---|
| エントリ数 | 50 | 47 |
| generated_at | 2026-09-08 | 2026-09-10 |
| 除去エントリ | — | 4 エントリ（検出 7 件）: `agentdev-doc-writing/references/document-boundaries.md`（docs/designs/ 1、docs/guides/ 1、src/opencode/ 4）と `agentdev-doc-writing/references/japanese-replacement-dictionary.md`（repo-* 1） |
| 追加エントリ | — | 1 エントリ（検出 1 件）: `agentdev-git-worktree/references/worktree-operations.md`（docs/designs/、heuristic） |

判断根拠:

- 除去した 4 エントリは、#2731（commit b380e53f）で退役した agentdev-doc-writing スキルに属する現行 corpus 非存在のファイルへの stale エントリである。再取得手順の「解消済み違反の baseline 残存と、現行違反 0 件との差異を解消」に従い除去する
- 既知 delta 1 件（worktree-operations.md L146）は該当表現の解消（修正）ではなく baseline 登録を選択した。REQ-057-024 は baseline 再生成または該当表現の解消のいずれかを認め、本 Wave は表層修正を完了条件外とする CR-001 と対象範囲（正規成果物の本文変更なし）の制約下にあるため、既知 delta の baseline 登録が契約上の正しい処置である。残存不備ではなく現行状態と一致した既知 delta として扱う
- 再生成後の clean 再実行で IR-055 は `0 new violations`（90 件 baseline-known info のみ）となり、baseline が最終状態と一致した

### 5.3 本件対象範囲外の既存 warning（由来分類）

baseline 再生成後の integrity suite には本 PR 変更由来でない既存 warning が 6 件残存する（いずれも main 627def84 既出であり、REQ-053 ケースの変更範囲外のため本 Wave の処置対象外）:

| check | 対象 | 由来分類 |
|---|---|---|
| accepted-adr-only-citation | design-principles.md の DEC-022 引用 | 既存（REQ-057-015 関連の別課題） |
| accepted-adr-only-citation | verification-scope-catalog.md の DEC-027 引用 | 既存（同上） |
| gh-direct-invocation | workflow-case-run/references/single.md | 既存 |
| draft-spec-staleness | dependency-version-compatibility.md、decision-lifecycle.md | 時効由来（draft Design の放置期間） |
| obsolete-vocabulary-current-use | artifact-validation/SKILL.md | 既存 |

これらは後続の backlog・inspect 経路へ回付すべき項目であり、本 PR の `## Findings / Capture候補` に記録する。

### 5.4 targeted docs guard と traceability 検査

- targeted docs guard（`check_changed_docs.ts --workflow case-run --base-ref main --json`、終了コード 0）: 本 PR の docs 変更は `docs/reports/` 新規 1 件のみであり、case-run profile は `docs/reports/**` を検査対象から除外する（REQ-053-039 の歴史記録除外と整合）。検査対象 0 件・failures 0 件である。AUTOGEN ブロックを含む対象文書の変更は 0 件のため AUTOGEN 鮮度 gate の再生成対象も存在しない
- traceability check（`check.ts --req REQ-053-014,...,REQ-053-021,REQ-053-037,REQ-053-038,REQ-057-024`、終了コード 0）: malformed-declarations、unknown-roles、unknown-req-refs、invalid-catalog-refs、missing-implementation、missing-verification、evidence-unavailable の 7 検査すべて pass（fail 0）

## 6. DEC-028 の状態整合確認（REQ-057-015）

DEC-028（docs/decisions/DEC-028.md、status: proposed）の proposed 権威引用ねじれについて、次の機械確認を実施した。

- `docs/designs/**` 全文検索（`rg "DEC-028"`）で Design からの DEC-028 参照は 0 件。REQ-057-015（Design は proposed Decision を権威引用しない）に適合する
- integrity suite の accepted-adr-only-citation checker も docs/designs からの DEC-028 引用を検出していない（同 checker が検出する proposed 引用は DEC-022・DEC-027 の 2 件のみで、第 5.3 節の既存 warning に属する）
- DEC-001・REQ-053・Design textlint-quality-runtime.md からの DEC-028 参照は 0 件であり、accepted 側から proposed への後継関係の逆参照も存在しない
- docs/reports/req-053-textlint-wave2-calibration.md 内の DEC-028 引用は歴史記録（REQ-053-039 対象外、編集禁止）であり、REQ-057-015 の制約対象（Design）ではない

以上より、proposed 権威引用ねじれの実施対象は正規成果物側に存在せず、既に解消済みの状態であることを確認した。DEC-028 の status は proposed のまま維持する（意味変更・昇格は本 Wave の対象外）。proposed から accepted への昇格判断は case-close の Design 確定工程が所有し、本節の確認結果をその入力とする。

## 7. 抽選再検証（TS-007、REQ-053-021）

完了報告の件数・ファイル単位結果（第 3 節）と最終 HEAD 実ファイルの一致は、第 1 節の gate 再検証（同一入口・同一規則での全件再実行、集計一致）により確認した。あわせて合格ファイル 493 件から決定的サンプリングで 20 ファイルを抽出し、抽出ファイル群を一時 root へ同一相対パスで配置して gate.ts を再実行した。

抽選方法: 解決対象 493 パスを辞書順ソートし、step = floor(493 / 20) = 24、start = 6 として 6, 30, 54, ... の等間隔 20 件を抽出する（決定的手順、docs 系と src 系の両方を含む）。

抽出結果（docs 11 件 / src 9 件）:

1. docs/decisions/DEC-006.md
2. docs/designs/authoring/command-file-format.md
3. docs/designs/foundations/design-principles.md
4. docs/designs/integrity/rules/IR-002-req-required-frontmatter.md
5. docs/designs/integrity/rules/IR-031-findings-capture-heading-unification.md
6. docs/designs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md
7. docs/designs/responsibilities/artifact-contracts.md
8. docs/designs/skills/agentdev-intake-pipeline.md
9. docs/designs/workflows/workflow-contracts.md
10. docs/requirements/REQ-007.md
11. docs/requirements/REQ-039.md
12. src/opencode/commands/agentdev/case-close.md
13. src/opencode/commands/agentdev/templates/case-update/req.md
14. src/opencode/skills/agentdev-adversarial-review/references/adversarial-review-protocol.md
15. src/opencode/skills/agentdev-doc-diagnostics/SKILL.md
16. src/opencode/skills/agentdev-learning-pipeline/references/deferred-atomic-move-procedure.md
17. src/opencode/skills/agentdev-req-file-manager/references/matching-and-merge.md
18. src/opencode/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md
19. src/opencode/skills/agentdev-workflow-inspect-promote/SKILL.md
20. src/opencode/skills/agentdev-workflow-orchestration/references/subagent-protocol.md

再実行結果: 終了コード 0、検査 20 ファイル、拒否対象違反 0 件。抽選再検証で違反は再現しなかった。

## 8. 検証差分

| 実行工程 | 検証種別 | 検証結果 | finding 差分 |
|---|---|---|---|
| gate.ts 全文再検証（TS-002） | 決定的機械検査 | 合格（終了コード 0、493 ファイル、hardCount 0） | 新規 0 / 修正済み 0 / 既出 0 / 撤回 0 / 無効 0 |
| 規則構成ハッシュ突合（TS-001） | 機械検査 + git 履歴証明 | 合格（構成要素完全一致、正規化後 hash 環境非依存） | 新規 0 |
| integrity suite source profile（TS-006） | 決定的機械検査 | IR-055 new violations 0（baseline 再生成後）。既存 warning 6 件は本件変更由来でない（第 5.3 節） | 新規 0 |
| IR-055 baseline 再生成（REQ-057-024） | 機械検査 | 合格（50 → 47 エントリ、既知 delta 1 件登録、解消済み 4 エントリ除去） | 新規 0 |
| 抽選再検証（TS-007） | 決定的機械検査 | 合格（20 ファイル、終了コード 0、hardCount 0） | 新規 0 |
| DEC-028 状態整合（REQ-057-015） | 機械検査（grep + integrity checker） | 合格（Design からの proposed 権威引用 0 件） | 新規 0 |
| targeted docs guard（case-run profile） | 決定的機械検査 | 合格（検査対象 0 件 = docs/reports 除外、failures 0） | 新規 0 |
| traceability check（11 要件行指定） | 機械検査 | 合格（7 検査 pass、fail 0） | 新規 0 |

blocked 項目は 0 件であり、REQ-053-020 の完了条件（blocked 残存中は完了としない）を満たす。本 Wave での corpus・正規成果物の意味変更は発生していない。

## 9. Wave5 への完了条件対応表

| 完了条件（Issue #2739） | 本 Report の根拠 |
|---|---|
| 最終 HEAD から gate.ts を再実行し終了コード 0（TS-002） | 第 1 節 |
| 正式初期判定と最終検証の規則構成ハッシュ（または版記録）が一致（TS-001、REQ-053-037） | 第 2 節（版記録立証 + 正規化後 hash 確定） |
| ファイル単位の完了証拠が全件分そろい集計値と一致（TS-003、REQ-053-019） | 第 3 節（493 = 263 + 230） |
| 初期状態と最終状態の比較が記録されている（REQ-053-020） | 第 4 節 |
| IR-055 baseline が最終状態へ再生成され既知 delta が現行と一致（TS-006、REQ-057-024） | 第 5 節 |
| 報告値と実ファイル一致、抽選再検証（最低 20 ファイル）で違反非再現（TS-007、REQ-053-021） | 第 7 節 |
| 実行記録が docs/reports/ へ保存されている（AG-005） | 本 Report |
| DEC-028 の状態整合が確認され case-close の Design 確定工程と整合 | 第 6 節 |
