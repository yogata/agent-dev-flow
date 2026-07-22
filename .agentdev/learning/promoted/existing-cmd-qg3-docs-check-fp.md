# QG-3 docs-check フラグ判定の意味差分考慮（false positive 抑止）

## 背景

Epic #1736（REQ-0155 関連）の Wave 1（PR #1745、Issue #1738）および Wave 2（PR #1746、Issue #1739）で、REQ 相互参照追加のみ、SPEC 内参照表記是正（ADR-0139 参照追記、相対パス是正）のみ等の軽微な変更に対し、`check_changed_docs.ts` が `spec_readme_update_required: true`、`requirements_readme_update_required: true`、`extensions_check_required: true` の各フラグを立てる誤検知が連続して発生した。Wave 1 と Wave 2 で同一問題クラスの誤検知が再発し、毎 Wave の agent が誤検知判定と処理を強いられている。対象ファイル（SPEC 一覧表、extensions、REQ README 等）への影響がない変更でも、機械的差分ベースでフラグが立つため、QG-3 の信頼性が低下している。

## 問題

`check_changed_docs.ts` のフラグ判定が「変更ファイルパス・差分有無」ベースであり、変更の意味内容を考慮しない。具体的には、SPEC 一覧表や extensions 配下を含む（または過去に含んでいた）ファイルに対し、README 更新や extensions への影響を生まない軽微な変更（REQ 相互参照追加、SPEC 内参照表記是正等）を行っても、機械的に当該フラグが立つ。この結果、agent は毎回誤検知を解釈・処理する負荷を負い、QG-3 の信頼性が低下する。Wave 1→Wave 2 で連続再発しており、対策しない限り継続再発する。

## 望ましい変更

`check_changed_docs.ts` のフラグ判定ロジックを、機械的差分ベースから意味差分考慮ベースへ改善する。具体的には以下のいずれか（組み合わせも可）を実装する:

1. **行レベル差分ベース判定への変更**: ファイル単位の差分有無ではなく、行レベルで意味のある変更（frontmatter 変更、新規エントリ追加、実質的な本文変更等）がある場合のみフラグを立てる。REQ 相互参照追記、SPEC 内参照表記是正等の軽微な行変更はフラグ対象外とする。
2. **README 更新必須判定を frontmatter 変更時に限定**: `requirements_readme_update_required` / `spec_readme_update_required` は、REQ/SPEC ファイルの frontmatter（id、title、status、depends_on 等）が変更された場合のみ true とする。本文中の相互参照追記や表記是正ではフラグを立てない。
3. **false positive 抑止フラグの追加**: PR 本文の frontmatter（例: `docs-check-skip: [spec_readme_update_required, extensions_check_required]`）または commit message trailer で、agent が明示的にフラグを抑止できる仕組みを追加する。ただし、濫用防止のため抑止理由の記述を必須とする。

## 対象範囲

### 対象

- `scripts/check_changed_docs.ts`（フラグ判定ロジック）
- `docs-check` command（QG-3 手順、フラグ解釈）
- `case-close` command（targeted docs guard、QG-3/QG-4 でのフラグ取り扱い）
- 関連 SPEC（`docs/specs/integrity/` 配下で `check_changed_docs.ts` のフラグ定義を規定する箇所があれば）

### 対象外

- `check_integrity.ts`（別系統の integrity check。本件の誤検知対象外）
- QG-3/QG-4 の判定基準自体（フラグの解釈運用は本件の対象外。フラグ判定ロジックの精度改善のみ対象）
- 他の `check_*.ts` 系スクリプト（本件で直接変更しないが、改善パターンの横展開は別 Issue で検討）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| script（配布物） | `scripts/check_changed_docs.ts` | フラグ判定ロジックを行レベル差分ベースまたは frontmatter 変更時限定へ変更。必要に応じて false positive 抑止フラグ受付を追加。 |
| command | `.opencode/commands/agentdev/docs-check.md` | QG-3 手順で、新フラグ判定ロジックの解釈と、false positive 抑止フラグの運用（理由記載必須等）を明記。 |
| command | `.opencode/commands/agentdev/case-close.md` | targeted docs guard、QG-3/QG-4 での新フラグ判定ロジックの取り扱いを更新。 |
| spec | `docs/specs/integrity/` 配下（該当 SPEC が既存の場合） | `check_changed_docs.ts` のフラグ定義 SPEC に、意味差分考慮ロジックを追記。該当 SPEC が未整備の場合は新規起票を検討。 |

## 既存対策確認

