---
name: agentdev-adversarial-review
description: "対論型レビューの実行入口。Orchestrator、Reviewer、Reviewee の3論理的役割で構成される審議を通じて本質的争点を抽出する。評価前に対象依存の動的レビュー戦略を構成し、対称的相互反証、戦略メタ反証、合意候補形成後の再検証（convergence audit）を行う。USE FOR: 要件案、設計案、規格・仕様案、計画案、実装案の本質的合意形成、動的レビュー戦略の構成、対称的な批判と反論による審議、合意候補の再検証、未解決争点のユーザー質問化。DO NOT USE FOR: QG-1〜QG-4 の代替、通常のコードレビューやテストや機械的検査、inspect-docs/inspect-skills 診断、実装実行やファイル保存やcommitやpushやIssue・PR更新、ユーザー承認代行、強制的統制ゲート、固定観点全実行を前提とするレビュー。"
---

# 対論型レビュー（agentdev-adversarial-review）

本スキルは、Orchestrator、Reviewer、Reviewee の3論理的役割で構成される審議を通じて、本質的争点を抽出し合意を形成する助言プロトコルの実行入口である。
審議結果は判断材料であり、ユーザー承認、実装実行、強制的統制判定のいずれにもならない。

- **参照元**: 呼出元コマンド（default-on + skip policy、REQ-014-013/014）、ユーザー明示的選択
- **特性**: 審議プロトコルの振る舞い契約を実行入口として提供する。実装実行、ファイル編集、外部状態変更は本スキルの対象外

## 原本（SSoT）

本スキルの原本仕様は `docs/specs/skills/agentdev-adversarial-review.md` である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## 発動契約

原則適用・skip 可能な助言手段（対論型レビュー）である（REQ-014-001）。REQ-015 で定義される caller 対象 command では adversarial-review を原則実行し、ユーザー明示指定を通常発動の必須条件としない（default-on、REQ-014-013）。skip 条件は当該経路の正規所有者が明示的かつ判定可能に定義し、skip 判断のためだけに新規 HITL / 承認点を追加せず、skip 対象でもユーザー明示要求時は実行する（REQ-014-014）。
ただし新規必須工程、QG、承認ゲート、統制ゲートとして導入せず、QG-1〜QG-4、既存 HITL を代替せず、新しい恒久統制ゲートとしない（REQ-014-001/002、REQ-014-013）。副作用権限（commit、push、merge、ファイル保存、Issue と PR の作成・更新・コメント、レビュー結果の自動適用、ユーザー承認）を代行しない（REQ-003-035）。発動契約の詳細は SPEC「発動契約」を正とする。

## 審議上の3論理的役割

審議は Orchestrator、Reviewer、Reviewee の3論理的役割で構成する。論理役割は物理エージェント構成を固定しない。

- **Orchestrator**: 審議全体の進行、状態管理、合意候補管理、完了判断を担う。ただし Orchestrator 自身は本質的争点の正解を判断せず、Reviewer と Reviewee の相互反証が収束する状態を確認する。
- **Reviewer**: 対象案を正しいと仮定せず、未発見の破綻条件、欠落、矛盾、不成立な前提、問題のある設計判断、実装方針、トレードオフを探索し反証を試みる。
- **Reviewee**: Reviewer の finding を未検証の主張として扱い、根拠、前提、対象理解、適用範囲、影響、方法論を反証する。

Reviewer と Reviewee の双方が自身の以前の主張を撤回、限定、修正できる。一方に恒常的な正解権限を与えない。

## 対象領域

要件、設計、規格・仕様、計画、実装を標準対象とする。完成済み文書に限定せず、ドラフト、構造化提案、検討中の選択肢を含む。

## 動的レビュー戦略

評価前に対象、目的、制約、技術領域、想定失敗条件に応じたレビュー戦略を構成する。固定された観点集合の全項目実行をレビュー成立条件、完了条件としない。戦略の構成要素（何を疑うか、どの立場から評価するか、どの既存知見・方法論を使うか、何を証拠とするか、どの意味単位へ分解して検証するか）は SPEC「動的レビュー戦略」が所有する。

レビュー戦略自体も未検証の判断として扱い、Reviewer と Reviewee が不足、過剰、誤適用、前提不成立を指摘できる（戦略メタ反証）。審議中に新しい証拠や争点が生じた場合、観点、立場、方法論を追加、削除、再構成できる。

OpenAI/Codex adversarial-review 等の外部知見を観点、問い、failure mode、検証方法を構成する知識源として活用する。実行時の外部サービス・外部リポジトリへの必須依存にせず、必要な知見を ADF 側の配布可能なレビュー知識として保持する。

## 振る舞いプロトコルと合意候補再検証

審議は strategy → challenge → counter-challenge → convergence → convergence audit の状態遷移で進行する。合意候補を形成しただけでは完了とせず、Reviewer と Reviewee が合意候補とその成立根拠を再度対論的に検証する（convergence audit）。再検証で新しい本質的争点が見つかった場合、当該争点について対論を再開する。

