# Draft: OpenCode Source/Projection Epic — 6-RU Package

## draft-meta

- pattern: feature
- scale: large (Epic)
- work_type: feature (B)
- adr-required: YES → ADR-0019 (minimal: source/projection separation only)
- topic-slug: opencode-source-projection-epic
- status: saved
- input-ru: RU-0033, RU-0034, RU-0035, RU-0036, RU-0037, RU-0038

### REQ Operation Map (Confirmed)

| RU | Target REQ(s) | Operation | Focus |
|---|---|---|---|
| 0033 | REQ-0103 | UPDATE/APPEND | source/projection layout概念・sync・migration |
| 0034 | REQ-0101, 0103, 0108, 0109, 0113, 0114 | 分散UPDATE | source/projection語義追従 |
| 0035 | REQ-0108 | UPDATE/APPEND | audit/baseline/drift・finding分類拡張 |
| 0036 | REQ-0108 | APPEND | continuous integrity基盤・rule catalog・3層gate |
| 0037 | REQ-0103 + SPEC新設 | UPDATE/APPEND | SSOT化・registry化・artifact責務表 |
| 0038 | REQ-0103 + SPEC/Guide新設 | UPDATE/APPEND | consumer導入モデル・repo type・runtime境界 |

---

## 壁打ち結論サマリ

- **背景**: AgentDevFlowのcommand/skill/template sourceが.opencode/直下にあり、source codeとruntime projectionが混在している
- **目標**: sourceをsrc/opencode/に分離し、.opencode/をruntime projection化する。併せてintegrity基盤の強化、SSOT化、consumer導入モデルを確立する
- **要件数**: UPDATE 4件 + APPEND 23件（REQ-0103: 18件, REQ-0108: 10件, 分散: 5件）+ ADR 1件 + SPEC/Guide新設 7件
- **主要な判断**:
  - RU:REQ ≠ 1:1。既存REQへ統合（APPEND-first）
  - REQ-0108の18 collection固定列挙 → registry/named collection参照化
  - ADR-0019はsource/projection分離決定のみ（最小scope）

---

## A. REQ-0103 UPDATE/APPEND

### 目的

AgentDevFlowのcommand/skill/template配置をsource（src/opencode/）とruntime projection（.opencode/）に分離する要件、およびSSOT化・consumer導入モデルに伴うartifact責務拡張を定義する。

### UPDATE要項

| ID | 変更内容 |
|---|---|
| REQ-0103-007 | command配置pathの表記を更新。sourceは`src/opencode/commands/agentdev/`に配置すること（SHALL）。`.opencode/commands/agentdev/`はruntime projectionであることを明記 |
| REQ-0103-008 | skill配置pathの表記を更新。sourceは`src/opencode/skills/`に配置すること（SHALL）。`.opencode/skills/`はruntime projectionであることを明記 |
| REQ-0103-005 | template配置pathの表記を更新。template sourceの配置先にsource/projection区別を追加 |

### APPEND要項

#### RU-0033: Source/Projection Layout

| ID | 要件 |
|---|---|
| REQ-0103-048 | AgentDevFlow本体のcommand/skill/template sourceのcanonical locationは`src/opencode/`であること（SHALL） |
| REQ-0103-049 | `.opencode/`はruntime projectionであること（SHALL）。本体repoではself-hosting projectionとして機能する |
| REQ-0103-050 | source→projection同期スクリプト（sync script）が存在すること（SHALL） |
| REQ-0103-051 | sync scriptはdry-run / check / applyの3モードを持つこと（SHALL）。dry-runは変更を予測のみ。checkはdivergenceを検出。applyは同期を実行 |
| REQ-0103-052 | sync scriptはsourceとprojectionのdivergenceを検出・報告できること（SHALL） |
| REQ-0103-053 | 初回移行用migration scriptがone-time実行可能であること（SHALL） |
| REQ-0103-054 | migration scriptは移行完了後に削除可能であること（SHOULD） |
| REQ-0103-055 | stale symlink / broken symlink / projection target不整合を検出できること（SHALL） |
| REQ-0103-056 | `agentdev` command namespaceおよび`agentdev-*` skill prefixはAgentDevFlow本体用の予約名であること（SHALL）。project-local customizationでこれらの名前を使用してはならない |

