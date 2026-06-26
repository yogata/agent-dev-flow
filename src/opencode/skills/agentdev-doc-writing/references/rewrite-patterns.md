# 英語抽象語の検出→書き換えパターン

> **原本**: 英語抽象語（`read-only`、`advisor`、`architecture-affecting` 等）の分解ルールは本ファイルが原本。
> 一般的な執筆規範（LLM っぽい表現の禁止、空虚な形容、空虚な動詞等）は `japanese-tech-writing` スキル（AGENTS.md 経由）、用語政策（英字許容リスト、訳語表）は [docs/specs/responsibilities/document-type-responsibilities.md](../../../../../docs/specs/responsibilities/document-type-responsibilities.md) を参照。

## 適用除外

以下は検出対象外とする。

1. ユーザー発言の引用
2. 既存文書の引用
3. 禁止表現そのものの批評、説明
4. 法務、契約、監査上の断定回避が必要な場合

---

## 1. 文意修正ルール（read-only、advisor、architecture-affecting 系）

**Severity**: High

**Detection pattern**: docs/ command/ skill 記述中に `read-only`、`advisor`、`advisory`、`architecture-affecting`、`Architecture advisory gate` 等の英語混じり抽象語が、文脈定義なしで残留している。
これらの語は単独では「何を変更せず何を許可するか」「誰が判断するか」が特定できず、読者、実装者、検査者が解釈を分岐させる。

**Why problematic**: 英語抽象語の機械的残置は文意を不明にする。
`read-only` を「読み取り専用」と一律置換すると、実際には finding を生成し commit/push を行う診断コマンドの副作用境界が隠蔽される。
`advisor` は誰が最終判断するかを曖昧にする。
`architecture-affecting` は ADR 要否の判断主体を欠かせる（012, 013）。

**Rewrite rule**: 英語抽象語を検出した場合、文脈に応じて具体的な操作、責務、判断条件へ分解する。
単なる語彙の置換ではなく、検出→書き換えのルールとして適用する。

### 変換テーブル

| 検出表現 | 書き換え方針 | 具体的な書き換え先（文脈別） |
|---|---|---|
| `read-only`（コマンド、委譲記述） | 文脈別分解。一律「読み取り専用」にしない | (a) 入力ファイル参照のみ: 「参照専用入力」 (b) 検査対象を変更しない: 「対象を直接修正しない診断」 (c) 保存、更新を親に残す: 「保存、更新を親コマンドに残す委譲」 (d) 検出を報告するのみ: 「検出報告型」 |
| `read-only`（コマンドが実際に commit/push、出力生成を行う） | read-only 表記を撤回し、許可出力と禁止操作を明記 | 許可: finding file 生成、report 出力、`commit`/`push`（限定範囲）、intake item 生成。禁止: 検査対象ファイル変更、許可範囲外 commit/push、Issue/PR 更新 |
| `advisor`/ `advisory` | 責務記述へ分解 | 「誰が最終判断するか」「何を返すか（推奨、根拠、判断材料）」を明記。例: 「アーキテクチャ助言を返し、最終判断は親コマンドが行う」 |
| `architecture-affecting`/ アーキテクチャに影響する | 「ADR判断が必要な変更」または「ADR要否確認が必要な変更」 | 「アーキテクチャに影響する」のみで使用しない |
| `Architecture advisory gate` | 「ADR要否確認ゲート」 | gate が ADR 要否を確認し、必要なら ADR 作成を親コマンドへ要求する |
| `side_effect_boundary: read_only`（委譲定義 YAML） | 包括値 `read_only` を廃止し、具体的許可操作を列挙 | `read_files`, `inspect_content`, `classify_candidates`, `return_summary`, `return_evidence`, `return_artifact_body_when_requested` |
| 識別子初出（`gate_check`, `delegation_type` 等） | 初出に日本語注記を付与 | 例: `gate_check`（完了判定、ガードレール充足確認のための検査） |

### 英語混じり表現検出時の 6 確認

docs 記述中に英語抽象語を検出した場合、以下の 6 項目を順に確認し、書き換え要否を判定する。

1. **識別子か説明語か**（その英語語は固定識別子（YAML key、enum 値、delegation_type ラベル等）か、それとも説明語か。）
固定識別子の場合は原語を維持し、初出に日本語注記を付与する。

2. **自然な日本語にできるか**（説明語の場合、文脈に合う自然な日本語に置換できるか。）
できる場合は置換する。

3. **識別子の近傍に日本語があるか**（識別子の場合、近傍（同段落または初出位置）にその識別子の役割を示す日本語注記があるか。）
なければ付与する。

4. **`read-only` の場合: 何を変更せず、何を読み取り、何を生成し、commit/push は可否か**（一律「読み取り専用」にせず、文脈別（参照専用入力、診断、委譲、検出報告型）に分解する。）
実際に commit/push、出力生成を行う場合は read-only 表記を撤回し、許可出力、禁止操作を明記する（005, 008）。

5. **`advisor` の場合: 誰が判断し、何を返すか**（助言、推奨を返す主体と、最終判断を行う主体（多くは親コマンド）を分離して記述する。）

6. **`architecture-affecting` の場合: ADR 要否確認に還元できるか**（「ADR判断が必要な変更」または「ADR要否確認が必要な変更」に書き換え、判断主体、根拠、最終判断の責務を明示する（013）。）

**Before**:
> inspect-skills は read-only 診断コマンドである。

**After**:
> inspect-skills は検査対象（Command/Skill 定義ファイル）を直接修正しない診断コマンドである。
> 許可される副作用は `.agentdev/inspect/inbox/inspect-skills-finding-*.md` の生成と、`.agentdev/inspect/` 配下の git 永続化（commit/ push）のみ。
> 最終判断（promote/ defer/ reject）は inspect-promote が行う。

**Before**:
> アーキテクチャに影響する変更は advisor が確認する。

**After**:
> ADR判断が必要な変更（アーキテクチャ判断を要する変更）については、アーキテクチャ助言エージェントが ADR 要否、推奨方向、設計リスク、根拠を返し、最終的な ADR 作成判断は親コマンド（req-define）が行う（ADR要否確認ゲート）。

**Allowed exceptions**: 適用除外1〜4。
固定識別子（YAML key、enum 値、Conventional Commits type、外部仕様名）として原語を維持する場合は、初出に日本語注記を付与すれば許容される。

---

## 用語政策の参照先

英字許容リスト、訳語表（修飾語の日本語化、複合技術語の訳し方、専門カタカナ語、略語の扱い等）は [docs/specs/responsibilities/document-type-responsibilities.md](../../../../../docs/specs/responsibilities/document-type-responsibilities.md)「用語政策」節を SSoT とする。
本ファイルは重複記述しない。
