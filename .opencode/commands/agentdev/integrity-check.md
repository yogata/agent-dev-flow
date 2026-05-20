---
description: artifact integrity の read-only 棚卸し検査を実行する
agent: sisyphus
load_skills:
  - issue-lifecycle
  - issue-completion-reporting
---

# Integrity Check

プロジェクト全体の artifact integrity を read-only で棚卸し検査する。検査対象の artifact（REQ、ADR、skill、command 等）は一切変更しない。検出結果のレポート生成と intake item の新規作成のみ許容する（REQ-0017-029）。

## Input

なし。プロジェクト全体の artifact を自動的に検査する。

## Output

- Integrity check report（`.sisyphus/reports/integrity-report-{timestamp}.md`）
- Optional: intake items（ユーザー確認後に作成、REQ-0017-030 MAY）

## Read-only 制約（MUST）

以下の制約は本コマンドの実行中ずっと維持されなければならない:

- **MUST NOT**: 検査対象 artifact（REQ、ADR、skill、command、README 等）の内容を変更する
- **MUST NOT**: REQ、ADR、skill ファイルを修正・追記・削除する
- **MUST NOT**: command ファイルを修正・追記・削除する
- **ALLOWED**: Integrity check report の新規生成（`.sisyphus/reports/` 配下）
- **ALLOWED**: Intake item の新規作成（ユーザー確認後、`.agentdev/intake/` 配下）

## Detection Targets

検査対象と検証内容を以下に定義する。

### T1: REQ frontmatter ↔ filename 一致

- 各 `docs/requirements/REQ-{NNNN}.md` の frontmatter `id` がファイル名と一致するか
  - 例: `REQ-0001.md` → `id: REQ-0001` でなければ ERROR
- frontmatter `updated` 日付が `created` 日付以降であるか（`updated < created` は ERROR）

### T2: ADR status 整合性

- 各 `docs/adr/ADR-{NNNN}.md` の frontmatter `status` が有効な値（`proposed`, `accepted`, `deprecated`, `superseded`）であるか
- `status: superseded` の場合、`superseded-by` フィールドが存在し、該当 ADR ファイルが存在するか
- `superseded-by` で参照されている ADR が存在しない場合は ERROR

### T3: Skill ↔ load_skills 参照整合性

- 全 command ファイル（`.opencode/commands/**/*.md`）の `load_skills` に記載された skill 名に対応する skill ディレクトリまたは skill ファイルが `.opencode/skills/` に存在するか
- 存在しない skill を参照している場合は ERROR
- `.opencode/skills/` に存在する skill のうち、どの command からも参照されていない場合は WARN（orphan skill）

### T4: Command-map ↔ actual files 整合性

- `docs/specs/system.md` の command-map（または README.md のコマンド一覧）に記載されたコマンドに対応するファイルが `.opencode/commands/` 配下に存在するか
- 存在しないコマンドが記載されている場合は ERROR
- `.opencode/commands/` に存在するコマンドのうち、command-map に記載されていないものは WARN

### T5: README index tables ↔ actual files 整合性

- `docs/requirements/README.md` の REQ インデックステーブルに記載された REQ ID に対応するファイルが `docs/requirements/` に存在するか
- 実際に存在する REQ ファイルがインデックステーブルに記載されているか
- `docs/adr/README.md` の ADR インデックステーブルに対しても同様に検証
- 不一致は ERROR

## Steps

1. **REQ frontmatter scan**: `docs/requirements/REQ-*.md` を全件走査し、T1 の検証を実行
    - 各ファイルの frontmatter（`id`, `created`, `updated`）を読み取る
    - ファイル名との一致、日付の妥当性を確認
    - 検出結果を内部バッファに蓄積
2. **ADR status scan**: `docs/adr/ADR-*.md` を全件走査し、T2 の検証を実行
    - 各ファイルの frontmatter（`status`, `superseded-by`）を読み取る
    - status 値の妥当性、superseded-by 参照の存在を確認
    - 検出結果を内部バッファに蓄積