#### RU-0037: SSOT化・責務境界・Registry化

| ID | 要件 |
|---|---|
| REQ-0103-057 | 各artifact種別のcanonical ownerを定義したartifact responsibility tableが存在すること（SHALL） |
| REQ-0103-058 | rule domainと責任REQ/SPECの対応を示すrule ownership matrixが存在すること（SHALL）。12以上のrule domainを_cover_すること |
| REQ-0103-059 | command/skill/template inventoriesは手動維持ではなく、生成ベース（registry/generated）であること（SHALL） |
| REQ-0103-060 | 複数artifactにまたがる重複rule textは、要約＋canonicalへの参照に削減すること（SHOULD） |

#### RU-0038: Consumer導入モデル

| ID | 要件 |
|---|---|
| REQ-0103-061 | 4種のrepo type（self-hosting / consumer-with-agentdev / consumer-local / plugin-future）が定義されていること（SHALL） |
| REQ-0103-062 | `.opencode/`の意味がrepo typeにより異なること（SHALL）。self-hostingではprojection、consumerではproject-local customization入口 |
| REQ-0103-063 | AgentDevFlow予約名との衝突を防ぐproject-local naming rulesが定義されていること（SHALL） |
| REQ-0103-064 | symlink-based installationを支持すること（SHALL）。copy-based installationは非推奨とすること（SHOULD）。plugin/npm/package化は将来optionとして扱い、現在の要件には含めない |
| REQ-0103-065 | sync scriptの適用範囲がrepo typeごとに定義されていること（SHALL） |

### 適用範囲

- **対象**: source/projection分離、sync/migration script、namespace予約、SSOT化、registry化、consumer導入モデルの要件定義
- **対象外**: 実装コード、npm/plugin package化、CI/CD統合、docs内容の具体的書き換え（→RU-0034）

---

## B. REQ-0108 UPDATE/APPEND

### 目的

integrity検査のartifact collection参照をregistry化し、source/projection区別に対応する。併せてaudit/baseline（RU-0035）と継続的integrity基盤（RU-0036）の要件を追加する。

### UPDATE要項

| ID | 変更内容 |
|---|---|
| REQ-0108-001 | 固定の18 artifact collection列挙から、artifact collection registry / named collection list参照に変更する（SHALL）。個別のpath列挙はregistryに委ねる |

### APPEND要項

#### RU-0035: Integrity Audit / Baseline / Drift是正

| ID | 要件 |
|---|---|
| REQ-0108-143 | integrity検査はsource scan（`src/opencode/**`を正とする）とprojection scan（`.opencode/**`をruntime入口とする）を分けて実行すること（SHALL） |
| REQ-0108-144 | stale symlink / wrong target / source-projection混同をintegrity findingとして報告すること（SHALL） |
| REQ-0108-145 | baseline-known findingとnew findingを区別できること（SHALL）。baselineは既知の許容済みfinding集合であり、新規findingは別途triage対象とする |
| REQ-0108-146 | active REQ自体をintegrity対象に含めること（SHALL）。REQ内部の整合性（相互参照、path存在、ID一意性）を検証する |
| REQ-0108-147 | integrity関連artifact（scripts / tests / fixtures / SKILL.md / SPEC）もvalidator drift対象であること（SHALL）。integrity tool自体の陳腐化を検出する |
| REQ-0108-148 | finding分類に以下を追加すること（SHALL）: historical occurrence（過去発生）/ negative fixture（期待されない誤検知の記録）/ false positive（誤検知）/ current violation（現在不適合） |
| REQ-0108-149 | REQ-first verification: active REQの内部整合性をderivative（SPEC / command / skill）auditより先に検証すること（SHALL） |

#### RU-0036: 継続的Integrity運用基盤

