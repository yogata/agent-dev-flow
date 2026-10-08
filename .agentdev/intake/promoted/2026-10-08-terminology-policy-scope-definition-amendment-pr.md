# 完全形式「Definition Amendment PR」と訳語「設計修正PR」の適用境界を用語政策として確定する

統合元: 2026-10-07-case-3507-amendment-terminology.md + 2026-10-07-case-3507-baseline-textlint.md（同一の政策判断に収束するため統合）

## 観測内容

表記統一（PR #3524・RA-010 commit c587d672）で散文に追加した完全形式「Definition Amendment PR」を、プロジェクト prh 辞書（.agentdev/config/plugins/agentdev-textlint-guard-prh.yml）の固定置換規則（`/Definition Amendment PR/ → 設計修正PR`）が拒否する。一方で同辞書は単体表記規則（`/(?<!Definition )Amendment PR/ → Definition Amendment PR`、AG-012）で完全形式への統一を誘導しており、規則間で正規形が矛盾する。さらに同辞書のコメントは REQ-062-003 を「Definition Amendment PR」正式名称の根拠として参照しながら、規則1 が同一 REQ-062-003 の要件行内表記を置換対象とする自己参照構造を持つ（prh 辞書 :12-15 と :22-23）。

現行の正規契約では REQ-083-003（「設計PR」「設計修正PR」を現行名称とし履歴成果物の旧表現を書き換えない）と REQ-062-003（case-revise は実変更がある場合のみ Definition Amendment PR を作成）の両方が正式名称として併存し、用語政策（document-type-responsibilities.md:330「Definition Amendment PR」は「設計修正PR」へ固定置換登録済み・置換対象外はブランチ名・worktree 名の識別子と履歴成果物の旧表現のみ）との境界が未確定である。

## 残存の実測（2026-10-08・HEAD c8645fe4・textlint final gate 実測 566 ファイル hard 40 件）

### 完全形「Definition Amendment PR」の残存（docs 13 行・行内複数含め 14 インスタンス + src 配布物 16 行）

- docs/designs/workflows/v4-lifecycle-state-machine.md: 3 行
- docs/designs/commands/case-revise.md: 3 行
- docs/designs/foundations/system.md: 3 行
- docs/designs/skills/agentdev-git-worktree.md: 1 行
- docs/designs/responsibilities/document-type-responsibilities.md: 1 行（用語政策行自体）
- docs/requirements/REQ-062.md: 2 行（L23 REQ-062-003 要件テーブル行に 2 インスタンス + L33 対象節散文 1）
- src 配布物 7 ファイル 16 行: agentdev-workflow-case-revise/SKILL.md 7・references/definition-revision.md 4・commands/agentdev/case-auto.md 1・agentdev-workflow-case-auto/SKILL.md 1・references/handoff-and-update.md 1・agentdev-workflow-orchestration/references/case-auto-recovery.md 1・agentdev-workflow-templates/templates/case-revise/root-case-report.md 1

### baseline 用語辞書違反 12 件（PR #3522 由来・現在も残存・gate 実測）

内訳は prh 全規則系の混在:

- Definition PR 系: DEC-029.md:19/:25（履歴注記「Draft Definition PR」）2・REQ-061.md:63/:65（REQ-061-044/046 要件行「Definition PR」）2・REQ-083.md:18（REQ-083-003 政策定義行「Draft Definition PR」）1・document-type-responsibilities.md 1・IR-072 関連 1
- Definition Amendment PR 系: REQ-062.md 3（occurrence 単位）・document-type-responsibilities.md:330 1
- 実装 PR 系: document-type-responsibilities.md 1

12 件は性質が 2 種に分かれる: (i) 要件行の追随漏れ（REQ-061-044/046・REQ-062-003）と (ii) 政策定義行・履歴注記の機械拒否（REQ-083-003 行・DEC-029 注記・doc-type-responsibilities.md:330 用語政策行）。(ii) は文書側修正ではなく辞書規則の境界整理が正解になり得る。現行 gate はテーブルセルも Str 節点として検出するため「要件行は prh 免除」という例外は存在しない。

## 影響

textlint final gate が恒常的に hard 40 件で FAIL し、Epic 完了条件の「全統制 exit 0」を達成できない。完全形式の合意（AG-012・REQ-062-003）と prh 固定置換の矛盾は、新規文書執筆・REQ 追加のたびに再発する。REQ-062-003 の要件行を機械的に「設計修正PR」へ置換すると辞書コメントが参照する正規根拠の英語 anchor が消失する。

## 課題（backlog-review → req-define 向け）

1. 用語政策（document-type-responsibilities.md 用語政策節）において、識別子・テスト期待値・要件行・散文の各適用範囲を確定する。完全形式の合意を無断で撤回しない
2. prh 辞書の規則間矛盾（完全形への誘導規則と完全形の置換規則）を解消する
3. baseline 12 件の 2 種（要件行追随漏れ vs 政策定義行・履歴注記の機械拒否）を区別した解消方針を決定する
4. src 配布物 16 行の処置を含める（docs だけの政策適用は再度の lint 不合格を生む）

## 既存成果物との関連

- inspect-docs 検出事項 F-10（「Definition Amendment PR」裸表記 vs 用語政策）と同一根因。backlog-review で F-10 と統合すること（F-10 の target は design 4 ファイルで docs 13 行の部分集合）
- inspect-docs F-28（description 総量）と併せ textlint 系統の解消方針の一部を構成する
- 2026-10-08-textlint-hard-violations-resolution-policy.md（本プロモート内）の前提となる政策判断である同ファイルから依存される

## 元 observation（参照）

- https://github.com/yogata/agent-dev-flow/pull/3524（amendment-terminology・PR #3524 Findings）
- https://github.com/yogata/agent-dev-flow/pull/3522（baseline-textlint・PR #3522 Findings・main 491f308d 対照で同一12件確認）
