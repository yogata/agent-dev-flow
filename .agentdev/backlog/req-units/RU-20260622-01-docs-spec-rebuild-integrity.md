---
source_type: chat
generated_by: session
generated_at: 2026-06-22T00:15:21+09:00
status: draft
sources:
  - type: chat
    path: session:2026-06-22-docs-spec-rebuild-integrity
---

# SPEC再構築・配布物ID除去後の文意保持と case 系責務整合

## 背景

docs/ 配下の SPEC 再構築、REQ / ADR / SPEC の責務分離、command / skill 専用 SPEC 化、配布物からの内部 ID 除去が進められている。

本セッションでは、直近の issue / PR / 変更ファイルを確認し、方向性としては以下が妥当であると整理した。

- REQ は満たしたい状態を扱う。
- ADR は意思決定を扱う。
- SPEC は現在動作・実現方式・パラメータ・手順境界を扱う。
- command / skill SPEC を分離し、grab-bag 化した SPEC を解体する。
- 配布物である `src/opencode/commands/` と `src/opencode/skills/` から、内部管理用の REQ / ADR / SPEC / IR 等の ID を除去する。
- `case-*` 系は、各 command の責務境界を明確化する。

一方で、確認の結果、内部 ID 除去および SPEC 再構築の変更後に、文書破損・文意欠落・command と skill / SPEC 間の責務不整合が残っていることが分かった。

## 問題

内部 ID の grep 結果が 0 件であっても、配布物の文意保持と実行可能性は保証されていない。

本セッションで確認した主な問題は以下である。

1. `src/opencode/commands/agentdev/case-auto.md` が破損している。
   - Step 内に frontmatter と本文冒頭が再挿入されている。
   - 正規表現記述が途中で破損している。
   - 同一文書内でタイトル・入力・出力・手順が重複している。
   - command 定義としてそのまま信頼できない状態である。

2. `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md` が現在の `case-run` 責務と矛盾している。
   - 現行 `case-run` は単一 Issue または単一 Wave を扱う方向で整理されている。
   - 一方で skill 側には、`case-run` は常に 1 Issue のみを扱う、Wave 単位オーケストレーションは提供しない、という趣旨が残っている。
   - これにより `case-run` / `case-auto` / workflow orchestration の責務境界が再び曖昧になっている。

3. 内部 ID 除去後の残骸が残っている。
   - `（OU-012/）` のように、ID だけを除去した結果として壊れた括弧・壊れた参照表現が残っている。
   - これは「ID 参照削除」はできていても、「配布物として自然で自足した文書」にはなっていないことを示す。

4. `case-open.md` など一部 command で手順順序や構造が荒れている。
   - Step 番号やネスト構造の読解性が落ちている。
   - 破損とまでは言えないが、command と SPEC の責務整理後の実行入口としては不安定である。

5. docs-check / 横断検査の観点が不足している。
   - 内部 ID の残存検査だけでは、Markdown 構文破損、frontmatter 重複、文意欠落、括弧残骸、command / SPEC / skill 間の責務矛盾を検出できない。
   - 既存の NG / pre-existing / false positive が残る状態では、SPEC 再構築の完了判定が曖昧になる。

## Source Summary

本セッションで合意した内容は以下である。

- docs/SPEC 再構築の方向性自体は妥当である。
- command / skill SPEC の分離と三層化は妥当である。
- 配布物から内部 ID を除去する方針は妥当である。
- ただし、現在の変更結果には破損と不整合が残っており、「整合済み」とは扱えない。
- 最優先で直すべき対象は `case-auto.md` の破損である。
- 次に、`agentdev-workflow-orchestration/SKILL.md` の `case-run` 責務記述を現行方針に合わせる必要がある。
- grep ベースの ID 残存確認だけでは不十分であり、文意保持・構文健全性・責務整合を確認する検査観点が必要である。
- `case-*` 系の責務は以下を基本とする。
  - `case-open`: Issue 構造生成・Issue 作成を担当する。
  - `case-run`: 単一 Issue または単一 Wave の実行委譲を担当する。
  - `case-close`: PR merge、完了条件評価、Issue close、Epic status table 更新を担当する。
  - `case-auto`: 各工程を task として呼び出す最大自走オーケストレーターであり、Issue 構造判定や Epic 本文の直接編集を主責務にしない。

