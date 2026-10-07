---
title: ADF v4 Quality / Verification / Evidence / Gate モデル
status: accepted
created: 2026-09-18
updated: 2026-10-07
---

<!-- ADF-COVERS(implementation): REQ-003-013, REQ-007-006, REQ-007-007, REQ-007-008, REQ-007-009, REQ-054-003 -->
<!-- ADF-COVERS(design): REQ-061-042, REQ-017-021, REQ-017-022, REQ-032-031, REQ-032-032, REQ-032-033, REQ-032-034, REQ-032-035, REQ-032-036, REQ-032-037, REQ-032-038, REQ-096-032, REQ-096-033, REQ-096-034, REQ-101-017, REQ-101-018, REQ-101-019 -->
<!-- ADF-COVERS(design): REQ-103-018, REQ-103-019, REQ-103-029, REQ-103-031（REQ-103 の統制必要性・新規統制抑制・有限完了・最終検証判定の設計対応面） -->
<!-- ADF-COVERS(implementation): REQ-103-018, REQ-103-019（統制種別必要性節と前置規律・検証体制の実装対応。統制の必要性説明の正規節を本 Design が所有する） -->

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
| QG-1（Definition Integrity） | Definition 保存完了時（draft 保存・設計PR化前） | Definition（要件doc・Definition Package）が構造完全性・frontmatter 妥当性・未確定内容抑止を満たす | semantic（機械的検査を部分的に内包） | 検査ログ・draft 検証記録（機械的証拠・推論証拠） | pass / warn で継続可 |
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
| 設計PR受入 3 検査 | case-ready（Definition merge 前） | 忠実性・整合性・品質（要件doc との照合。QG-1 の保存時構造完全性とは別 Obligation） |
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

## QG-2 / QG-4 の受け入れ義務保存拡張（RU-20261004-08）

QG-2 / QG-4 の Verification Obligation への受け入れ義務保存の拡張。新しい Gate、結果状態は追加しない。

- QG-2（Acceptance Coverage）の Verification Obligation に、完了条件・acceptance criteria の測定可能性に加え、受け入れ義務の投影完全性（対応先のない義務の不存在）、評価範囲、検証義務を確定可能かの確認を含める（REQ-061-042、REQ-017-021/022）。
- QG-4（Final Acceptance）の Verification Obligation に、正規契約からの検証義務の独立導出または照合、証拠・既判定の鮮度確認、条件単位評価と既存 Gate 結果・Issue 状態の分離、実際の進行・終了経路への判定接続、証拠の意味対応、N/A 根拠確認、全称・不存在条件の反例探索、非循環証拠、偽陽性・偽陰性双方の防止を含める（REQ-032-031〜038、REQ-096-032/033、REQ-101-017〜019）。
- 完了条件単位の評価区分（pass / fail / blocked / not applicable）は完了条件単位の評価であり、Gate の判定値（pass / warn / fail / partial）への写像は正規所有契約（判定値と遷移接続）が定める。必須条件の未達・未証明を Gate 全体の warn で通過させない。
- QG-4 の評価は case-run が提示した検査対象、期待結果、除外条件、合格申告をそのまま最終基準として利用しない。実装結果から検証基準を逆算せず、正規契約側から検証義務を形成する。
- 検証義務導出の判断方法は REQ-096 の3分類（決定的処理、閉じた意味評価、開いた推論）に従い、単純な全ツリー検索等の単一手段をすべての検証義務へ一般化しない。

## Verifier 分類

deterministic verifier と semantic verifier の分類、Evidence の保存契約（永続/参照可能）。

- deterministic verifier は決定的処理として実行される検証であり、semantic verifier は閉じた意味評価または開いた推論を含む検証である。判断方法3分類の正典は DEC-048 と foundations/v4-responsibility-boundaries Design「判断方法3分類の判別基準」節であり、本分類は検証の実行方式の分類として判断方法3分類へ対応づく。旧 DEC-036 決定(1) の deterministic／semantic 二分法は判断方法の分類としては DEC-048 が置換済みであり、判断方法の分類として本分類（Verifier 分類）の語彙を使用しない
- 必須の閉じた意味評価を検証とする semantic verifier が評価器障害（未設定、利用不能、timeout、rate limit、network error、provider error、応答検証失敗等）で成立しない場合、判定は未確定とし、LLM 推論へ fallback せず、partial（判定保留）として遷移不可を維持する（REQ-103-008、REQ-103-009。runtime 面の適用は v4-runtime-execution-model Design「判定未確定時の依存後続抑止」節）

## 統制種別と必要性（REQ-103-018・019）

REQ-103-018 が列挙する統制種別ごとの正規モデル上の必要性と、詳細契約の正規所有を定める。本節は統制種別の必要性説明の正規節であり、個別適用箇所の列挙を恒久管理しない（適用箇所の列挙は検証時に機械検索で行う。恒久台帳の新設禁止〔REQ-103-019〕に従う）。必要性説明を欠く統制は維持せず、本節へ追加する統制は必要性説明を同一変更で記録する。

