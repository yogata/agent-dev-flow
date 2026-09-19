---
title: ADF v4 Quality / Verification / Evidence / Gate モデル
status: accepted
created: 2026-09-18
updated: 2026-09-19
---

<!-- ADF-COVERS(implementation): REQ-003-013, REQ-007-006, REQ-007-007, REQ-007-008, REQ-007-009, REQ-057-003 -->

# ADF v4 Quality / Verification / Evidence / Gate モデル

位置づけ: 本 Design は ADF v4 モデルの定義である。本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。

## 5 概念の定義と責務

Quality Policy / Verification Obligation / Verifier / Evidence / Gate の定義、相互の非重複責務、Gate = 状態遷移 predicate としての契約、tool-specific detail の Verifier/adapter 配置原則。

- Quality Policy: 何を品質として要求するか
- Verification Obligation: Requirement/risk/acceptance から何を検証すべきか
- Verifier: deterministic または semantic な検証を実行する主体
- Evidence: 検証結果の永続的または参照可能な根拠
- Gate: 次状態へ遷移するために必要な条件/Evidence が揃っているかを判定する predicate
- Gate を checker、test、Skill の別名として定義せず、Bun invocation、path check、lint command 等の tool-specific detail は Gate の意味契約へ含めず Verifier/adapter/deterministic implementation 側へ置く

## v4 standard lifecycle からの Gate 再導出

現行 QG-1〜QG-4 を前提としない再導出手順、requirements-driven verification（change -> risk -> verification obligation -> test strategy）との接続、要求形成時に必要 Evidence 種類を確定し実行後に同一 Evidence で完了判定する閉ループ。

- 現行 QG-1〜QG-4 を v4 の前提とせず、v4 standard lifecycle と requirements-driven verification から必要な Gate を再導出する
- 要求形成時に必要 Evidence の種類が明確になり、実行後にその Evidence で完了判定できるモデルを作る

## v4 standard lifecycle からの Gate 再導出（実行結果）

### 再導出手順

1. v4 standard lifecycle の公開遷移（Definition 保存完了、ready 遷移時の execution structure 確定、running への PR 化、closing 前）を対象遷移として列挙する
2. 各対象遷移について、要件（change から risk を経由した verification obligation）と acceptance criteria から Verification Obligation を導出する
3. 各 Obligation を満たす Verifier（deterministic / semantic）と、それが生成する Evidence（種別・保存契約）を確定する
4. Evidence が揃っているかの predicate として Gate を定義し、v4-lifecycle-state-machine の deterministic gate predicate 接続点へ接続する
5. 既存 gate 呼称（QG-1〜QG-4、工程内 gate 群）との対応を、保持・統合・置換・QG 番号なし工程内 gate の個別処遇として記録する

### 再導出結果（lifecycle 級 semantic Gate 群）

| Gate | 対象遷移（v4LSM deterministic gate predicate 接続点） | Verification Obligation | Verifier | Evidence（種別・保存契約） | 判定値 |
|---|---|---|---|---|---|
| QG-1（Definition Integrity） | Definition 保存完了時（draft 保存・Definition PR 化前） | Definition（要件doc・Definition Package）が構造完全性・frontmatter 妥当性・未確定内容抑止を満たす | semantic（機械的検査を部分的に内包） | 検査ログ・draft 検証記録（機械的証拠・推論証拠） | pass / warn で継続可 |
| QG-2（Acceptance Coverage） | ready 遷移時の execution structure 確定（Epic・子 Issue 構成） | 完了条件・acceptance criteria が対象要件行を網羅し参照整合が取れている | semantic | Issue 本文・チェックボックス投影・構成対応表（構造的証拠） | pass / warn で継続可 |
| QG-3（Implementation Deviation） | running への PR 化前 | 実装差分が Issue scope を逸脱していない（no-deviation / impl-bug / spec-bug / scope-creep の分類） | semantic（機械的検査を部分的に内包） | PR 本文・乖離分類記録・検査ログ（機械的証拠・推論証拠） | fail は PR 化不可 |
| QG-4（Final Acceptance） | closing 前（子 Issue・Epic・Root Case の close 前） | test strategy 3 要素完全性・リスクから test strategy への投影完全性・full integrity suite 受入れ・traceability check 前提手順・verify-only 証拠ソース | deterministic + semantic | QG-4 結果コメント・suite 実行ログ・SSoT コメント（機械的証拠） | pass / warn のみ close 可 |

### QG-1〜QG-4 個別処遇対応表