## 統合理由

この RU は、単なる `case-auto.md` の破損修正だけを扱うものではない。

`case-auto.md` の破損、`agentdev-workflow-orchestration/SKILL.md` の責務矛盾、内部 ID 除去後の残骸、検査観点不足は、いずれも同じ根本問題に属する。

根本問題は、SPEC 再構築および配布物 ID 除去の完了条件が「対象ファイルを広く変更したこと」や「内部 ID grep が 0 件であること」に寄りすぎており、配布物としての文意保持・構文健全性・責務整合を十分に完了条件へ含めていないことである。

したがって、個別破損の修正と再発防止の検査観点を、同一 Requirement Unit として扱う。

## 要件化の方向

SPEC 再構築および配布物 ID 除去後の完了条件として、以下の状態を要件化する。

1. 配布物から内部 ID を除去した後も、Markdown 文書として構文破損が残らない。
2. frontmatter、タイトル、入力、出力、手順などの主要構造が、同一文書内で意図せず重複しない。
3. 内部 ID 除去後に、壊れた括弧、壊れた参照、主語や目的語を失った文が残らない。
4. command / skill / SPEC 間で、同一 command の責務説明が矛盾しない。
5. `case-*` 系 command の責務境界は、SPEC と command 本体と関連 skill の間で同じ意味を持つ。
6. 横断検査は、内部 ID の有無だけでなく、文意保持・構文健全性・責務整合の観点を含む。
7. docs-check 等で既知 NG や false positive が残る場合は、完了判定と混同せず、分類・理由・後続対象を明確にする。

## 主対象REQまたは変更対象候補

主対象REQまたは変更対象候補は、既存 REQ / SPEC の精査後に確定する。

候補は以下である。

- 配布物から内部管理 ID を除去する既存要件
- command / skill / template / script の責務境界を定義する既存要件
- docs / SPEC / command / skill の整合性検査を定義する既存要件
- `case-*` workflow の責務境界を定義する既存 SPEC
- `docs/specs/commands/case-auto.md`
- `docs/specs/commands/case-run.md`
- `docs/specs/commands/case-open.md`
- `docs/specs/commands/case-close.md`
- `src/opencode/commands/agentdev/case-auto.md`
- `src/opencode/commands/agentdev/case-run.md`
- `src/opencode/commands/agentdev/case-open.md`
- `src/opencode/commands/agentdev/case-close.md`
- `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md`
- docs-check または横断検査スクリプト

## 対象外

以下はこの RU の対象外とする。

- `case-*` 系 command の新機能追加
- 実装計画の詳細化
- Issue / PR 作成手順の新設
- `case-auto` の実装方式そのものの再設計
- `case-run` が担当する実装作業の具体的な実装内容
- SPEC 再構築全体の再方針化
- 未確認の pre-existing NG の一括修正
- ユーザー未承認の保存、commit、push
- 会話 URL の記録

## 受け入れ条件

- `src/opencode/commands/agentdev/case-auto.md` に frontmatter や本文冒頭の重複挿入が残っていない。
- `src/opencode/commands/agentdev/case-auto.md` の Step 記述が Markdown として読める状態である。
- `src/opencode/commands/agentdev/case-auto.md` の内部 ID 除去後も、文意が欠落していない。
- `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md` の `case-run` 説明が、単一 Issue または単一 Wave を扱う現行方針と矛盾しない。
- `case-open` / `case-run` / `case-close` / `case-auto` の責務説明が、command 本体、command SPEC、workflow orchestration skill の間で一致している。
- 配布物内に `（OU-012/）` のような壊れた ID 除去残骸が残っていない。
- 内部 ID 残存 grep だけでなく、frontmatter 重複、見出し重複、壊れた括弧、壊れた参照表現、主要 command 間の責務矛盾を検出または確認する観点が追加されている。
- docs-check 等で残る NG がある場合は、false positive、pre-existing、今回修正対象のいずれかに分類されている。
- 今回の修正対象と対象外が分離され、未合意事項が要件本文に混入していない。