| ID | 要件 |
|---|---|
| REQ-0108-150 | integrity rule catalogが存在し、各ruleが15以上のfield（rule ID / description / severity / detection method / affected artifacts / related REQ 等）を持つこと（SHALL） |
| REQ-0108-151 | integrity rule catalogに20以上の初期ruleが含まれること（SHALL） |
| REQ-0108-152 | 各ruleが影響するREQを記載したREQ impact mapが存在すること（SHALL）。10以上のactive REQを_cover_すること |
| REQ-0108-153 | 検査層を3層に分けること（SHALL）: full audit（全rule実行）/ delta guard（変更関連ruleのみ実行）/ impact guard（影響範囲ruleのみ実行） |
| REQ-0108-154 | integrity関連artifact変更時にmeta-integrity guardを実行すること（SHALL）。rule catalog / baseline / impact map自身の整合性を検証する |
| REQ-0108-155 | 再発findingをrule / detector / impact map / exceptionの更新に接続すること（SHALL）。再発を単なる重複として扱わず、改善ループに組み込む |

### 適用範囲

- **対象**: artifact collection registry化、source/projection scan分離、baseline管理、finding分類拡張、rule catalog、REQ impact map、3層gate、meta-integrity、再発triage
- **対象外**: rule catalogの個別rule内容（→SPEC）、migration script（→REQ-0103）、consumer model（→REQ-0103）

---

## C. 分散UPDATE (RU-0034: docs追従)

source/projection語義の追従。以下のREQの該当箇所に、`.opencode/`がruntime projectionである旨の注記を追加する。**既存の要件意図は変更しない**。path参照にsource/projection区別が必要な箇所のみ。

| Target REQ | 対象ID | 変更内容 |
|---|---|---|
| REQ-0109 | REQ-0109-014 | `.opencode/`参照に「runtime projection; sourceはsrc/opencode/」の注記を追加 |
| REQ-0113 | （skill path全般） | skill path参照箇所にsource/projection区別を追加（SPEC分離scopeの明確化） |
| REQ-0114 | REQ-0114-001 | `.opencode/commands/agentdev/case-auto.md`参照にsource/projection区別を追加 |
| REQ-0114 | REQ-0114-022 | `.opencode/commands/agentdev/` path参照にsource/projection区別を追加 |

**注記**: REQ-0101, REQ-0104, REQ-0108, REQ-0112は`.opencode/`の直接path参照がない、または既にREQ-0103/0108 UPDATEで対処されるため、分散UPDATEの個別対象外。

---

## D. ADR-0019: OpenCode Source / Projection 分離

```markdown
# ADR-0019: OpenCode Source / Projection 分離

## Status: Accepted

## Context

AgentDevFlowのcommand/skill/template sourceが.opencode/直下に存在し、
source code（編集対象）とruntime projection（実行対象）が同一directoryに混在している。
これにより以下の問題がある:
- source変更の影響範囲が不明確
- consumer projectへの配布方法が定義できない
- integrity検査の対象がsourceとprojectionで区別できない

## Decision

1. AgentDevFlow本体のcommand/skill/template sourceをsrc/opencode/に配置する
2. 本体repoの.opencode/はself-hosting projectionとする
3. .opencode/は廃止しない（runtime入口として維持）
4. agentdev command namespaceおよびagentdev-* skill prefixを本体用予約名とする
5. 初回移行はmigration scriptで実行し、日常同期はsync scriptで実行する。
   両scriptの責務を分ける（migrationはone-time、syncは継続的）

## Consequences

### Positive
- source変更はsrc/opencode/で行い、.opencode/はprojectionとして自動同期される
- consumer projectでは.opencode/がproject-local customization入口として機能する
- integrity検査がsourceとprojectionを区別できる

### Negative
- symlinkが利用できない環境ではcopy-based projectionにfallbackが必要
- 開発workflowにsync手順が追加される
- 既存のpath参照を含むdocsの更新が必要

### Risks
- Windows環境でのsymlink動作（管理者権限/Developer Mode要件）
- migration実行時の一時的な環境不整合
```

