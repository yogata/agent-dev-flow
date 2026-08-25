---
title: `agentdev-issue-tracking` Design
status: accepted
created: 2026-08-23
updated: 2026-08-25
---
<!-- ADF-COVERS(implementation): REQ-049-001, REQ-049-002, REQ-049-003, REQ-049-005, REQ-049-006, REQ-049-007, REQ-049-008, REQ-049-012, REQ-049-013, REQ-049-014, REQ-049-017, REQ-049-018 -->

# `agentdev-issue-tracking` Design

追跡Issue管理 Capability Skill `agentdev-issue-tracking` の Design。

本 Design は追跡Issueの論理スキーマの一元管理先であり、GitHub Issue を追跡Issue（tracking）と Case Issue（case）の共通管理単位として運用するための意味論を所有する（REQ-049、DEC-020）。物理的な GitHub / ローカル I/O 手続きは所有しない（Tool 操作契約、REQ-011）。

- 論理スキーマ: role、kind、状態と状態遷移、件名、内容、背景、影響、関連成果物、選択肢、判断材料、不足情報、owner・期限・優先度等の任意メタデータ、保留理由、再評価条件、解決結論、反映先と反映状態、追跡Issueと Case Issue の関連。
- 物理マッピング表: role、kind、状態とラベル、Issue Type、Issue Field 等の物理値の対応表。正は本 Design が所有し、機械適用は Tool 内実装が行う。
- 本文標準構造: 追跡Issue本文の標準セクション構成（現在状態の理解のための要約・構造化情報を中心とする）。
- 再評価・解決・反映追跡の意味論: 保留理由と再評価条件の識別、解決済み（結論確定）とクローズ済み（反映完了または反映不要確認完了）の区別、反映先と反映状態の追跡。
- GitHub メタデータへのマッピング: title、labels、state、本文、コメントが論理スキーマのどの要素を保持するか。

## 確定事項

1. **role 体系**: Issue の role は `tracking`（追跡Issue）と `case`（Case Issue）の2値。role は物理的にはラベル等へ写像され、Tool が機械判定可能な形で読取結果へ提供される
2. **kind 値域**: 追跡Issueの kind は `problem`、`idea`、`task`、`risk` の4値を基本値域とする
3. **状態の6値と意味**: 追跡Issueの状態は起票、検討中、保留、実行準備完了、解決済み、クローズ済みの6状態。解決済みは結論の確定を、クローズ済みは必要な反映の完了または反映不要の確認完了を意味する
4. **状態の三段写像**: 追跡Issue 6状態、GitHub open/closed、Tool close reason の対応表を本 Design が確定する:

   | 追跡Issue状態 | GitHub state | Tool issue_close reason |
   |---|---|---|
   | 起票、検討中、保留、実行準備完了、解決済み | open | クローズしない |
   | クローズ済み（反映完了） | closed | completed |
   | クローズ済み（反映不要の確認完了。対応不要の解決を経由したものを含む） | closed | not_planned |

   issue_close の reason は追跡Issueの解決済み（open のまま結論確定を保持する中間状態）、クローズ済み（completed）、対応不要（解決の一形態。not_planned でクローズ）のいずれかに対応する
5. **物理写像表の所有と機械適用の分担**: role、kind、状態とラベル、Issue Type、Issue Field 等の対応表の正は本 Design が所有する。論理値と物理値の変換（写像表の機械適用）は Tool 内実装が行い、Tool は写像の意味判断を新規に所有しない。上位層は論理値のまま Tool 操作契約を利用し、写像を再実装しない
6. **本文標準構造**: 追跡Issue本文は、件名、背景、影響、関連成果物、選択肢、判断材料、不足情報、保留理由と再評価条件、解決結論、反映先と反映状態、関連 Case Issue への参照を標準セクションとして保持する。起票時に反映先・クローズ確認を含めない（反映先の決め打ち回避）。検討経過は Issue コメントを正規の時系列履歴とし、本文内へ独自の追記専用ログを二重保持しない
7. **再評価・解決・反映追跡の意味論**: 保留状態は「なぜ現在判断できないか」と「何が成立すれば再評価するか」を識別して保持する。再評価後は、結論の確定、理由と不足情報を更新した保留継続、対応不要という結論での解決、解決結果の正規成果物への反映のいずれかとして処理する。反映先の成果物更新はその成果物を所有する能力へ委譲し、追跡Issue側は反映先と反映状態で追跡する。クローズは必要な反映の完了または反映不要の確認を条件とする
8. **GitHub Organization 固有機能の位置づけ**: GitHub Issue Type / Issue Fields は利用可能な環境での物理写像として使用し、必須前提としない。論理スキーマは最低限、リポジトリ単位の Issue、ラベル、本文、状態で成立する
9. **コメント読み替えの role 分岐（ローカル版）**: ローカル版では Issue コメント相当の履歴をローカルIssue内のコメント相当セクションへ読み替える。読み替え先は role により分岐する（role: tracking は検討経過、role: case は Case 実行のコメント相当情報。物理表現の詳細はローカルIssue共通スキーマ Design が所有する）
10. **実行確定時の経路**: 追跡Issueで実行が確定した場合、req-define 等の正規要件化・設計経路を経由し、case-open が別の Case Issue を作成する。追跡Issueと生成された Case Issue の関連は双方の参照として保持し、追跡Issueを実行票へ直接変質させない
11. **状態トークンと GitHub ラベル語彙（物理写像表の具体値）**: 追跡Issue 6状態の論理トークンは `created`（起票）、`in-discussion`（検討中）、`on-hold`（保留）、`ready`（実行準備完了）、`resolved`（解決済み）、`closed`（クローズ済み）とする。GitHub 物理ラベルは、role = `agentdev-tracking`（追跡Issueのみ付与。ラベルなしは role: case と機械判定し、既存 Case Issue との互換を維持する）、kind = `agentdev-kind/{problem|idea|task|risk}`、非終端追跡Issue状態 = `agentdev-tracking-status/{created|in-discussion|on-hold|ready|resolved}`。終端（`closed`）は GitHub state と state_reason（completed / not_planned）から導出し、状態ラベルを付与しない。ローカルIssueの frontmatter `status` は論理トークンと同一の値を用いる
12. **再オープン遷移**: 追跡Issueの再オープンは `closed` → `in-discussion`（再検討）へ遷移させる。ローカル版の role: case は終端状態からの遷移を定義しないため、reopen を拒否する（ローカルIssue共通スキーマ Design の role: case 状態遷移と整合）
13. **ローカル版追跡Issueの labels 値域**: ローカル版 role: tracking の `labels` は kind 4値（`problem`、`idea`、`task`、`risk`）からちょうど 1 つを持つ（機械検証）。追加ラベルは許容しない（role ごとの値域検証の実効性のため）