- **確認結果**: 既存対策あり（不完全）
- **該当ファイル**: `scripts/check_changed_docs.ts`、`.opencode/commands/agentdev/docs-check.md`、`.opencode/commands/agentdev/case-close.md`（targeted docs guard、QG-3）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 現行のフラグ判定は「変更ファイルパス・差分有無」ベースであり、変更の意味内容を考慮しない。Wave 1（PR #1745）と Wave 2（PR #1746）で、SPEC 一覧表・extensions・REQ README に影響しない軽微変更に対し誤検知が再発。case-close の targeted docs guard でも同一フラグが立つ。意味差分考慮ロジックの未実装が根本原因。

## 制約

- **後方互換性**: 既存のフラグ判定に依存する PR（SPEC 一覧表の実質的更新を含む変更等）は、新ロジックでも正しくフラグが立つ必要がある。意味差分考慮の閾値設計が重要（過剰な抑止は真正なフラグまで消す）。
- **配布物改修**: `scripts/check_changed_docs.ts` は `src/scripts/` 配下の配布物。本成果物は `promoted/` から `/agentdev/backlog-review` → `/agentdev/req-define` → `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run` の昇華経路を経て改修される。直接 `src/` 配下を編集しない。
- **自動 REQ 化禁止**: 本成果物は REQ 化の候補であり、確定ではない。`/agentdev/req-define` で要件が確定し、`/agentdev/req-save` で REQ 化される。
- **テスト**: 新ロジックには、誤検知抑止の回帰テスト（Wave 1/2 と同種の軽微変更でフラグが立たないこと）と、真正検知の維持テスト（実質的な README/ extensions 変更でフラグが立つこと）をペアで追加する。
- **運用移行**: 新ロジック導入後、既存の誤検知運用（agent が毎回フラグを解釈する手順）は段階的に廃止する。

## 受け入れ条件

- [ ] `check_changed_docs.ts` のフラグ判定が、行レベル差分ベース、または frontmatter 変更時限定、または false positive 抑止フラグのいずれか（組み合わせ可）に改善されていること。
- [ ] Wave 1（PR #1745 相当: REQ 相互参照追加のみ）と Wave 2（PR #1746 相当: SPEC 内参照表記是正のみ）と同種の軽微変更で、`spec_readme_update_required` / `requirements_readme_update_required` / `extensions_check_required` のいずれも true にならないこと（回帰テストで担保）。
- [ ] 一方で、SPEC 一覧表への実質的な新規 SPEC 追加、extensions への新規 extension 追加、REQ README の実質的更新（REQ の新規追加・ステータス変更等）では、引き続きフラグが立つこと（真正検知の維持テストで担保）。
- [ ] `docs-check` command および `case-close` command の QG-3 手順が、新フラグ判定ロジックの解釈と取り扱いに更新されていること。
- [ ] 新ロジックの設計根拠（どの変更パターンをフラグ対象とするか／しないか）が SPEC または `check_changed_docs.ts` のヘッダコメントに文書化されていること。
- [ ] 仮に false positive 抑止フラグを導入した場合、抑止理由の記載が必須化されており、濫用防止の運用が規定されていること。

## 元learning item / 根拠

- **要約**: Epic #1736 Wave 1/2 で、REQ 相互参照追加や SPEC 内参照表記是正のみの軽微変更に対し、`check_changed_docs.ts` が SPEC 一覧表更新要求、REQ README 更新要求、extensions 確認要求の各フラグを立てる誤検知が連続再発した。判定ロジックが機械的差分ベースで意味内容を考慮しないのが根本原因。
- **根拠**: PR #1745（Wave 1、Issue #1738、REQ-0155 関連 REQ 相互参照追加のみ）と PR #1746（Wave 2、Issue #1739、artifact-responsibilities.md / learning-promote.md の SPEC 内参照表記是正のみ）で、いずれも SPEC 一覧表・extensions・REQ README への影響がないにもかかわらず3フラグが立った。Wave 2 case-close の targeted docs guard でも同一フラグが再発。PR 本文 Findings/docs-integrity セクションで agent が誤検知として処理。
- **再発条件**: SPEC 一覧表や extensions 配下を含む（または過去に含んでいた）ファイルに対し、README 更新や extensions への影響を生まない軽微な変更を行った場合。Wave 単位で再発中。
- **横展開可能性**: 高い。他の `check_*.ts` 系フラグ判定（case-close targeted docs guard 等）でも同パターンが再発済み。変更差分ベースでフラグを立てる判定ロジック全般に適用可能な改善パターン。

## 推奨Issue分類

- **分類**: fix（既存機能の不具合修正。誤検知の是正）
- **推奨ラベル**: `bug`, `docs-check`, `qg-3`, `false-positive`, `wave-recurrence`
- **関連Issue**: #1738（Wave 1 元 Issue）, #1739（Wave 2 元 Issue）, Epic #1736（親 Epic）。新規 Issue として起票し、#1738/#1739 は参照として記載。