---

## E. SPEC / Guide 新設候補

### 新設SPEC

| 候補path | 来源RU | 内容 |
|---|---|---|
| `docs/specs/integrity-rule-catalog.md` | 0036 | rule catalog schema、15+ field定義、初期20 rule詳細 |
| `docs/specs/req-impact-map.md` | 0036 | REQ impact map形式、10 REQ cover要件、更新trigger |
| `docs/specs/artifact-responsibilities.md` | 0037 | artifact種別→canonical owner対応表 |
| `docs/specs/rule-ownership.md` | 0037 | rule domain→責任REQ/SPEC対応表（12 domain） |
| `docs/specs/inventory-contracts.md` | 0037 | registry/generated inventory形式と更新契約 |
| `docs/specs/runtime-package-boundary.md` | 0038 | repo type定義、self-hosting vs consumer境界、reserved names |

### 新設Guide

| 候補path | 来源RU | 内容 |
|---|---|---|
| `docs/guides/consumer-project-setup.md` | 0038 | consumer project導入手順、sync scope、troubleshooting |

### 新設AgentDevFlow artifact

| 候補path | 来源RU | 内容 |
|---|---|---|
| `.agentdev/integrity/rule-catalog.json` | 0036 | rule catalog machine-readable形式 |
| `.agentdev/integrity/baseline.json` | 0035 | baseline-known findings記録 |

### 既存SPEC更新候補

| 候補path | 来源RU | 変更内容 |
|---|---|---|
| `docs/specs/integrity-contracts.md` | 0035/0036 | finding分類拡張、scan層追加、rule catalog参照 |
| `docs/specs/system.md` | 0034 | source/projection語義の反映 |

---

## F. 関連ドキュメント更新候補 (RU-0034)

以下のdocsの`.opencode/`参照にsource/projection語義を追従する。
**context-sensitive分類**（単純なglobal replaceは不可）。6分類ルール:
1. source意味の参照 → `src/opencode/`に更新
2. runtime projection意味の参照 → `.opencode/`を維持＋source言及を追加
3. project-local意味の参照 → `.opencode/`を維持＋reserved names言及を追加
4. retired文書 → 修正しない（歴史的記録として保存）
5. link参照 → source pathを指すよう更新
6. 一般説明 → source/projection両方に言及

### 更新対象docs

| Document | 予想影響度 | 分類 |
|---|---|---|
| README.md | HIGH | 1, 2, 6 |
| docs/DOC-MAP.md | MEDIUM | 2, 5 |
| REQ-0101 | LOW | 2 |
| REQ-0103 | HIGH | 1, 2 |
| REQ-0108 | HIGH | 1, 2 |
| REQ-0109 | LOW | 2 |
| REQ-0113 | MEDIUM | 2 |
| REQ-0114 | MEDIUM | 2 |
| ADR-0017 | LOW | 2 |
| ADR-0018 | LOW | 2 |
| specs/integrity-contracts.md | HIGH | 1, 2 |
| specs/system.md | MEDIUM | 2, 6 |
| specs/workflow-contracts.md | LOW | 2 |
| specs/artifact-contracts.md | MEDIUM | 1, 2 |
| specs/patterns.md | LOW | 2 |
| guides/*.md | LOW-MEDIUM | 2, 5 |

---

## Requirement Source

- `.agentdev/backlog/req-units/RU-0011.md` (package index)
- `.agentdev/backlog/req-units/RU-0012.md` (=RU-0033)
- `.agentdev/backlog/req-units/RU-0013.md` (=RU-0034)
- `.agentdev/backlog/req-units/RU-0014.md` (=RU-0035)
- `.agentdev/backlog/req-units/RU-0015.md` (=RU-0036)
- `.agentdev/backlog/req-units/RU-0016.md` (=RU-0037)
- `.agentdev/backlog/req-units/RU-0017.md` (=RU-0038)

---

## Open Items

- (none — all branches resolved)
