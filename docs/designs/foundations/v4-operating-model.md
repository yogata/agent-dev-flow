---
title: ADF v4 Operating Model（目的・三層責務・Project Contract・寿命・文書モデル）
status: accepted
created: 2026-09-18
updated: "2026-10-09"
---
<!-- ADF-COVERS(design): REQ-088-001, REQ-088-002, REQ-088-003, REQ-088-004, REQ-088-005, REQ-088-006, REQ-088-007 -->
<!-- ADF-COVERS(implementation): REQ-088-006（REQ、Decision、Design、Implementation、Evidence の意味境界の正規所有の構成実体は本 Design「中核文書モデル」節そのものである） -->
<!-- ADF-COVERS(design): REQ-103-001, REQ-103-020, REQ-103-021, REQ-103-027（REQ-103 の v4 正規モデル・情報寿命・中核維持の設計対応面） -->
<!-- ADF-COVERS(implementation): REQ-103-001, REQ-103-027（REQ-103 の正規モデル要素と正規所有 Design の対応表と「v4 の中核と維持条件」節が、正規モデル一意説明・中核 5 要素維持契約の構成実体） -->
<!-- ADF-COVERS(implementation): REQ-103-029, REQ-103-030, REQ-103-031（REQ-103 の有限完了・並列化と横断整合確認・AC 個別判定の完了記録面。判定記録本体は docs/reports/req-103-ac-judgment-wave3.md。並列実行基盤実体は agentdev-workflow-case-auto 側） -->
<!-- ADF-COVERS(design): REQ-104-001, REQ-104-002, REQ-104-005, REQ-104-006, REQ-104-007, REQ-105-001, REQ-105-002, REQ-105-003, REQ-105-004, REQ-105-005, REQ-105-006, REQ-105-007, REQ-105-009, REQ-105-010, REQ-105-011, REQ-105-012, REQ-105-013, REQ-105-014（REQ-105-008 の採用済み工程・成果物の解決と移行期デフォルトの設計対応は foundations/v5-adopted-conventions.md が所有する。REQ-105-009〜014 は「意味境界の正規所有と工程別正式確定の区別」節の増分対応） -->
<!-- ADF-COVERS(implementation): REQ-104-001, REQ-104-002, REQ-104-003, REQ-104-004, REQ-104-005, REQ-104-006, REQ-104-007, REQ-105-001, REQ-105-002, REQ-105-003, REQ-105-004, REQ-105-005, REQ-105-006, REQ-105-007, REQ-105-008（v5 基盤要件の設計・構成実体は v4-operating-model の後継更新として RA-003/RA-004 が後続 OU で所有する） -->

# ADF v4 Operating Model（目的・三層責務・Project Contract・寿命・文書モデル）

位置づけ: 本 Design は ADF v4 モデルの定義である。本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。処遇実行段階を経過していない v3 成果物は過去時点の事実として保持し、現行規範として参照されない限り歴史的本文を書き換えない（REQ-103-020）。本節の対応導線により、歴史的成果物は現行契約として誤認されず、正規所有者へ到達できる（REQ-103-021）。

## 目的と適用範囲

v4 の目的（要件に基づく AI・人間の継続的ソフトウェア開発のための標準 Operating Model と実行基盤。汎用ワークフローエンジンでない）、適用範囲、標準語彙（REQ、Decision、Design、work_type、scale、Epic、Wave、Case、Intake、Learning、Backlog、Quality/Verification/Evidence、Traceability、Project Extensions）とプロセス/実装分離原則。

## 三層責務モデル

ADF Runtime / ADF Standard Operating Model / Project Model の各層の責務定義、層間契約、現行 Command/Skill/docs/checker/sidecar の三層への再分類方針（完全な再分類一覧は v3-v4-crosswalk Design が所有）。

- ADF Runtime: durable state、resume/recovery、authority/side-effect control、idempotency/concurrency、deterministic execution、adapter execution
- ADF Standard Operating Model: requirements-driven lifecycle、REQ/Decision/Design の意味、work_type/scale/Epic/Wave、Case lifecycle、Quality/Verification/Evidence/Gate、Intake/Learning/Backlog loop、標準的な人間・AI 協業境界、bootstrap/migration/self-hosting の標準境界
- Project Model: 当該 Project の REQ、accepted Decision、accepted/current Design、architecture/project policy/quality policy、Knowledge、Backlog/current initiatives、Project-specific extension/configuration、current operating state

現行 Command/Skill/docs をそのまま三層へ割り当てるのではなく、各成果物がどの責務を実現する手段かを再分類する（再分類の完全な一覧は v3-v4-crosswalk Design が所有）。

## Project Contract の論理ビュー

Project Contract は、新しい単一巨大文書ではなく、AI が新しい session から Project の現在契約を再構成するための論理的情報集合である。

