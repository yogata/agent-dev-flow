<!--
draft-meta:
  work_type: feature
  scale: large
  topic-slug: req-spec-boundary-and-granularity
  adr-required: false
  adr-rationale: >
    文書ガバナンス方針の明文化であり技術的アーキテクチャ判断を含まない。
    REQ-0101-050 が ADR/SPEC/REQ 役割分担原則を既に確立。
    ADR禁止ゲート「仕様変更のみ・文書種別責務境界・運用ルール」に該当。
  status: saved
  created: 2026-06-17
  target-reqs: [REQ-0101, REQ-0102, REQ-0108, REQ-0109]
-->

# REQ/SPEC 責務境界と REQ 粒度基準の明確化・運用維持

## 目的

active REQ 全体に横断する品質課題（要件行の過小粒度・schema/enum/detail 混入・作業履歴残留）の根本原因である「REQ/SPEC 責務境界の未明文化」と「REQ 粒度基準の不足」を解消する。REQ が満たすべき状態・振る舞い・制約・外部契約と、SPEC が記述する実装構成（schema・判定表・内部パラメータ等）の境界を明文化し、パラメータ的でも安定契約なら REQ に残す例外基準を定義する。これにより req-define / req-save / docs-check / inspect-docs が一貫した基準で REQ 品質を維持できるようにする。

## Requirement Source

- RU-20260617-01: REQ/SPEC責務境界とREQ粒度基準の明確化・運用維持（`.agentdev/backlog/req-units/RU-20260617-01.md`）

---

## OU-1: REQ-0101 APPEND — 境界基準 + SPEC 移管基準 + 安定契約例外判定

### 目的

REQ と SPEC の文書種別責務境界を、状態・振る舞い・制約・外部契約（REQ）と schema・lifecycle・判定表・内部パラメータ（SPEC）の対比として明文化する。SPEC へ移管すべき内容の具体カテゴリリストと、パラメータ的であっても安定契約なら REQ に要約残留させる例外基準を定義する。

### 要件

| ID | 要件 |
|---|---|
| REQ-0101-067 | REQ は対象が満たすべき状態・振る舞い・制約・外部契約を記述する文書種別であり、SPEC は現在の実装構成を成立させる schema・lifecycle・command topology・rule catalog・fixture detail・判定表・enum・format・内部パラメータを記述する文書種別であること |
| REQ-0101-068 | REQ 要件行が schema field・enum 値一覧・route/category/status 詳細判定表・file pattern・template variant・report format・fixture detail・regression test 条件・checker 個別ルール・false positive 抑制方式・retry 回数・token 目安・行数上限・Step 番号・Phase 番号・内部アルゴリズム・作業履歴・Case/RU/Issue/PR/OU 由来の作業記録のみを主たる文意とする場合、当該内容は SPEC・rule catalog・command reference・skill reference・test docs のいずれかに配置する対象であること |
| REQ-0101-069 | REQ 要件行候補がパラメータ・分類・値の形式をとる場合であっても、公開 command 名・公開入口・domain state の位置づけ・他 command との接続契約・利用者に見える分類体系・安全境界・停止条件の大枠・後続工程が依存する安定した外部契約のいずれかに該当する場合は、REQ に要約として記述できること。詳細な値一覧・判定表・内部処理条件は SPEC 等に配置すること |

### 適用範囲

- **対象**: REQ/SPEC 文書種別の責務境界定義、SPEC 移管基準の具体カテゴリ、安定契約例外判定
- **対象外**: 個別 SPEC ファイルの具体的な内容定義、個別 active REQ の再構成作業、新規 SPEC ファイル名の確定

---

## OU-2: REQ-0102 APPEND — 粒度基準拡張

### 目的

REQ 要件行の粒度基準に、外部契約の正面表現と必要性テストを追加し、req-define / req-save が REQ に残すべき内容か SPEC 等に配置すべき内容かを保存前に判定できるようにする。

### 要件

| ID | 要件 |
|---|---|
| REQ-0102-053 | REQ 要件行は、外部から見える責務・command 間契約・domain state の位置づけ・公開入口・安全境界・恒久的な文書体系制約を表す内容を含めること |
| REQ-0102-054 | REQ 要件行は、当該行が存在しない場合に対象 REQ が何を満たすべきか不明になる内容に限定すること |
| REQ-0102-055 | req-define および req-save は、要件行候補が REQ に記述すべき外部契約・状態要件であるか、SPEC・rule catalog・command reference 等に配置すべき詳細・内部パラメータであるかを、保存前に判定すること |

### 適用範囲

- **対象**: REQ 要件行の粒度基準（外部契約正面向け・必要性テスト）、req-define / req-save での REQ/SPEC 配置判定
- **対象外**: SPEC ファイルの具体的な判定表、個別要件行の移管先確定

---

## OU-3: REQ-0108 APPEND — docs-check 境界違反検出

### 目的

docs-check が active REQ 要件行への schema・enum・fixture・checker detail・Step/Phase 番号・作業履歴の混入を検出できるようにする。ただし安定契約例外（REQ-0101-069）に該当する要約残留は誤検出としない。

### 要件

| ID | 要件 |
|---|---|
| REQ-0108-260 | docs-check は、active REQ 要件行に schema field・enum 値一覧・fixture detail・checker 個別ルール・false positive 抑制方式・Step 番号・Phase 番号・内部アルゴリズム・具体的な作業履歴が要件の主たる文意として混入している場合、warning として検出できること。ただし REQ-0101-069 に定める安定契約例外に該当する要約残留は検出対象外とすること |

### 適用範囲

