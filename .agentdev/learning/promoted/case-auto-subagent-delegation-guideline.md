# case-auto subagent 委譲時の category 選定ガイドラインと MUST NOT DO 必須化

## 背景

case-auto から case-open を subagent へ委譲した際（#1538 case-auto 委譲）、複数回の試行で手順逸脱が発生。1回目は文書監査ファイル生成（japanese-audit, replacement-dictionary 等、スコープ外）を実施し case-open の本来責務（Issue 作成・VERIFY）へ到達せず。その後の試行では draft 作成（`.agentdev/drafts/` 配下）という case-open とは無関係の作業へ逸脱。親コンテキストの MUST NOT DO（draft ファイル作成禁止、文書監査禁止、REQ/SPEC/src 修正禁止）に抵触。根本原因は (1) category=writing が「文書作業」を連想させ subagent が文書監査・校正的振る舞いを誘発（japanese-tech-writing 等の発火スキルとの相互作用）、(2) subagent プロンプトで MUST NOT DO が明示されておらずスコープ境界が弱かった、(3) writing category が「書く」作業全般を意味するため case-open の事務的手続き作業と認識されなかった。category=writing を廃止し unspecified-high + プロンプト強化で正常完了したことから逆算的に原因が特定された。

## 問題

1. case-auto から subagent 委譲時の category 選定基準が SPEC に未明文化。category=writing が「文書作業」を連想させ subagent を文書監査・校正的振る舞いへ誘発。
2. subagent プロンプトで MUST NOT DO セクションが明示されておらず、スコープ境界が弱い。
3. writing category の発火スキル（japanese-tech-writing 等）と subagent 振る舞いの相互作用が未検証。agentdev-case-run-execution-adapter の委譲プロトコルと category 設計の関係も未整理。

## 望ましい変更

case-auto から subagent 委譲時の category 選定ガイドラインを SPEC 化する（事務的手続きは unspecified-high を推奨、writing は執筆作業のみ）。subagent プロンプトテンプレートに MUST NOT DO セクションを必須化する。writing category の発火スキル（japanese-tech-writing 等）を case-open 等の事務的手続き委譲時は無効化する仕組みを検討する。category 別の subagent 振る舞い事例集を蓄積する。

## 対象範囲

### 対象

- `src/opencode/commands/agentdev/case-auto.md`（subagent 委譲ガイドライン・category 選定指針）
- `.opencode/skills/agentdev-workflow-orchestration/references/capture-boundaries.md`（subagent プロトコル・MUST NOT DO 記載要件）
- `.opencode/skills/agentdev-case-run-execution-adapter/`（委譲プロトコルと category 設計の関係）

### 対象外

- task() ツール、call_omo_agent ツール自体の仕様変更（ハーネス側スコープ）
- category 全体の再設計（本成果物は case-auto 委譲時の指針整備に限定）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | src/opencode/commands/agentdev/case-auto.md | subagent 委譲ガイドライン、category 選定指針（事務的手続きは unspecified-high 推奨、writing は執筆作業のみ）を追記 |
| skill | .opencode/skills/agentdev-workflow-orchestration/references/capture-boundaries.md | subagent プロトコルの MUST NOT DO 記載要件を追記 |
| skill | .opencode/skills/agentdev-case-run-execution-adapter/SKILL.md | 委譲プロトコルと category 設計の関係（writing category の発火スキルとの相互作用）を整理 |

## 既存対策確認

- **確認結果**: なし（SPEC に未明文化）
- **該当ファイル**: なし（case-auto.md、workflow-orchestration、case-run-execution-adapter に category 選定・MUST NOT DO 記載要件なし）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: case-auto から subagent 委譲時の category 選定基準、プロンプトの MUST NOT DO 記載要件が SPEC に未明文化。category=writing の発火スキル（japanese-tech-writing 等）と subagent 振る舞いの相互作用が未検証。agentdev-case-run-execution-adapter の委譲プロトコルと category 設計の関係も未整理。

## 制約

- category 選定ガイドラインは case-auto 委譲時に限定せず、case-open, case-run, case-update, case-close 等 subagent 委譲する全場面に適用可能な形で汎用化する。
- MUST NOT DO 必須化は subagent プロンプトテンプレートの整備を伴う。既存の委譲プロトコル（adapter skill）との整合性を維持する。
- writing category の発火スキル無効化は、仕組みの検討段階とし、即時実装は必須としない（別 Issue で具体化）。

## 受け入れ条件

- [ ] case-auto.md に subagent 委譲時の category 選定ガイドラインが追記されている（事務的手続きは unspecified-high 推奨、writing は執筆作業のみ）
- [ ] case-auto.md に subagent プロンプトテンプレートの MUST NOT DO セクション必須化が明記されている
- [ ] workflow-orchestration capture-boundaries.md に subagent プロトコルの MUST NOT DO 記載要件が追記されている
- [ ] case-run-execution-adapter SKILL.md に委譲プロトコルと category 設計の関係が整理されている
- [ ] writing category の発火スキル無効化検討が今後の課題として明記されている

## 元learning item / 根拠

- **要約**: case-auto から case-open を subagent 委譲した際、category=writing が文書監査的振る舞いを誘発しスコープ逸脱。MUST NOT DO 未明示でスコープ境界が弱かった。category=unspecified-high + MUST NOT DO 強化で解決。
- **根拠**: inbox#9 (Issue #1538, PR #1539): case-auto から case-open を category=writing で委譲、文書監査ファイル生成・draft 作成へスコープ逸脱。category=unspecified-high + MUST NOT DO 強化プロンプトで正常完了
- **再発条件**: (1) case-open 等の事務的手続き作業を category=writing で委譲した場合、(2) subagent プロンプトに MUST NOT DO が明示されていない場合、(3) category 名が subagent の「作業の意味」を誤誘導する場合
- **横展開可能性**: case-auto から subagent へ委譲する全場面（case-open, case-run, case-update, case-close 等）。特に command 名と category 名の意味的距離が大きい場合は要注意

## 推奨Issue分類

- **分類**: feature（command/skill の委譲ガイドライン・MUST NOT DO 必須化）
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: Issue #1538, PR #1539 (merge 5e373217), case-auto case-open 委譲, category=writing vs unspecified-high, REQ-0149（agentdev-gh-cli 委譲基盤）