初期 challenge は最低2系統の独立した論理 review stream で実施する。各 stream は初期 finding 生成完了前に兄弟 stream の finding を参照しない。対象・目的・制約・確定済み review strategy は共有を許容する。初期 challenge 完了後に finding を統合し、duplicate を整理して counter-challenge / convergence へ進む。独立 stream、finding lifecycle、semantic stagnation 制御の詳細は SPEC「challenge 段階」「finding lifecycle」「審議進展の意味状態判定と semantic stagnation 制御」を正とする。

対称的相互反証、戦略メタ反証、争点状態遷移、finding と正規結果の形式、本質的争点と非本質的批判の判定、自律審議とユーザー質問、サブエージェント利用と重複統合、完了条件、出力契約の詳細手続きは [references/adversarial-review-protocol.md](references/adversarial-review-protocol.md) に置く。

審議状態の物理的保存形式、スキーマ、最大ラウンド数、並列数、タイムアウトは SPEC 所有対象外とし、配布スキル実装へ委譲する。

## 副作用境界と責務分界

本スキルはファイル保存、commit、push、merge、Issue・PR の作成・更新・コメント、レビュー結果の自動適用、ユーザー承認代行を行わない。レビュー結果保存用の新しい正規成果物種別を導入しない。
QG-1〜QG-4 を代替せず、通常のコードレビュー、テスト、機械的検査を代替せず、inspect-docs/inspect-skills の診断を代替しない。すべての要件作成工程、計画作成工程への強制適用を行わない。
詳細は SPEC「副作用境界」「QG、通常レビュー、診断との責務分界」を正とする。

## caller integration 共通契約

本スキルは req-define、req-save、spec-save、case-open、case-run、case-close、case-update の7コマンドおよび case-auto からの呼出（caller integration）に対し、SPEC「adversarial-review caller integration 共通契約」節（REQ-014）が定める共通契約に従う。共通契約の正規所有者は SPEC であり、本 SKILL.md は重複定義しない（REQ-014-003、REQ-014-011）。

呼出元と本スキルの主な契約（詳細は SPEC を正とする）:

| 契約 | 要件 | 概要 |
|---|---|---|
| 原則適用・skip 可能 | REQ-014-001/002 | 必須工程、QG、承認ゲート、統制ゲートとして導入せず、QG-1〜QG-4、既存 HITL を代替しない |
| default-on | REQ-014-013 | REQ-015 caller 対象 command では原則実行し、ユーザー明示指定を通常発動の必須条件としない。QG/HITL 代替、新規恒久統制ゲート化禁止は維持 |
| skip policy | REQ-014-014 | skip 条件は当該経路の正規所有者が明示的かつ判定可能に定義。skip 判断のみの新規 HITL/承認点追加禁止。skip 対象でもユーザー明示要求時は実行 |
| 副作用禁止 | REQ-014-004/005 | ファイル、Issue、PR、git 操作を行わず、レビュー結果用の新規正規 artifact を生成しない |
| accepted finding 反映 | REQ-014-006 | accepted finding の対象候補への反映は呼出元の責務 |
| 再 review 条件 | REQ-014-007 | 対象の意味内容変更時のみ再発動可能、同一 finding の再起票禁止 |
| 再 review 停止条件 | REQ-014-008 | 新 finding なし、全 finding 処理済み、HITL/blocker 移行、意味内容変化なしの4点 |
| unresolved 時の扱い | REQ-014-009 | unresolved 残時は不可逆処理へ進まず、adversarial-review 自体を恒久統制ゲート化しない |
| 呼出失敗時の扱い | REQ-014-010 | silent skip 禁止、利用不能報告後に従来フローと既存 QG/HITL を維持 |

user-decision-required の位置づけ（case-run result enum の第5状態ではなく case-auto の停止理由分類）は workflow-contracts SPEC「adversarial-review 由来の停止信号」節、review 経路での parent_decision_required / decision_context 適用は delegation-contracts SPEC「adversarial-review との委譲契約接続」節をそれぞれ正とする（REQ-014-012）。

## 非対象

本スキルは以下を扱わない:

| 非対象 | 責務主体 |
|--------|----------|
| QG-1〜QG-4 品質ゲート | 各工程のコマンド、`agentdev-quality-gates` |
| 通常のコードレビュー、テスト、機械的検査 | 実装担当、CI |
| inspect-docs/inspect-skills 診断 | `agentdev-doc-diagnostics`、`agentdev-inspect-skills` |
| 実装実行、ファイル編集、commit、push、merge、Issue・PR更新 | case-run、各コマンド |
| ユーザー承認の代行 | ユーザー |

## See Also

- **agentdev-architecture-advisory**: アーキテクチャ助言の整理（req-define 事前確認）
- **agentdev-quality-gates**: QG-1〜QG-4 品質ゲート基準
- **agentdev-doc-diagnostics**: 証拠付き finding の診断
- **agentdev-skill-authoring**: スキル設計とレビュー規約
- **SPEC `docs/specs/skills/agentdev-adversarial-review.md`**: 振る舞い契約の正典
- **references/adversarial-review-protocol.md**: 審議プロトコルの詳細手続き