- 再構成要素: purpose/goals/non-goals、REQ、accepted Decision、accepted/current Design、architecture invariants、project policy、quality/evidence policy、reusable Knowledge、current development direction、active work（10 項目）
- 各要素について canonical owner、更新契機、寿命を定義する
- AI による再構成手順: 新規 session は上記要素の canonical owner から現在契約を再構成し、単一巨大文書に依存しない

### ADF共通保証と本体Project契約の層帰属

Project Contractは、ADFが配布物全体へ提供する共通保証と、agent-dev-flow本体リポジトリ固有の要求・方針・知識・拡張を区別して記述する。
共通保証に属する契約は配布物・利用先一般に適用され、本体Project固有の契約は本体リポジトリとその整備工程に限定される。
本体固有契約を利用先一般の保証へ逆流させない。
各Project契約記述は、どちらの層に帰属するかを明示して運用される。

## 情報寿命モデル

8 寿命（ADF lifetime、Project lifetime、Architecture lifetime、Requirement lifetime、Change/Case lifetime、Runtime lifetime、reusable Knowledge、未評価 Observation）の定義、各寿命の artifact 種別と canonical owner と昇格条件、Learning/Observation の無条件 REQ 昇格禁止の昇格ガード。

- ルール・情報の寿命を少なくとも 8 種で区別し、各寿命について適切な artifact 種別、canonical owner、昇格条件を定義する
- Learning/Observation が無条件に REQ へ昇格しない構造を作る

## 中核文書モデル

REQ / Decision / Design / Implementation / Evidence の意味境界（What/Why/How/実体/根拠）、更新条件、Decision の現行状態反映と履歴保持の両立方式。

- REQ: 何が成立しなければならないか。外部契約、期待状態、安定した制約を所有（What）
- Decision: なぜその選択をしたか。将来の agent が repository の現状だけから再発見できない判断理由、制約、トレードオフを所有（Why）
- Design: REQ と Decision をどの構造・状態・責務・実現方式で成立させるかを所有（How）
- Implementation: Design を実体化するコード・設定・成果物（実体）
- Evidence: REQ/acceptance が成立したと確認する根拠（根拠）
- Decision の結果を REQ/Design の現行状態へ反映することと、Decision 自体を履歴的根拠として保持することを両立させる

### 意味境界の正規所有と工程別正式確定の区別（REQ-088-006、REQ-105）

上記 5 要素の意味境界は、本節が ADF の基盤モデル定義として正規所有する（REQ-088-006）。運用面（文書種別ごとの責務、配置基準、対応関係の表現方法）は responsibilities/document-type-responsibilities.md が所有し、responsibilities/artifact-contracts.md は成果物間の入出力と操作契約を扱う副次参照である。意味境界の判定を成果物間契約の側から再定義せず、基盤モデル定義と運用面から到達する構造を維持する。

工程別の成果物の正式確定と最終的な要求充足は別判定であり、この区別は本節の所有対象ではなく、REQ-105（ADF v5 成果物の意味と工程別正式確定）が所有する。各工程の成果物は当該工程の要求充足、上流整合、必要な検証の成立をもって後続工程を待たずに正式確定でき（REQ-105-006）、設計成果物の正式確定をもって最終的な要求充足済みと判定しない（REQ-105-007）。最終的な要求充足の判定は case-close の QG-4 最終完了判定が所有する。ゲートが判定条件の前提とする工程・成果物規約は、プロジェクトが採用した採用済み規約から解決し、採用宣言が存在しない間は移行期デフォルト（REQ-105-008）として当該プロジェクトの現に実効している運用を用いる（foundations/v5-adopted-conventions.md「採用規約の構成要素」「移行期デフォルトとの接続」参照）。

成果物種別ごとの正式確定の独立性（REQ-105-009）。後続実装、Issue、PR の存在または完了を一律の確定条件とせず、要求・設計の各成果物の正式確定を成立させる。実装前の設計確定を設計成果物単独で成立させ、独立設計書を採用しない案件では設計文書の作成を確定条件としない。正式確定の構造判定（agentdev-artifact-semantics の finalize）は後続工程の成果物を要求しない。

判定と正規の確定操作・確定状態の区別（REQ-105-010、REQ-105-011）。正式確定の構造判定（agentdev-artifact-semantics の finalize。判定器は副作用を持たず、designValidity は常に not-evaluated-by-this-tool、requirementSatisfaction は常に not-assessed-by-this-tool を返す）は判定であり確定操作を伴わない。判定結果（finalized: true 等）だけを根拠に確定状態を反映・完了扱いとしない。確定可否判断では、構造判定の成立（対応宣言・検証資料の実在と対応の成立）と、検証が実際に成立していること（機械検査結果、内容評価、検証証拠）を区別して扱い、上流との内容整合の確認を含める。構造的な成立や検証資料の存在だけを根拠に正式確定可能と判定しない。この内容評価は閉じた意味判断であり判定器へ組込まない（REQ-096 の判断方法3分類に従う）。