| 統制種別 | 正規モデル上の必要性 | 詳細契約の正規所有 |
|---|---|---|
| hard gate | 状態遷移を誤った前提で進行させない機械的拒否。モデルの遵守判断に委ねず、遷移・副作用の前に拒否する | 本 Design「5 概念の定義と責務」（Gate = 状態遷移 predicate）、v4-runtime-execution-model（authority 格子と直列化単位） |
| fail-closed | 検査不能・異常・設定不備時に成功を偽装せず停止する。静かな成功による品質境界の崩壊を防ぐ | v4-runtime-execution-model「fail-closed 適用範囲」（書込み経路の統制点は fail-closed。助言的統合〔検査・診断系等〕のみ fail-open 許容） |
| checker | 整合性検査の実行手段と検出基準を契約化し、検証の属人化と誤検出の反復を防止する | checker-execution-contracts（checker 共通実行契約、detector 命名規約）、integrity-contracts（深刻度分類） |
| MUST NOT / 禁止規則 / must_not | 機械拒否に落とせない前提契約を規範として宣言し、checker・guard 実装の根拠を与える（LLM fallback 禁止、raw gh 書込み禁止、自動ループバック禁止、guard 迂回禁止等） | 各禁止を正規所有する REQ/Decision/Design（LLM fallback 禁止: v4-responsibility-boundaries「閉じた意味評価の障害時契約」、raw gh 書込み禁止: custom-tool-contracts「迂回防止」） |
| adversarial-review | 本質的争点を人間判断へ引き上げる前に、複数視点の相互反証で争点解消を試みる。恒久統制ゲートではなく審議契約であり、skip 条件を契約として持つ | REQ-082、skills/agentdev-adversarial-review Design（3論理役割・動的レビュー戦略・read-only 境界） |
| HITL | 人間に留保された判断（REQ-103-012）の確定を、判断確定のみに限定して工程へ接続する。作業実行の代行、運用介入の承認、評価器障害時の人間判断移行と混同しない | v4-responsibility-boundaries「HITL 判断確定原則」「人間判断への引き上げ条件」（評価器障害除外を含む） |
| fallback | 障害時に正規の再実行・再開経路へ戻せること自体が要件である場合の代替経路のみを許し、判定方式の代替・無断の品質劣化経路を禁止する（LLM fallback 禁止、publish の copy/rename fallback 不導入） | v4-responsibility-boundaries「閉じた意味評価の障害時契約」、v4-runtime-execution-model「判定未確定時の依存後続抑止」、v4-durable-state-and-recovery「評価器復旧後の評価再開契約」 |
| duplicated validation | 同一命題を正規工程として再判定することは禁止する（REQ-103-003）。一方、副作用の成功保証としての入力検証＋読戻し照合、列挙件数と期待件数の突合など、命題の異なる防御的な二重確認は区別して許容する | artifact-contracts（Custom Tool 操作契約の読戻し検証）、checker-execution-contracts「パターンマッチ・網羅検査設計の標準規約」（件数突合） |
| state | 判断・進行・証跡の durable な保持と、復旧後の正規再開経路を契約化する。導出可能情報を恒久保持しない | v4-durable-state-and-recovery（5 分類と配置表、状態権威、部分失敗調整） |
| ledger | 判断根拠の到達性を保つ追跡対象を限定して保持する。恒久台帳の新設は必要性が立証された場合に限り、今回限りの記録を恒久台帳化しない（REQ-103-017） | traceability policy と sidecar（agentdev-traceability）、checker-execution-contracts「IR-055 warning 総数 ratchet と baseline provenance の実行契約」（provenance 付き baseline） |
| routing | artifact 種別から必要な品質能力を決定的に導出し、検査の適用漏れと過剰適用の双方を防ぐ | artifact-quality-control-routing（合成規則、能力キー定義、QG-2 投影契約） |
| additional schema | 構造化された副作用操作の入出力を検証可能にする。soft contract の決定的に扱える部分（存在確認、型、列挙値、ID、参照関係）の機械処理を許容する（REQ-103-013）。schema 検証の全面禁止を意味しない | artifact-contracts（soft contract 再定義、req_draft 出力構造）、custom-tool-contracts（Custom Tool 操作契約） |

### 統制追加の前置規律（REQ-103-018・019）

統制の追加の前に、責務削減、契約縮小、重複除去、決定的導出、所有者統合、不要経路廃止のいずれかでの解消を優先する。本要件（REQ-103）の実現のためだけの中央 router、ledger、新規状態、新規 gate、新規 schema、新規 checker、恒久台帳を追加しない。統制を追加する場合は、当該統制を正規所有する Design への必要性説明の記録を同一変更で行い、本節の統制種別の必要性と矛盾しない根拠を示す。

### 統制種別の検証体制（REQ-103-018・019 の検証方法）

統制種別ごとの現行適用箇所の列挙は、Wave 実行時および横断検証時に機械検索（guards 配下の統制点、checker 実行入口、plugin/hook 登録、規範文書の禁止規則箇所、Custom Tool の検証処理）で行い、本節の必要性説明と突合する。検証のために恒久 checker、恒久台帳、新規 schema を新設しない（REQ-103-019）。検証の結果記録は当該 Case の検証記録（PR 本文の検証差分セクション）へ置き、恒久管理しない（REQ-103-017）。必要性を説明できない統制を検出した場合は、統制の除去・縮小を契約と実装の両面へ反映してから再突合する。