- **対象**: docs-check の REQ/SPEC 境界違反検出観点
- **対象外**: 個別 checker の実装、正規表現、具体的な検出ロジック、finding schema の field 定義（SPEC 配置）

---

## OU-4: REQ-0109 APPEND — inspect-docs 粒度過小診断

### 目的

inspect-docs が REQ/SPEC 境界違反・REQ 粒度過小・SPEC detail 混入・外部契約と内部パラメータの誤分類を診断観点として扱えるようにする。REQ-0101-067〜069 の境界基準を参照し、active REQ の再分類候補抽出時の判断基準として機能する。

### 要件

| ID | 要件 |
|---|---|
| REQ-0109-047 | inspect-docs は、REQ/SPEC 境界違反・REQ 粒度過小・SPEC detail 混入・外部契約と内部パラメータの誤分類を診断観点として扱えること。REQ-0101-067〜069 の境界基準・SPEC 移管基準・安定契約例外判定を参照し、active REQ の再分類候補抽出時の判断基準として機能すること |

### 適用範囲

- **対象**: inspect-docs の REQ 粒度・境界診断観点
- **対象外**: 個別 REQ の具体的な再構成案、移行先一覧、出力スキーマの詳細型定義

---

## 全体適用範囲

- **対象**: REQ-0101（境界基準・SPEC 移管基準・安定契約例外）、REQ-0102（粒度基準拡張・REQ/SPEC 配置判定）、REQ-0108（境界違反検出）、REQ-0109（粒度過小診断）
- **対象外**: 各 active REQ 要件行の個別削除・移管・統合の確定、前回抽出した問題候補の一括削除・SPEC 移管、REQ-0108 以外を含む active REQ 全件の具体的な差分作成、新規 SPEC ファイル名の確定、個別 checker の実装、integrity rule の具体的な正規表現、command / skill / reference の実装変更、過去履歴の完全削除方針の確定、retired REQ / retired ADR の大規模再編集

---

## operation_units

| ou_id | source_ru | target_req | operation | scale | depends_on | recommended_order | issue_policy | result |
|---|---|---|---|---|---|---|---|---|
| OU-1 | RU-20260617-01 | REQ-0101 | APPEND | standard | [] | 1 | separate | REQ-0101-067-069 appended |
| OU-2 | RU-20260617-01 | REQ-0102 | APPEND | standard | [OU-1] | 2 | separate | REQ-0102-053-055 appended |
| OU-3 | RU-20260617-01 | REQ-0108 | APPEND | standard | [OU-1, OU-2] | 3 | separate | REQ-0108-260 appended. catalog entry未確認（case-run対象） |
| OU-4 | RU-20260617-01 | REQ-0109 | APPEND | standard | [OU-1, OU-2] | 3 | separate | REQ-0109-047 appended |

## execution_groups

| id | type | purpose | included_ou | rationale |
|---|---|---|---|---|
| EG-1 | Epic | REQ/SPEC 責務境界と REQ 粒度基準の明確化・運用維持 | [OU-1, OU-2, OU-3, OU-4] | 4 つの REQ 操作が共通の境界基準に依存し、Wave 分離で実行する。OU-1 が基盤（境界基準・例外判定）となり、OU-2 が OU-1 を参照して粒度基準を拡張し、OU-3/OU-4 が OU-1/OU-2 を参照して検出・診断観点を追加する。並列実行可能な OU-3 と OU-4 は同一 Wave で処理できる。 |

## Wave 構成（提案）

- **Wave 1**: OU-1（REQ-0101 境界基準 + SPEC 移管基準 + 安定契約例外判定）— 全体の基盤
- **Wave 2**: OU-2（REQ-0102 粒度基準拡張）— OU-1 の境界基準を参照
- **Wave 3**: OU-3 + OU-4 並列（REQ-0108 検出 / REQ-0109 診断）— OU-1/OU-2 を参照

## 関連ドキュメント更新候補

以下は req-save 完了後に case / Issue で扱う反映作業候補。req-define の直接出力ではない。

| 対象 | 更新内容 | 根拠 OU |
|---|---|---|
| `docs/specs/document-model.md` | SPEC Separation Criteria セクション拡張（安定契約例外・SPEC 移管基準具体リスト・REQ 粒度判定テスト追加） | OU-1, OU-2 |
| `docs/specs/integrity-rule-catalog.md` | REQ/SPEC 境界違反検出ルールの catalog entry 追加 | OU-3 |
| `docs/specs/integrity-contracts.md` | finding category/route の境界違反カテゴリ拡張 | OU-3 |
| `docs/specs/req-impact-map.md` | REQ-0101/0102/0108/0109 の影響マップ更新 | OU-1〜4 |
| `agentdev-req-analysis` skill | 状態要件と反映作業の分離基準への境界基準統合 | OU-1, OU-2 |
| `agentdev-quality-gates` skill (QG-1 reference) | REQ/SPEC 配置判定の品質ゲート参照追加 | OU-2 |

## フォローアップ（本 req-define の対象外）

RU 受け入れ条件 AC7-9 は、本 req-define で確立する基準を用いた後続の再構成作業に関する実行原則である。対象外として記録する:

- **AC7**: REQ-0108 の外部契約中心再構成（finding schema・個別 checker・fixture・FP 抑制の SPEC 分離）— 本基準を用いた別 Case で実行
- **AC8**: active REQ 全件の再分類（外部契約/状態要件/安定境界/内部仕様/schema/実装手順/履歴への再分類）— 本基準を用いた段階的実行
- **AC9**: 移管先未確定内容の REQ 本文混入防止 — REQ-0102-024/028 + 本 OU-2 の粒度基準で担保