| QG | v3 での位置づけ | v4 処遇 | 根拠 |
|---|---|---|---|
| QG-1 | Definition Integrity（req-define / case-ready / case-revise） | 保持（配置点を v4 遷移へ再錨定） | Definition 保存時の構造完全性 Obligation が v4 でも独立に存在する |
| QG-2 | Acceptance Criteria Coverage（case-open） | 保持（配置点を case-ready の execution structure 確定へ移動） | v4 lifecycle で Issue 構成確定は case-ready 側に集約された |
| QG-3 | Implementation Deviation（case-run） | 保持（配置点を PR 化前へ再錨定） | 実装差分検証 Obligation は PR route で不変 |
| QG-4 | Final Acceptance（case-close） | 保持（verify-only closure 証拠ソースと full suite 受入れ基準を維持） | close 前の最終受入 Obligation は v4 でも同一形式 |

### 工程内 deterministic gate 群（QG 番号を付与しない）

次の gate 群は工程内の deterministic な検証であり、lifecycle 級 semantic Gate（QG-1〜QG-4）とは区別する。Gate を checker / test / Skill の別名として増殖させない。

| 工程内 gate | 所有 workflow | 内容 |
|---|---|---|
| トレーサビリティ完全性ゲート | case-ready（構成確定時） | 実行対象要件行の design 対応 1 件以上など構成前提の完全性 |
| クリーンアップ検証ゲート | case-auto（stage 2 収束後） | draft・RU 残存検証 |
| 配布依存境界 gate | case-run（PR 化前）・case-close（merge 前） | distribution boundary profile 検査 |
| targeted docs guard / AUTOGEN 鮮度検出 gate | 各保存・完了工程 | 変更ファイル限定検査と AUTOGEN 再生成鮮度 |
| Definition PR 受入 3 検査 | case-ready（Definition merge 前） | 忠実性・整合性・品質（要件doc との照合。QG-1 の保存時構造完全性とは別 Obligation） |
| テスト影響範囲検出 gate | 実行担当（PR 化前） | 変更が検証資産へ与える影響の検出 |

### 判定値と遷移接続

- Verifier の verdict は pass / warn / fail / partial の 4 値とする（common gate contract が定義）
- Gate predicate への写像は、pass と warn を遷移可（warn は対応記録コメントへの記録を条件とする）、fail を遷移不可、partial を判定保留として遷移不可（残余 Obligation の解消後に再判定が必要）とする
- QG-4 は partial を不可として扱い、再判定は当該 close 内で完了させる必要がある
- semantic Verifier の verdict は deterministic gate predicate へ供給される。semantic gate は遷移に直接接続せず、v4-lifecycle-state-machine の deterministic gate predicate 接続点（唯一の接続点）を経由して遷移を制御する

### 証拠種別と Verifier 分類の直交

証拠 3 分類（機械的 / 構造的 / 推論）は Evidence の属性であり、Verifier 分類（deterministic / semantic）とは直交する。構造的証拠はいずれの Verifier からも生成され得る。二つの分類を 1:1 対応として扱わない。

### 用語

「品質ゲート」は本 Design の Gate の日本語呼称として使用を許容する。REQ の行文言における「品質ゲート」表現は、本 Design の Gate を指すものとして読む。

### v3 quality-gates Design からの吸収

v3 quality/quality-gates.md は本 Design により supersede される。本 Design が引き継ぐ意味契約は次のとおり。

- QG-1〜QG-4 の各判定の意味契約（再導出結果表の Verification Obligation 列）
- 機械化境界表（機械的検証 / 推論ベース検証 / サブエージェント委譲 / ユーザー判断の区分）
- verify-only PR / verify-only closure の証拠ソース契約（SSoT コメント形式）
- test strategy 3 要素完全性と、リスクから test strategy への投影完全性の QG-4 判定観点
- traceability check 前提手順（PR 作成前検査）
- 実行計画確認（外部実行ハーネス）は QG-3 / QG-4 の代替にならない（REQ-003-013）

full integrity suite 受入れ基準・bun test 正規形・機械受理基準の正規形は、skill Design（skills/agentdev-quality-gates.md および references）が原本として保持する（REQ-060 が指定）。本 Design は意味契約と権威ポインタのみを所有し、実行詳細の二重管理を行わない。

Gate 群の列挙と体系変更は本 Design（quality ドメイン）が所有する。Standard Operating Model（v4-standard-lifecycle）は work_type / scale / Epic / Wave の語彙と lifecycle 遷移を所有し、Gate の定義本体は本 Design に帰属する。

## Verifier 分類

deterministic verifier と semantic verifier の分類、Evidence の保存契約（永続/参照可能）。