3. **Skill existence scan**: `.opencode/skills/` を走査し、T3 の検証を実行
    - 存在する skill 一覧を取得
    - 全 command ファイルの `load_skills` を収集
    - 参照先の存在確認、orphan skill の検出
    - 検出結果を内部バッファに蓄積
4. **Command-map cross-reference scan**: T4 の検証を実行
    - `docs/specs/system.md` または `README.md` からコマンド一覧を抽出
    - `.opencode/commands/` の実際のファイルと照合
    - 検出結果を内部バッファに蓄積
5. **README index cross-reference scan**: T5 の検証を実行
    - `docs/requirements/README.md` と実際の REQ ファイルを照合
    - `docs/adr/README.md` と実際の ADR ファイルを照合
    - 検出結果を内部バッファに蓄積
6. **Report generation**: 検出結果を集約し、integrity check report を生成
    - 出力先: `.sisyphus/reports/integrity-report-{timestamp}.md`（timestamp は `yyyyMMdd-HHmmss` 形式）
    - report フォーマット:
      ```markdown
      # Integrity Check Report

      **実行日時**: {timestamp}
      **検査対象数**: {対象ファイル/項目の総数}
      **結果サマリ**: ERROR {N}件 / WARN {N}件 / OK {N}件

      ## 検出結果

      ### ERROR

      | 検出対象 | ファイル | 詳細 |
      |----------|----------|------|
      | ... | ... | ... |

      ### WARN

      | 検出対象 | ファイル | 詳細 |
      |----------|----------|------|
      | ... | ... | ... |

      ### OK（概要のみ）

      - T1: REQ frontmatter — {N}件検査、問題なし
      - T2: ADR status — {N}件検査、問題なし
      - ...
      ```
    - ERROR が 0 件の場合: サマリに「✅ 整合性に問題は検出されませんでした」と表示
    - ERROR が 1 件以上の場合: サマリに「⚠️ 整合性の問題が検出されました」と表示
7. **Optional intake item creation**: ユーザーに確認し、必要に応じて intake item を作成
    - ERROR が検出された場合、ユーザーに intake item 作成の可否を確認:
      - 「{N}件の整合性問題が検出されました。intake item として登録しますか？」
    - ユーザーが承認した場合: 各 ERROR 項目について intake item を `.agentdev/intake/` 配下に作成
    - ユーザーが拒否した場合、または ERROR が 0 件の場合: スキップ
    - intake item のフォーマット:
      ```markdown
      ---
      source: integrity-check
      detected_at: {timestamp}
      type: integrity-error
      target: {対象ファイルまたは参照}
      ---
      ## 検出内容
      {検出詳細}
      ## 捕捉元
      integrity-check (T{N}: {検出対象名})
      ## 後で判断すべき点
      修正方針の決定（REQ/ADR/skill のどれを正とするか）
      ```
8. **Report results**: 検査結果をユーザーに報告
    - レポートファイルのパスを表示
    - ERROR / WARN 件数の概要を表示
    - intake item を作成した場合は作成件数を表示

## Guardrails

### 実行制約
- G01: 検査対象 artifact（REQ、ADR、skill、command、README）の内容を変更してはならない（MUST NOT）
- G02: レポート生成と intake item 作成以外のファイル書き込みを行ってはならない
- G03: 検査対象ファイルが存在しない場合は WARN として扱い、実行は継続する

### 品質ゲート
- G04: 全 5 検出対象（T1-T5）の検査を必ず実行すること。一部のみの実行は不可
- G05: Report は必ず `.sisyphus/reports/` 配下に生成すること

### 判断・承認制約
- G06: Intake item の作成はユーザーの明示的な承認が必要。自動作成は禁止
- G07: ユーザーが intake item 作成を拒否した場合、レポートの内容に影響を与えてはならない

### 出力制約
- G08: サブエージェントの最終出力は verbatim で出力する（再フォーマット禁止）
