---
title: ADF v4 実装責務境界（意味判断 Skill / 決定的処理 code / Harness adapter / Project Extensions）
status: accepted
created: 2026-09-18
updated: 2026-10-01
---
<!-- ADF-COVERS(implementation): REQ-003-021, REQ-003-022, REQ-003-023 -->
<!-- ADF-COVERS(design): REQ-096-001, REQ-096-002, REQ-096-003, REQ-096-004, REQ-096-005, REQ-096-006, REQ-096-007, REQ-096-008, REQ-096-009, REQ-096-010, REQ-096-011, REQ-096-012, REQ-096-013, REQ-096-014, REQ-096-015, REQ-096-016, REQ-096-017, REQ-096-018, REQ-096-019, REQ-096-020, REQ-096-021, REQ-096-022, REQ-096-023, REQ-096-024, REQ-096-025, REQ-096-026, REQ-096-027, REQ-096-028, REQ-096-029, REQ-096-030, REQ-096-031 -->

# ADF v4 実装責務境界（意味判断 Skill / 決定的処理 code / Harness adapter / Project Extensions）

位置づけ: 本 Design は ADF v4 モデルの定義である。本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。

## 意味判断・決定的処理の責務境界

判断方法の分類基準（判断方法3分類: 決定的処理・閉じた意味評価・開いた推論。正典: DEC-048）と、現行 Skill の再分類判定基準。旧 DEC-036 決定(1) の semantic 6 項目・deterministic 11 項目列挙の後継と写像は本 Design「v4 責務分類語彙の後継」節が所有する。

- 意味判断（Skill が所有）: 閉じた意味評価・開いた推論として所有する判断。旧列挙 6 項目の写像は「v4 責務分類語彙の後継」節を参照
- 決定的処理（code/script/tool が所有）: 入力と確定済み規則から一意に導出できる処理。旧列挙 11 項目の写像は「v4 責務分類語彙の後継」節を参照
- Skill 数の削減自体を目的としない

## 知識提供層（3 区分の第3区分）

意味判断にも決定的処理にも直接対応しない責務を「知識提供」層とする。判定基準・安全手続き・様式・選定規則などの知識を一次情報として提供し、workflow 制御も決定的処理の実行も所有しない。各 skill の 3 区分（意味判断担当〔閉じた意味評価・開いた推論を所有〕/ 決定的処理委譲先 / 知識提供）への帰属は `designs/skills/` 各 Design の「v4 責務分類」節が記録する（語彙の正本は本 Design「v4 責務分類語彙の後継」節）。分類が確定しない項目は意味判断への該当性を優先して判定し、該当しない場合に知識提供層へ分類する。

## Harness / Backend adapter 境界

ADF（semantic contract）と Harness（実行機構）の責務分担、OpenCode を first-class reference harness とする位置づけ、adapter 追加契機、未使用 adapter の先行実装禁止。

- ADF は requirement/lifecycle/authority/evidence 等の semantic contract を所有する
- Harness は agent 起動、context、background execution、tool invocation 等の実行機構を所有する
- OpenCode を first-class reference harness として扱う。必要になった時点で adapter を追加し、未使用 Harness/Backend を先回りして実装しない

## Project Extensions の semantic extension point

標準プロセス置換でない追加モデルと、現行 Skill 名結合からの移行方針。

- Project Extensions は、project context、rules、quality/evidence policy、project-specific verifier/check、tool/config integration、semantic guidance を標準プロセスへ追加する semantic extension point である（表現力 6 項目）
- 標準プロセスを別 workflow へ置き換える仕組みとしない
- 現行 Skill 名への直接結合を v4 の安定 API としない

## HITL 判断確定原則

HITL は判断の確定に限定し作業実行を代行しない（REQ-003-021）。判断確定後の処理は明示された許可条件の下で自動実行してよい（REQ-003-022）。明示承認を維持し、暗黙の承認扱いとしない（REQ-003-023）。判断確定の境界は REQ-096（ADF判断アーキテクチャ）と本 Design「ADF判断アーキテクチャ詳細基準」節が所有する（本新節が旧 REQ-003-055 から委任されていた「HITL 移送条件の完全な一覧」の実体化を担い、以後は REQ-096 と本 Design の2層で判断境界契約を所有する）。promote 系 workflow（intake-promote、learning-promote、inspect-promote）への適用判断の詳細は各 Command Design が所有する。

## ADF判断アーキテクチャ詳細基準（REQ-096、DEC-048）

### 判断方法3分類の判別基準

- 決定的処理: 入力と確定済み規則から一意に導出できる処理。判断単位の構成時に
  「モデル推論なしで一意に導出できること」を機械判定基準として Workflow/Capability
  Skill が判定する（REQ-090-018 の境界判定基準を一般化）。機械的に確定した結果を
  閉じた意味評価で再判定させる二重確認を行わない。
- 閉じた意味評価: 評価前に必要な事実、判断基準、結果空間を限定でき、与えられた入力
  だけで判断可能な意味判断。評価入力を閉じる過程に別の未解決な意味判断を隠さない。
