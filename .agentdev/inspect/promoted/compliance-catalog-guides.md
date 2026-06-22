---
title: docs/guides/ 規範逸脱カタログ
topic: guides-compliance-catalog
source_issue: "#1045"
parent_epic: "#1037"
status: draft
created: 2026-06-23
review_norms:
  - japanese-tech-writing（全規範: 整形・段落と論証の構成・論証の厳密さ・読み手の負荷の管理・視点と語り・演出の抑制・LLM 表現禁止・冗長の排除・見出しの付け方・読者への誠実さ）
  - docs/specs/document-type-responsibilities.md（配置基準・用語政策）
---

# docs/guides/ 規範逸脱カタログ

## 概要

`docs/guides/` 配下 11 ファイルに対する japanese-tech-writing（**全規範適用**: guides/README は全規範対象）および document-type-responsibilities.md（配置基準・用語政策）の逸脱を抽出したカタログ。個別修正は後続 Issue で扱う（本カタログは見える化が目的）。遡及準拠の範囲は REQ-0140-026 に基づく。

guides/ は全規範適用のため、整形・LLM 表現禁止だけでなく段落構成・視点と語り・演出抑制・読者への誠実さも査読対象となる。

## 対象範囲

11 ファイル。

| ファイル | 内容 |
|---|---|
| `README.md` | ガイド入口・参照先一覧 |
| `quickstart.md` | 機能追加の最小フロー |
| `command-selection.md` | コマンド選択表 |
| `req-case-flow.md` | 要件定義 → Case実行フロー |
| `intake-learning-backlog-flow.md` | Intake/Learning/Backlog フロー |
| `diagnostics-and-maintenance.md` | 診断・メンテナンス |
| `artifacts-and-state.md` | 成果物・状態モデル |
| `project-docs-and-specs.md` | プロジェクトドキュメントと SPEC |
| `consumer-project-setup.md` | Consumer Project 導入 |
| `troubleshooting.md` | トラブルシューティング |
| `glossary.md` | 用語集 |

## 適用サブセット

guides/README は japanese-tech-writing **全規範**を適用（非適用なし）。

## 検出事項

### F-001（med）: 空虚な動詞「決定する」「解決する」「適用する」（パターン）

- **対象**: `req-case-flow.md` L23 / `project-docs-and-specs.md` L82 / `artifacts-and-state.md` L149
- **該当規範**: LLM 表現禁止（空虚な動詞）
- **現状**:
  - `req-case-flow.md` L23: 「操作分類（CREATE / APPEND / UPDATE）を**決定する**」
  - `project-docs-and-specs.md` L82: 「文書間で矛盾があった場合、以下の順位で**解決する**」
  - `artifacts-and-state.md` L149: 「以下の制約を AgentDevFlow の状態モデルに**適用する**」
- **改善方向**: 何をどうするかを具体的に書く。
  - 「操作分類を判定する」「操作分類（CREATE/APPEND/UPDATE）のいずれかを選ぶ」
  - 「矛盾は以下の優先順位で解釈する」
  - 「AgentDevFlow の状態モデルは以下の制約に従う」

### F-002（med）: 「注意」「案内層」等のラベル前置き（パターン）

- **対象**: `consumer-project-setup.md` L133, L231 / `artifacts-and-state.md` L145 / `README.md` L5
- **該当規範**: 演出の抑制（「重要なのは〜」のような前置きで主張を予告しない）・LLM 表現禁止（予告と総括）
- **現状**:
  - `consumer-project-setup.md` L133: `> **注意**: agentdev-integrity（旧 integrity skill）は AgentDevFlow 配布対象外となった（ADR-0106）。`
  - `consumer-project-setup.md` L231: `**注意**: .agentdev/ は gitignore に**含めない**こと。`
  - `artifacts-and-state.md` L145: `> **注意**: 6 マイクロフェーズは説明用ラベルであり…`
  - `README.md` L5: `> **案内層**: ガイドは人間向けの案内・探索支援を目的とする…`
