# QG-2: Acceptance Criteria Coverage Gate

case-open で Issue を作成する前に、Issue の完了条件が対象 REQ/ADR/SPEC の必達要件を網羅しているかを検証する Gate。
本ファイルは QG-2 の判定基準、検査観点を定義する。
共通契約は [common-gate-contract.md](common-gate-contract.md) を参照。

## 配置

| コマンド | 配置ステップ | 対象成果物 |
|---------|-------------|-----------|
| case-open | Step 1（Issue 本文生成）、Step 5（Epic 本文生成）、Step 15（Standard Issue 生成） | Issue 本文（完了条件セクション、チェックボックス） |

## 検査観点

### 1. REQ 必達要件 → 完了条件 mapping

対象 REQ の必達要件（SHALL 要件）が Issue 本文の完了条件チェックボックスに対応づけられているか。

- **fail**: 必達要件のいずれかが完了条件に対応づけられていない。
- **warn**: 対応づけはあるが、1 つのチェックボックスが複数要件を混在させている。
- **pass**: 各必達要件が少なくとも 1 つの完了条件チェックボックスに traceable に対応づけられている。

### 2. ADR 決定事項の反映

関連 ADR の決定事項（アーキテクチャ上の制約）が完了条件に反映されているか。
実装が ADR に矛盾しないことを確認できる完了条件が含まれるか。

- **warn**: ADR が関連するが完了条件に反映が見られない。
- **pass**: 関連 ADR が存在しない、または決定事項が完了条件に反映されている。

### 3. SPEC 適合性の完了条件化

変更が SPEC に影響する場合、SPEC 適合性の確認が完了条件に含まれているか。

- **warn**: SPEC 影響があると推定されるが SPEC 適合確認が完了条件にない。
- **pass**: SPEC 影響がない、または SPEC 適合確認が完了条件化されている。

### 4. 完了条件の測可能性

完了条件の各チェックボックスが測定可能（measurable）かつ一意（unambiguous）か。

- **fail**: チェックボックスが測定不能。
- **warn**: 測定可能だが表現が曖昧。
- **pass**: 各チェックボックスが客観的な達成基準を持つ。

### 5. テンプレート必須セクション

Issue 本文がテンプレート（`issue_desc_*.md`）の【必須】セクション（特に `完了条件` セクション）を含むか。

- **fail**: `完了条件` セクションの欠落、または【必須】セクションの欠落。

## pass/ warn/ fail 基準

- **pass**: 上記 1〜5 の全てを満たす。全必達要件が完了条件に traceable に対応づけられている。
- **warn**: 対応づけはあるが表現が曖昧、または一部網羅性に疑義がある。Issue 作成可能（警告併記）。
- **fail**: 必達要件の完了条件への対応が欠落している、完了条件セクション自体が欠けている。Issue 作成前に req-define 差し戻しを推奨。

## Epic flow での適用

Epic flow（マルチREQ/ 単一REQ Epic）の場合:

- Epic Issue の完了条件は子Issue の完了条件の集約ではなく、Epic 固有の受け入れ基準を含む。
- 各子Issue の完了条件が当該子Issue が担当する OU/ REQ の必達要件を網羅しているかを検証する。
- 子Issue 間で必達要件の漏れ、重複がないかを確認する。

## 委譲接続点

QG-2 の検査をサブエージェントに委譲する場合:

- サブエージェントは完了条件候補、必達要件 mapping 候補、網羅性の疑義のみを返す。
- 親エージェントが pass/warn/fail を確定し、Issue 本文の確定と作成を行う。
- 具体的な委譲接続点は case-open の各 Step（Step 1, Step 5, Step 7）を参照。

## 責務境界

- QG-2 は**判定のみ**行う。Issue 作成は case-open コマンドの責務。
- QG-2 fail 時は Issue 作成を停止し、req-define 差し戻しを推奨する（強制差し戻しではない）。

## See Also

- [common-gate-contract.md](common-gate-contract.md)
- [qg-1-definition-integrity.md](qg-1-definition-integrity.md) — 前工程の要件定義の完全性（QG-2 はその成果物を入力とする）
- **agentdev-issue-management**: Issue 本文生成、テンプレート選定
- **agentdev-workflow-templates**: Issue 本文テンプレート（`issue_desc_*.md`）

