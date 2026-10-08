# REQ 行への実装詳細残留の横断是正（cleanup anchor）

- 出所: inspect-docs 20261008T025952Z F-05・F-06（backlog-auto stage 1）
- 種別: 構造整理（req-define 壁打ち対象。即時 RU 化ではなく観察メモ着手）
- 対象 REQ: REQ-090・REQ-061（横断）

## F-05: REQ-090 の schema/enum/credential 具体名シグナル群

- target: `docs/requirements/REQ-090.md:18`（REQ-090-001: API `/ai/run`、model ID `typesafe/jev`、credential `CLOUDFLARE_ACCOUNT_ID`/`CLOUDFLARE_API_TOKEN`）、`:26`（REQ-090-011: `questions[].score.criteria`）、`:30`（REQ-090-015: 差異理由 enum 4値）、`:31`（REQ-090-016: 失敗分類 enum 5値）、`:41`（REQ-090-026: 観測識別子 field 名）
- evidence: schema field 残留・enum 値一覧残留・実装パラメータ残留の 3 種シグナルが同一 REQ 内に複数行で出現。REQ-090-006（:23）は「観測 filename、個別 field 名…は実装設計時の自由度」と宣言する一方、015/016 は分類 enum を固定しておりファイル内で立場が不均質。credential env 名は外部契約（REQ-090-002）として安定契約例外の余地あり。
- severity: medium / confidence: medium
- source_of_truth: document-model.md Design 分離基準（REQ-001-067 移管候補）

## F-06: REQ-061-047/048 の回帰条件・構成アルゴリズム・field 名列挙

- target: `docs/requirements/REQ-061.md:66-67`
- evidence: REQ-061-047「トポロジカルレベル割当として決定的に導出する」（REQ-061-038 が上位で決定性を規定済みで冗長寄り）、REQ-061-048「依存エッジ 0 件の子 Issue 集合から複数 Wave が生成される構成が機械検査で fail となる回帰条件を検証に含める」（回帰テスト条件残留）+「観測識別子（workflow、evaluationKind、questionId）の互換性を維持」（field 名列挙、REQ-090-026 と同一契約の参照表現で安定契約例外候補）。
- severity: low / confidence: low-medium
- source_of_truth: document-model.md 移管候補、安定契約の例外（fail-closed 検査の定義として機能する側面）

## 処置方針（横断 cleanup anchor として運用）

- REQ-090・REQ-061 の個別修正は即時 RU 化とせず、req-define 壁打ち対象（観察メモ着手）として処理する。REQ-090 は Jev 実証の観測契約であり Design 移管には DEC-044/052 系の合意が絡むため。
- 同型の過去 defer 群を本成果物に統合して一括整理する:

| 過去 defer 項目 | 対象 | 出所 |
|---|---|---|
| RQ-01 | REQ-021-030 移行手順の行占有（REQ-021.md:39） | 20260926T180630Z |
| RQ-04 | REQ-061-040 git コマンド詳細 | 20260926T180630Z |
| RQ-06 | REQ-095-001/002 Tool 入力契約再述 | 20260926T180630Z |
| RQ-15 | REQ-090-011 実装詳細（REQ-090.md:26 = F-05 対象と同一行） | 20260926T180630Z |
| RQ-16 | REQ-008-051〜054 schema field 埋め込み | 20260926T180630Z |
| RQ-17 | REQ-090-004 Case 固有作業指示残留（REQ-090.md:19） | 20260926T180630Z |
| RQ-27 | REQ-007-013 git 運用手順 | 20260929T170714Z |
| RQ-28 | REQ-018-006 node fs API 実装詳細 | 20260929T170714Z |
| RQ-29 | REQ-094-008 語彙管理データ列挙 | 20260929T170714Z |

- RQ-15・RQ-17 は 20260926T180630Z ファイル側に本成果物への統合注記を追記済み（個別 defer の解消）。

## review 検証記録（adversarial-review 2026-10-08）

- Stream A: F-05 の :26 が旧 defer RQ-15 と同一行であることを指摘（本成果物の統合表に反映）。RQ-17（:19）も同型として統合対象に追加。
- Stream B: 過去 defer RQ-01/04/06/15/16/17/27/28/29 の実在を inbox で確認（すべて要件行への実装詳細混入で F-05/F-06 と同型）。anchor としての根拠は実在。
