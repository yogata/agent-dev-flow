---
status: accepted
---

# 成果物責任表

各成果物種別の原本所有者（`canonical owner`）と責務を定義する（REQ-0103-057）。

## 成果物責任表

| 成果物 | Canonical Owner | Source Location | Runtime Location | 責務 |
|----------|----------------|-----------------|------------------|------|
| Command 定義 | `src/opencode/commands/agentdev/` | 原本優先 | `.opencode/commands/agentdev/` | ユーザー向け入口、入出力、ガードレール、高レベル Steps |
| Skill 定義 | `src/opencode/skills/` | 原本優先 | `.opencode/skills/` | 再利用可能な判断基準、ドメイン知識 |
| Skill References | `src/opencode/skills/*/references/` | 原本優先 | `.opencode/skills/*/references/` | 段階的開示（progressive disclosure）の詳細 |
| Skill Scripts | `src/opencode/skills/*/scripts/` | 原本優先 | `.opencode/skills/*/scripts/` | 決定的でテスト可能な実行ロジック |
| Command Template | `src/opencode/commands/agentdev/templates/` | 原本優先 | `.opencode/commands/agentdev/templates/` | 完了報告の出力構造。Issue/PR 本文の出力構造は `agentdev-workflow-templates` skill 配下（artifact-contracts.md 参照） |
| Skill Template | `src/opencode/skills/*/templates/` | 原本優先 | `.opencode/skills/*/templates/` | ドキュメント生成テンプレート |
| REQ | `docs/requirements/REQ-*.md` | - | - | 要件定義（基準） |
| ADR | `docs/adr/ADR-*.md` | - | - | アーキテクチャ決定記録（基準） |
| SPEC | `docs/specs/**/*.md` | - | - | 現在仕様（リポジトリ内部）。commands/skills/workflows の3層と基盤6ドメイン（foundations/responsibilities/quality/integrity/local/authoring）で構成 |
| DOC-MAP | `docs/DOC-MAP.md` | - | - | 文書探索入口（非基準） |
| Guide | `docs/guides/*.md` | - | - | 参照用読み物（ナビゲーション層） |
| ドメイン状態 | `.agentdev/` | - | - | Intake / Learning / Backlog / Integrity 永続状態 |
| リポジトリローカル Command | `.opencode/commands/repo/` | - | - | 本体リポジトリ専用コマンド（ADR-0106）。AgentDevFlow 配布対象外。原本、配置先同期対象外 |
| リポジトリローカル Skill | `.opencode/skills/repo-*/` | - | - | 本体リポジトリ専用スキル（ADR-0106）。AgentDevFlow 配布対象外。原本、配置先同期対象外 |
| リポジトリローカルレジストリ | `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` | - | - | リポジトリローカル語彙レジストリ。`.agentdev/` には配置しない（ADR-0106） |

## 責務境界原則

1. **Command は薄い**: 入口、入出力、ガードレール、高レベル Steps のみ（REQ-0103-001）
2. **Skill は再利用可能**: 共通判断基準、ドメイン知識（REQ-0103-003）
3. **Template は構造のみ**: 出力フォーマット、プレースホルダー（REQ-0103-005）
4. **Script は決定的**: テスト可能、再現可能（REQ-0103-006）
5. **原本優先（Source first）**: 原本（`canonical source`）は `src/opencode/`、実行時は `.opencode/` 配置先（`projection`）（ADR-0105）

## 親エージェント / サブエージェント責務

サブエージェント委譲時の責務境界は ADR-0112 と REQ-0119 に従う。

| 主体 | 保持する責務 | 禁止される責務 |
|---|---|---|
| 親エージェント | 次 Step へ進む判断、保存、Issue / PR 更新、commit、push、ユーザー確認、完了報告、capture 候補の保存判断 | サブエージェントの判定を自動的に最終判断として扱うこと |
| サブエージェント | 探索、検査、分類、候補抽出、ログ解析、意味レビュー、草案生成、`pass` / `warn` / `fail` / `partial` 形式の判定返却 | 保存、Issue / PR 更新、commit、push、ユーザー確認、capture 候補の直接保存 |

サブエージェントは副作用なしを返却に明示する。
成果物本文がある場合はそのまま（verbatim）返し、判定結果、調査過程、中間ログ、読解メモは要約、根拠、親判断事項、capture 候補へ圧縮して返す。

## SKILL ↔ command 同一ルール重複許容基準（REQ-0147-001）

SKILL と command の間で同一ルールを両方に記載することが正当な場合の許容条件:

- 両方の利用者が独立して参照する場合（command 実行者と skill 参照者が異なる文脈で同じルールを必要とする）
- 片方の削除でもう片方が参照不能になる場合（skill が command からのみ参照され、command 側の記載削除で skill 利用者がルールを見失う等）

### 一方向参照への切替基準

以下のいずれかに該当する場合、重複を解消し一方向参照へ切替える:

- 一方の利用者が他方を必ず経由する（参照経路が一意に定まる）
- ルールが一方の責務領域に明確に属する（他方は参照のみ）

切替時は正の情報源（canonical source）を明示し、参照先には「<canonical> を参照」と記載する。

### 重複許容時の同期ルール

重複を許容する場合、両者の内容同期を維持する:

- 正の情報源を一方に固定し、他方は「<canonical> に準拠（重複掲載の理由: <許容条件>）」と明記
- 正の情報源の変更時は同期側の更新を必須項目として扱う（docs-check / inspect-skills で追跡）

## 重複許容基準（REQ-0147-001）適用例集

本セクションは REQ-0147-001（SPEC 重複許容基準）の具体的適用事例を蓄積し、
REQ-0119-034（同一契約再定義抑止）との両立関係を運用面で明確にする。

### 適用パターン1: project extensions boilerplate

15 の agentdev command で同一4行の extension 宣言（project extensions boilerplate）が
重複定義される場合、下記の分離フローを適用する。

#### 公開契約宣言 vs 詳細契約 の分離フロー

1. boilerplate 行を「公開契約宣言」（command 公開契約の宣言部分）と「詳細契約」
   （extension の context/rules/checks 等の中身）に分離する
2. 公開契約宣言は配布 command 本文に直接記載を許容する（上限: 宣言4行まで）
3. 詳細契約は skill 参照（agentdev-project-extensions SKILL 等）に集約し、
   command 本文には公開契約宣言のみを残す
4. 公開契約宣言の範囲を超える重複は REQ-0119-034 違反として扱う

### 適用パターン2: inspect-skills references 重複

複数 SKILL で同一の references 内容（検査手順等）が重複する場合、下記条件を全て満たす
とき REQ-0147-001 の重複許容基準に該当する:

1. 重複する references が複数 SKILL の共通基盤（検査方法論等）であること
2. 各 SKILL 固有の判断基準が明確に分離されていること
3. references の内容が SPEC 本文への参照に縮約可能であること

条件を満たす場合、references 側は SPEC 本文への参照に縮約し、重複を許容する。

## 予約名（Reserved Names）

| 名前 | 種別 | 予約先 |
|------|------|--------|
| `agentdev` | コマンド体系 | AgentDevFlow 本体 |
| `agentdev-*` | Skill プレフィックス | AgentDevFlow 本体 |
| `.agentdev/` | ドメイン状態ディレクトリ | AgentDevFlow 永続状態 |