- 開いた推論: 文脈統合、設計、原因分析など、結果空間を事前に完全には限定できない推論。
- 3分類は難易度順の段階構造ではない。いずれの分類も確定権限の判定と独立する。

### 確定権限3分類の判定表

| 確定権限 | 判定条件 | 典型例 |
|---|---|---|
| 正規契約からの導出 | 既存の REQ、Decision、Design、Issue、合意済み内容から結論を導出できる | テンプレート準拠判定、採番、形式検証、確定済み依存からの Wave 構成 |
| 委譲された裁量 | 複数の妥当な選択肢が存在しても、確定済みの目的、対象範囲、制約、受け入れ条件、外部契約を変更しない範囲で選択権限が委譲されている | Issue 対象範囲内の内部実装判断、意味を保持する RU 統合・分割、合意済み要件の具体化 |
| 人間に留保された判断 | 新しい目的、価値、優先順位、対象範囲、外部契約、受け入れ条件、恒久規範、既存契約だけでは解決不能な規範間の優先関係を新たに確定する必要がある | 要件の対象範囲変更、破壊的変更の承認、未解決規範矛盾の解消 |

### 人間判断への引き上げ条件（HITL 移送条件の完全な一覧。旧 REQ-003-055 委任の実体化）

1. ユーザー固有の目的・価値観・優先順位の新規確定を要する事項
2. 正規情報源間の未解決規範矛盾（解決可能な不一致を含まない）
3. 対論型レビューで未解決が維持された本質的争点のうち規範間の優先関係の新規確定を要するもの
4. 要件・仕様の対象範囲、外部契約、受け入れ条件、恒久規範の新規決定
5. 既存の明示的な安全境界が要求する操作の承認
（判断の難易度、確信度、評価器間の不一致、結果状態、一意解でないことは引き上げ条件ではない。
引き上げ条件1〜4は REQ-096-005 の8要素〔目的、価値、優先順位、対象範囲、外部契約、受け入れ
条件、恒久規範、規範間優先関係〕を網羅する）

### 失敗・停止理由の原因別処理対応表

| 原因 | 処置 |
|---|---|
| 実装不具合 | 自動回復（正規所有工程の修正ループ） |
| 証拠不足 | 証拠再取得 |
| 外部依存障害 | 再試行または手動による運用上の介入 |
| 運用上の前提不足（認証情報不足、権限不足、ツール操作不足等） | 手動による運用上の介入（人間の権限判断とは区別） |
| 上流成果物の投影・整合不備 | 正規所有工程への差し戻し |
| 正規情報源間の解決可能な不一致 | 権威優先での解消または停止（意味的な自動マージはしない。DEC-039 決定(4)） |
| 正規情報源間の未解決規範矛盾 | 人間判断へ移行 |
| 人間に留保された新しい判断 | 人間判断へ移行 |

### 閉じた意味評価の閉包条件（REQ-090-024 から一般化）

対象は次の条件をすべて満たす判断に限定する。(1) モデル推論なしでは一意に確定できず
意味の解釈を必要とすること、(2) 判断に必要な事実を入力として与えられること、
(3) 判断基準を明示できること、(4) 正解となり得る結果範囲を閉じられること、
(5) 与えられた入力だけで判断できること、(6) 入力を閉じる過程に別の未解決の意味判断を
隠していないこと。「決定的処理として確定できない」という理由のみで閉じた意味評価の
対象にしない。本条件は評価器固有形式から独立し、現在の評価器（Jev）の適用判断
（REQ-090）は本条件を参照する。

### v4 責務分類語彙の後継（DEC-036 決定(1) 列挙の移行先。旧「semantic 6 項目・
deterministic 11 項目」の正典継承）

skill Design の「v4 責務分類」3区分（semantic 担当 / deterministic 委譲先 / 知識提供）は
次の語彙対応で移行する: semantic 担当 → 意味判断担当（閉じた意味評価・開いた推論を所有）、
deterministic 委譲先 → 決定的処理委譲先、知識提供 → 維持。旧列挙項目の新分類への写像は
次のとおり:

| 旧分類（DEC-036 決定(1)） | 項目 | 新分類 |
|---|---|---|
| semantic | requirement analysis、architecture/design judgment、decomposition judgment、adversarial review、learning evaluation、semantic classification（6項目） | 閉じた意味評価または開いた推論（判断単位ごとに閉包条件で判別） |
| deterministic | parsing、validation、ID 採番、状態遷移、dependency graph、Wave scheduling、path safety、traceability extraction、evidence aggregation、API I/O、file transformation（11項目） | 決定的処理 |

旧語彙（semantic 6 項目・deterministic 11 項目）を正典参照として残存させない。skill Design
3区分節の語彙移行と skills/_template.md の書式更改は RA-004 が担う。Root Case #3011 分類
語彙表は移行後の語彙対応の履歴参照として扱い、正典とはしない。