- **改善方向**: 「注意」「案内層」等のラベルを外し、事実をそのまま述べる。強調（**...**）も論理の要所以外は削る。
  - 例: `agentdev-integrity（旧 integrity skill）は AgentDevFlow 配布対象外となった（ADR-0106）。`
  - 例: `.agentdev/` は gitignore に含めないこと（ドメイン状態を保持するため）。

### F-003（med）: アクター不明の記述（パターン）

- **対象**: `intake-learning-backlog-flow.md` L28, L107 / `artifacts-and-state.md` L35 / `project-docs-and-specs.md` L51
- **該当規範**: 視点と語り（対象を指す語は具体的に選ぶ）
- **現状**:
  - `intake-learning-backlog-flow.md` L28: 「具体的な作業候補・不整合・未回収課題の収集・レビュー・採用判断を**行う**」（誰が？）
  - `intake-learning-backlog-flow.md` L107: 「チャット内でユーザーと合意形成済みの内容は、セッション由来 RU として直接 `.agentdev/backlog/req-units/` に保存できる」（「チャット内でユーザーと」が不自然な設定）
  - `artifacts-and-state.md` L35: 「Command は判定ロジックを Skill の参照先に**委ねる**。Skill は Command の Step 番号やファイルパスは Command 側で**管理する**。」
  - `project-docs-and-specs.md` L51: 「実装者が参照する現在のシステム仕様」（「実装者」が誰か不明）
- **改善方向**: 行為者を主語にした動作の連なりで書く。役割名（開発者・利用者・コマンド実行環境）を明示する。

### F-004（med）: 複数概念を 1 文に詰め込み（読み手負荷）

- **対象**: `req-case-flow.md` L111 / `diagnostics-and-maintenance.md` L17 / `glossary.md` L20
- **該当規範**: 読み手の負荷の管理（抽象的な言い回しの指す内容が文脈から一意に決まらないときは同格挿入で特定する）
- **現状**:
  - `req-case-flow.md` L111: 「Issue の work_type は参考情報であり、パイプライン分岐（`/agentdev/req-save` の要否）は `work_type` 固定分岐ではなく req_draft の `artifact_actions` 存在で動的判定する（REQ-0138-009, ADR-0124）。docs 更新責務は全 work_type 共通である（bugfix も含む。REQ-0104-034）。」（1 文に work_typeの扱い・分岐ロジック・docs 責務の 3 概念）
  - `diagnostics-and-maintenance.md` L17: 「REQ/ADR/Skill/Command/Template/Workflow/Link/Canonical/Lifecycle/Namespace/ImplementationPattern 等の検査集合をスキャンする。」（スラッシュ区切りで 11 語並列）
  - `glossary.md` L20: docs-check 行（1 セルに定義・旧称・配置・参照 ADR/REQ が混在）
- **改善方向**: 概念ごとに別行に分割する。スラッシュ区切りの長い並列は箇条書きまたは別表に展開する。

### F-005（med）: 中黒（・）による日本語並列（パターン）

- **対象**: `consumer-project-setup.md` L127-131 / `glossary.md` L29 他（広範）
- **該当規範**: 整形（中黒を日本語の並列で使わない）
- **現状例**:
  - `consumer-project-setup.md` L127-131: リスト項目内で「`agentdev` 名前空間の使用」「AgentDevFlow 提供ファイルの直接編集」等の並列に中黒混在
  - `glossary.md` L29: ADR 行の説明文で中黒使用
- **改善方向**: 日本語並列には読点または箇条書きを使用する。リポジトリ全体方針として横断 Issue で扱うことを推奨。

### F-006（med）: 接続の型「〜には〜がある」「〜を参照」（パターン）

- **対象**: `intake-learning-backlog-flow.md` L7 / `command-selection.md` L42-44
- **該当規範**: LLM 表現禁止（接続の型）
- **現状**:
  - `intake-learning-backlog-flow.md` L7: 「AgentDevFlow **には**、課題を収集して要件化につなげる3段階のパイプライン**がある**。」
  - `command-selection.md` L42-44: 「Intake / Learning パイプラインの詳細は [Intake / Learning / Backlog フロー](intake-learning-backlog-flow.md) **を参照**」「各コマンドの入出力の詳細は [要件定義 → Case実行フロー](req-case-flow.md) **を参照**」（「〜を参照」連打）
