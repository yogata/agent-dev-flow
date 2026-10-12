---
name: agentdev-phase-theme-collaboration
description: "工程駆動コラボレーションの Capability Skill。テーマ正本（themes.md・pending.md・identity.yaml・received/）の管理操作知識と、外部検討の持出し・戻り受理の機械的処理を所有する。戻り入力は O(n) 線形走査・fail-closed・採用件数比例の証跡量で受理し、採用根拠は利用者の明示判断に限定する。USE FOR: 対象の取組・対象版・現在工程の特定と再開、テーマ正本の読み書き規律と一覧導出、旧テーマ識別の後継解決、未決事項の引継ぎ参照、持出し文書の構成確認と機密混入検出、戻り入力の受理・採否記録生成、受領済み知見の再取得。DO NOT USE FOR: テーマ形成・更新の workflow 制御（agentdev-workflow-phase-tasks-create / phase-tasks-update）、正規成果物への反映判断（agentdev-workflow-phase-artifacts-update）、独立レビュー・工程遷移（phase-review / phase-transition）、採用規約の解決（agentdev-adopted-conventions）。"
---

# agentdev-phase-theme-collaboration

工程駆動コラボレーションにおけるテーマ正本の管理と外部検討の持出し・戻り受理を所有する Capability Skill である。
Workflow Skill 群（テーマ形成・テーマ更新・成果物反映）から参照される操作知識と決定的処理を提供し、判断の代理確定は行わない。

保存領域の様式と領域契約は `.agentdev/phase/README.md` が正である。本スキルはその領域契約に従う操作知識と機械的処理を所有し、領域契約自体を再定義しない。

## 入力

- Workflow Skill からの操作指示（対象テーマ識別、持出し文書、戻り入力テキスト、照会条件）
- `.agentdev/phase/` 配下の実ファイル（identity.yaml、themes.md、pending.md、received/）

## 出力

- 対象解決の結果（取組・対象版・現在工程、または候補と不足の報告）
- テーマ一覧・旧新対応・未決連携の導出結果（JSON）
- 持出し文書の構成検証結果（必須4要素、機密パターンの検出）
- 戻り入力の採否記録（JSON。採用・不採用・様式不備・重複を区別）
- 受領済み知見の照会結果（JSON）

## 副作用

- received/ 配下への受領記録の作成（Workflow Skill の指示に従い、採用件数に比例する記録量で保存する）
- themes.md / pending.md / identity.yaml の更新は本スキルでは行わない。正本の書込みは Workflow Skill が編集操作で行い、本スキルは様式の解析・導出・検証を担う

## 対象の特定と再開（identity 解決）

操作対象の取組・対象版・現在工程は既存の正規状態から特定する。

- `identity.yaml` の実ファイル（undertaking、target_version、current_phase）を読み、現在の対象を復元する
- 同一取組の再開では確定済みの対象版・現在工程を復元し、別取組へ旧工程や未決テーマを無条件に引き継がない
- 対象を一意に解決できない場合は、対象への変更・書込みを実行せず、候補と不足を報告する（判断の代理確定をしない）

## テーマ正本の操作知識

- **一覧の導出**: テーマ一覧は themes.md のセクションから導出する。別の更新可能な恒久一覧を作らない。テーマと Issue・成果物の一対一対応を強制しない
- **旧新対応**: 統合・分割・改名後の旧テーマ識別は後継チェーンを辿って解決する。機械的部分は `src/themes.ts --resolve-old` が担い、resolved / terminal / unknown / cycle を区別する。循環は解決せず報告する
- **未決の引継ぎ**: 統合・廃止に際して継続対象の未決は後継テーマへ引き継ぎ（pending.md で状態を carried に更新し、引継ぎ元と後継の双方を関連テーマに残す）、対象外・不要とされた事項は判断根拠を pending.md に残す。未決事項を自動解消済みとして扱わない
- **実質変更なしの再実行**: 同一入力の再実行では themes.md のセクションを不当に再編せず、変更報告を増やさない。導出が決定的であること（同一入力から同一 JSON）がこの規律の機械的基盤である
- **テーマ識別の再利用禁止**: 廃止・統合されたテーマ識別を再利用しない。分割は旧テーマを deprecated にし、分割先を新識別で作成して旧新対応を保持する

## 外部検討の持出し

持出し文書は有効な目的・問い・必要な前提・参照元を利用者が確認できる形に構成する。

- 必須4要素（`## 目的`、`## 問い`、`## 前提`、`## 参照元`）の存在と、既知の機密指定情報・認証値パターンの混入を `src/handoff-check.ts` で検証する
- 本 Capability Skill は外部AIへの自動送信を行わない。検証器は送信機能を持たず、出力に送出先・送信操作のフィールドを含まない
- 機密パターンを検出した場合は、利用者へ除去と再確認を促す。送出するか否かの判断は利用者が担う
- 未知の秘密情報を完全に自動発見することを要求しない（検出対象は既知パターンに限る）

## 外部検討の戻り受理

