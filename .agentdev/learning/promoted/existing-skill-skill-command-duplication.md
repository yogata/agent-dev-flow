# SKILL↔command同一ルール重複許容基準の文書化

## 背景

ADR採番ルール（max+1, 欠番埋め禁止）を PR #975 で `agentdev-adr-file-manager/SKILL.md` と `req-save.md` の両方に記載した。知識の二重保持は意図的（SKILLは知識ベース・commandは実行手順）だが、将来の改定時に同期漏れが起き得る。SKILL↔command の同一ルール重複を許容するか・一方向参照にするかの判断基準が文書化されていない。

## 問題

SKILL↔command の同一ルール重複を許容するか・一方向参照にするかの判断基準が、artifact-responsibilities / SKILL/command責務分割原則に明示されていない。重複を許容する場合の同期責任（どちらを正とするか）も未定義。

## 望ましい変更

SKILL↔command の同一ルール重複について、許容条件（両方に記載することが正当な場合）と一方向参照（SKILL→command のみ等）の判断基準を文書化する。許容する場合の同期ルール（SKILLを正・commandは参照先明示等）も定義する。

## 対象範囲

### 対象
- `docs/specs/` 配下の artifact-responsibilities / document-model（責務分割原則）
- または `src/opencode/skills/agentdev-doc-writing/`（文書執筆ガイドライン）

### 対象外
- ADR採番ルール自体の変更（既存ルールは維持）
- 各SKILL/command の既存の重複記述の削除（判断基準の文書化のみ）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | `docs/specs/document-model.md` または artifact-responsibilities SPEC | SKILL↔command同一ルール重複の許容条件・一方向参照の判断基準・同期ルールを追加 |
| skill | `src/opencode/skills/agentdev-doc-writing/` | 文書執筆時の重複許容判定指針を追加 |

## 既存対策確認

- **確認結果**: あり（部分的）
- **該当ファイル**: `agentdev-adr-file-manager/SKILL.md` L29-53（ADR採番ルール詳細定義）, `docs/specs/skills/agentdev-adr-file-manager.md` L22（採番ルール概要）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: ADR採番ルール自体はSKILLに詳細定義済み。重複許容基準（いつ両方に書くか・いつ一方を参照にするか）と同期ルールは未定義。

## 制約

- 既存のADR採番ルールの重複記述は維持（判断基準の文書化のみ）
- AGENTS.md は簡潔に保つ（詳細はSPEC/SKILLに配置）

## 受け入れ条件

- [ ] SKILL↔command同一ルール重複の許容条件が文書化されている
- [ ] 一方向参照への切り替え基準が文書化されている
- [ ] 許容する場合の同期ルール（正の情報源・参照先明示）が定義されている

## 元learning item / 根拠

- **要約**: SKILL↔command の同一ルール重複の許容基準が未定義で、将来の改定時に同期漏れリスクがある
- **根拠**: PR #975 でADR採番ルールをSKILLとcommandの両方に記載。意図的な二重保持だが同期リスクを認識。
- **再発条件**: SKILL↔command で同一ルールを記述する変更を実施する際
- **横展開可能性**: 中。SKILL/command編集時に毎回潜在する

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: PR #975 Issue #970 (バッチB 文書品質・整備)