- **改善方向**: 「には〜がある」型は直接内容を書く。「〜を参照」の連打は前置きを削って関連リンクとして扱うか、文末にまとめる。

### F-007（low）: 冗長表現「本ファイルを含む」「に関連する」

- **対象**: `project-docs-and-specs.md` L78 / `glossary.md` L82
- **該当規範**: 冗長の排除
- **現状**:
  - `project-docs-and-specs.md` L78: 「**本ファイルを含む** `docs/guides/` は人間向けの案内層である」
  - `glossary.md` L82: 「**に関連する** 用語。」
- **改善方向**: 冗長部を削る。「`docs/guides/` は人間向けの案内層である」「用語。」等。

### F-008（low）: 手順専用の抽象見出し

- **対象**: `troubleshooting.md` L5 「コマンド実行関連」
- **該当規範**: 見出しの付け方（作業の手順だけを述べる見出し・情報量のない見出しにしない）
- **現状**: 「## コマンド実行関連」は分類名のみで、その節が答える問い・扱う対象が見出し時点で分からない。
- **改善方向**: 具体的な対象を盛り込む。「コマンド実行時のトラブルと対処」「コマンドが認識されない・実行できない場合」等。

### F-009（low）: 1 行複数文（README 概要行）

- **対象**: `README.md` L3 / `quickstart.md` L3 / `artifacts-and-state.md` L3 他（多数のガイド先頭行）
- **該当規範**: 整形（一文一行）
- **現状例**:
  - `README.md` L3: 「利用者向けの参照用読み物（案内層）。基準は各 REQ/ADR/SPEC ファイルであり、ガイドは基準への導線を提供する。基準文書と矛盾する記述がある場合は基準を優先する。」（3 文が 1 行）
  - `quickstart.md` L3: 「機能追加の最小フロー。5コマンドで要件定義からマージまで完了する。」（2 文が 1 行）
- **改善方向**: 文ごとに改行する。ガイド先頭のリード文は特に読者が注目するため、1 文 1 行を厳格に適用する。

### F-010（low）: 不完全文・省略された述語

- **対象**: `glossary.md` L3 / `command-selection.md` L3
- **該当規範**: 整形（一文一行）・読者への誠実さ
- **現状**:
  - `glossary.md` L3: 「AgentDevFlow で使う用語の定義。」（述語がない）
  - `command-selection.md` L3: 「現在の状態から、次に実行すべきコマンドを選ぶための入口表。」（体言止め・述語がない）
- **改善方向**: 述語を補って完結した文にする。「AgentDevFlow で使う用語を定義する。」「現在の状態から次に実行すべきコマンドを選ぶための入口表である。」

### F-011（info）: ガイド全体の規範準拠度（参考記録）

- **対象**: 11 ファイル全体
- **該当規範**: （参考記録・逸脱ではない）
- **現状**: guides/ はナビゲーション層として整理されており、REQ/ADR/SPEC との矛盾や重複は限定的。主要な逸脱は表現スタイル（F-001〜F-010）に集中し、論証構造や情報の正確性に顕著な問題はない。
- **改善方向**: （対応不要。検出事項の見える化が目的なため準拠状況も記録する）

## 対象外

- ガイド内容と REQ/ADR/SPEC の意味レベル整合性（内容の正確性・過情報・不足）は inspect-docs 等で扱う。
- ガイド間のリンク切れ・参照先不存在は inspect-skills/docs-check で扱う。
- ガイド内で言及されるコマンド名・スキル名の正しさは inspect-skills で扱う。

## 後続 route 候補

- F-001, F-002, F-006（LLM 表現系）: まとめて 1 Issue で「docs/guides/ LLM 表現禁止・演出抑制の整形」として扱う。
- F-003, F-004（視点と語り・読み手負荷）: 1 Issue で「docs/guides/ アクター明示・概念分割」として扱う。
- F-005（中黒）: リポジトリ全体の中黒使用方針と合わせて横断 Issue で扱うことを推奨（src/opencode-local/・src/opencode/commands/・docs/adr/ のカタログでも共通出現）。
- F-007〜F-010（軽微整形）: 1 Issue にまとめて対応可能。