確定状態の反映は各成果物種別の既存状態規則が定める正規の確定経路で実行する。変更駆動では case-close の Design 確定フロー（docs/designs/commands/case-close.md「Design 状態評価の棚卸し制」）が draft から accepted への昇格と docs/designs/README.md status 列の同時更新を担い、Design 保存内部責務は accepted を付与しない。工程駆動では v51 工程駆動モデル（docs/designs/workflows/v51-phase-driven-collaboration-model.md「実行主体と責務境界」）のとおり確定（Design の draft から accepted への昇格、Decision の状態遷移）の権限と経路を既存のまま維持し、経路別所有境界は v51 工程遷移・双経路併存モデルと整合させる。確定状態の反映では権限外の状態変更を行わず、既存の一覧・索引との整合を維持する。

確定記録と版の再構成（REQ-105-012、REQ-105-013）。正式確定では、確定対象、対象範囲、確定根拠を既存の証拠チャネル（当該 Case の Issue 対応記録コメント、PR 本文、正規成果物、Git 履歴）に保持し、確定時点の main 上のコミット（squash merge の場合は squash merge コミット）から確定時の内容を特定できるようにする。別セッションからの再構成は、正規成果物・証拠チャネル・Git 履歴の既存情報から対象取組、工程、確定対象、対象範囲、確定根拠、確定時のGitコミットとその時点の内容を復元する。改訂後の現在の内容を過去に確定した内容として扱わない。再構成が不能な場合（確定根拠の不足、対象版不明、必要な情報の取得失敗）は、不足と確認範囲を区別して報告し、根拠なく確定状態・対象版を推測せず、確定時点を特定できないまま最新コミットを確定版とみなさない。新規の版台帳・確定履歴データベースは一律に新設せず、既存の正規情報と Git を優先利用する。

正式確定と工程遷移・最終要求充足の区別（REQ-105-007、REQ-105-014）。成果物の正式確定は、工程遷移および工程全体の完了を自動的に認定せず、成果物の確定と工程遷移を別々に判定できる。工程遷移は利用者判断による独立操作として維持され（REQ-111-002）、最終的な要求充足の判定は case-close の QG-4 最終完了判定が所有する。

## v4 の中核と維持条件（REQ-103-027）

v4 の Standard Operating Model の中核は次の 5 要素である。正規モデル再収束の作業後もこの中核を維持する。

1. 要件に基づく継続的な開発という目的（requirements-driven lifecycle。汎用ワークフローエンジンでない）
2. 要求の意味の保持（合意した要求の意味・禁止・検証義務が実行と完了判定まで保持され、未達を完了として扱わない）
3. 判断権限の分離（判断方法・確定権限・副作用実行可否の独立軸。詳細は v4-responsibility-boundaries）
4. 永続状態と実行安全（durable state の 1 権威、authority 格子、直列化単位、冪等経路）
5. 証拠連鎖の意味上の性質（Evidence が根拠として成立し、完了判定が証拠と照合される）

維持できないことが判明した場合は、作業内で暗黙に v5 化せず、理由と必要な新規判断事項を提示して停止する。工程名・工程数・内部配置・現在の実現方式の変更だけを中核放棄と判定しない。外部契約の変更は人間に留保された判断として扱う。

## 正規モデル要素と正規所有 Design の対応（REQ-103-001）

本 Design が位置づける正規モデル要素の詳細契約の正規所有者は次のとおりである。旧設計（v3 個別 Design 群）を前提とせず、この対応導線から正規モデルを一意に再構成できる。

| 正規モデル要素 | 正規所有 Design |
|---|---|
| 目的・三層責務・Project Contract・情報寿命・中核文書モデル・v4 の中核 | 本 Design |
| 判断アーキテクチャ（判断方法・確定権限・人間判断境界・障害時契約） | foundations/v4-responsibility-boundaries.md |
| 公開入口と内部ライフサイクル（語彙・UX・継続ループ） | workflows/v4-standard-lifecycle.md、workflows/v4-collaboration-loop.md |
| ライフサイクル状態機械 | workflows/v4-lifecycle-state-machine.md |
| 品質モデル（Quality/Verification/Evidence/Gate） | quality/v4-quality-gate-model.md |
| durable state と再構成・再実行 | foundations/v4-durable-state-and-recovery.md |
| runtime 実行（authority・直列化・冪等・fail-closed） | foundations/v4-runtime-execution-model.md |
| 成果物モデル（REQ/Decision/Design/Implementation/Evidence の意味境界の運用面） | responsibilities/document-type-responsibilities.md（正規参照。responsibilities/artifact-contracts.md は成果物間の入出力・操作契約の副次参照） |
| Project Extensions と安全境界 | foundations/v4-responsibility-boundaries.md「Project Extensions の semantic extension point」節、foundations/project-extensions.md |
| Intake / Learning / Backlog の責務 | workflows/v4-collaboration-loop.md |
| 移行・release | foundations/v4-migration-and-release.md |