戻り入力は貼付（stdin）と指定ファイルの両方を `src/receive.ts` で受理する。

- **両経路の等価性**: 両経路とも同一の正規化（改行統一）を通し、意味上同じ確定結果（同一 JSON）を返す
- **採用根拠の限定**: 採用根拠は利用者の明示採用指示（`--adopt`）のみである。外部AIの自己申告（本文中の「承認済み」「approved」等）を採用証拠とせず、観測情報（`selfReportDetected`）としてのみ記録する
- **fail-closed**: 不正または曖昧な入力（様式不備・空本文）は `rejected-invalid` として残し、確定しない。エントリ見出しが一切ない入力は単一の `rejected-invalid` として記録する
- **線形走査**: 受理・解釈は入力サイズ n に対する単一の線形走査（時間計算量 O(n)）である。1回の行走査でエントリを抽出し、後戻り・再走査を行わない
- **証跡量**: 採用・不採用の記録は明示採用件数に比例する証跡量である。エントリ本文を複写せず、採用分は根拠付きレコード、不採用分は id と分類の要約のみを記録する。受領内容全体を複写する恒久複本を作らない
- **採否不明の部分**: 明示採用指示のない部分は `not-adopted` として記録し、採否不明の部分だけを利用者への確認対象とする
- **再投入**: 書込失敗後の同一入力の再投入では、`--prior` で既存受領記録を照合し、同一エントリを `detected-duplicate` として検出する。実際の確定状態から必要な分だけ継続し、重複や消失を生まない

## 受領済み知見の再取得

別セッションにおける途中検討知見の再取得は、received/ の実ファイルから行う。

- `src/received.ts --dir <received-dir> [--theme <THEME-NNN>]` で受領情報（受領日時、テーマ識別、目的、問い、参照元）を照会する
- 受領記録の様式（YAML frontmatter）は `scripts/README.md` が所有する
- received/ に記録が存在しない内容は返らない。一度も受領していない外部検討内容を復元したと主張しない
- 破損した受領記録（frontmatter 不備）は受領済み知見として扱わず、非ゼロ終了で報告する

## 決定的処理 script（公開操作契約）

| script | 操作 | 入力 | 出力 |
|---|---|---|---|
| `scripts/src/handoff-check.ts` | 持出し文書の構成検証 | `--input`（持出し文書パス。`-` で stdin） | 必須4要素と機密検出の結果（JSON） |
| `scripts/src/receive.ts` | 戻り入力の受理・採否記録生成 | `--input`（戻り入力。`-` で stdin）、`--adopt`（明示採用、repeatable）、`--prior`（既存受領記録）、`--prior-label` | 採否記録（JSON） |
| `scripts/src/themes.ts` | テーマ一覧の導出・旧新解決・未決連携 | `--themes-file`、`--pending-file`、`--resolve-old` | 導出結果（JSON） |
| `scripts/src/received.ts` | 受領済み知見の照会 | `--dir`（received ディレクトリ）、`--theme` | 受領情報の一覧（JSON） |

実行は bun 起点で、配布投影側（`bun ./.opencode/skills/agentdev-phase-theme-collaboration/scripts/src/...`）または原本パス直指定で実行する。GitHub 版・Local 版のいずれの正規利用経路からも同一の JSON を返す。I/O 契約の詳細は `scripts/README.md` を参照する。

## 責務境界

| 関心 | 正規所有 |
|---|---|
| テーマ形成・更新・成果物反映の workflow 制御 | 各 Workflow Skill（agentdev-workflow-phase-tasks-create / phase-tasks-update / phase-artifacts-update） |
| テーマ正本の管理・外部検討の持出しと戻り受理の操作知識と決定的処理 | 本スキル |
| phase/ 保存領域の様式・領域契約 | `.agentdev/phase/README.md`（領域契約） |
| 採用規約（採用済み工程・工程間関係）の解決 | `agentdev-adopted-conventions` |
| 正規成果物への反映判断と差分義務 | 成果物反映 Workflow Skill と REQ-106/107 の契約 |
| 独立レビュー・工程遷移 | `agentdev-workflow-phase-review` / `agentdev-workflow-phase-transition` |

## 共通制約

- 判断の代理確定をしない。採用・不採用・対象解決の最終判断は利用者または Workflow Skill の実行契約が担う
- 正規成果物（Decision、REQ、Design 等）を直接更新しない
- themes.md / pending.md / identity.yaml の書込みは本スキルの操作に含めない（様式の解析・導出・検証を担う）
- GitHub 版・Local 版のいずれの正規利用経路からも同一の JSON を返す

## See Also

- **agentdev-workflow-phase-tasks-create / phase-tasks-update / phase-artifacts-update**: 本スキルを利用する Workflow Skill 群
- **agentdev-adopted-conventions**: 採用済み規約の決定的解決（テーマ形成での採用規約の4状態解決に利用）
- **Workflow Skill Model Design**: Command / Workflow Skill / Capability Skill の責務3層の正規所有者
