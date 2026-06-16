# retire 宣言（APPEND）の precedent 形式の文書化

## 背景

REQ-0122 retire 宣言（REQ-0109-038 APPEND）を REQ-0119-025（REQ-0111 retire 宣言）の precedent 形式で機械的に作成できた。新たな書式設計が不要だった。理由欄・移動先・吸収なし宣言の書式を踏襲するだけで、整合性の取れた retire 宣言行を生成できた。

しかし REQ-0119-025 precedent の存在は `agentdev-req-file-manager` および `agentdev-req-analysis` のいずれにも文書化されていない。REQ-0119-025 への参照は REQ ファイル本体と README/mapping-table に限られ、スキルから参照できない。今後の retire 宣言でも毎回書式設計からやり直すリスクがある。

## 問題

- REQ-0119-025 precedent 形式が機械的再利用可能であることがスキルに文書化されていない
- retire 宣言用の専用テンプレートが不在（`agentdev-req-file-manager/templates/doc_requirement.md` は汎用 REQ テンプレートのみ）
- `agentdev-req-analysis` に precedent 活用手順（類似宣言の参照→機械的再利用）が未記載
- REQ-0119-025 への参照がスキルから一切ないため、エージェントが自発的に precedent を発見できない

## 望ましい変更

retire 宣言を APPEND で行う際の precedent 参照手順を `agentdev-req-file-manager` と `agentdev-req-analysis` に文書化する。REQ-0119-025（REQ-0111 retire）→ REQ-0109-038（REQ-0122 retire）の機械的再利用パターンを明示し、今後の retire 宣言で書式設計を省略できるようにする。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-req-file-manager/SKILL.md`（APPEND セクションに retire 宣言 precedent の記載）
- `src/opencode/skills/agentdev-req-file-manager/references/req-save-procedure.md`（APPEND 操作手順に retire 宣言の具体的参照先を追記）
- `src/opencode/skills/agentdev-req-analysis/SKILL.md`（precedent 活用手順の追記）
- `src/opencode/skills/agentdev-req-file-manager/templates/`（retire 宣言テンプレート新設、または汎用テンプレートへの retire 宣言セクション追記を検討）

### 対象外

- REQ-0119-025 および REQ-0109-038 の本文変更（precedent の実例としてはそのまま維持）
- retire 宣言の判定基準（どの REQ を retire するか）の変更（本 artifact は書式の再利用性に限定）
- ADR 不要判定基準の変更（「機械的 retire 操作は ADR 不要」の判断は既存運用で機能しているため）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-req-file-manager/SKILL.md` | APPEND セクションに retire 宣言の precedent 形式参照を追記。REQ-0119-025 を参照元として明記 |
| skill | `src/opencode/skills/agentdev-req-file-manager/references/req-save-procedure.md` | APPEND 操作手順に retire 宣言時の具体的ステップ（precedent 参照 → 理由欄・移動先・吸収なし宣言の書式踏襲）を追記 |
| skill | `src/opencode/skills/agentdev-req-analysis/SKILL.md` | precedent 活用手順（類似宣言の検索 → 機械的再利用 → 差分のみ調整）を汎用プロセスとして追記 |
| template | `src/opencode/skills/agentdev-req-file-manager/templates/` | retire 宣言テンプレート（`doc_requirement_retire_append.md` 等）の新設を検討。または汎用 `doc_requirement.md` に retire 宣言行の形式例を追記 |

## 既存対策確認

- **確認結果**: 既存対策なし（application miss）
- **該当ファイル**: なし（`agentdev-req-file-manager/SKILL.md` APPEND セクション lines 45-52、`agentdev-req-analysis/SKILL.md`、`templates/doc_requirement.md` のいずれにも retire 宣言 precedent の記載なし）
- **ギャップ分類**: application miss
- **ギャップ詳細**: REQ-0119-025 → REQ-0109-038 の機械的再利用パターンは実在する（両者とも理由欄・移動先・吸収なし宣言の同一書式）が、(1) retire 宣言テンプレートが不在、(2) precedent 活用手順が req-define/req-save に未記載、(3) REQ-0119-025 への参照が skill に一切なし。エージェントは自発的に precedent を発見できず、毎回書式設計を繰り返すリスクがある。

## 制約

- precedent 参照は強制ではなく推奨であること（新規性の高い retire 宣言では書式調整が合理的な場合がある）
- REQ-0119-025 を「正解」として硬直化させず、あくまで出発点の参照例として位置づけること
- retire 宣言の判定基準（ADR 不要判定等）は既存運用を維持し、本 artifact は書式の再利用性に限定すること
- テンプレート新設は複雑性を増すため、まずは SKILL.md/references への追記で対応し、テンプレート化は次段階で検討することを明記

## 受け入れ条件

- [ ] `agentdev-req-file-manager` SKILL.md の APPEND セクションに retire 宣言の precedent 参照（REQ-0119-025）が追記されている
- [ ] `req-save-procedure.md` に retire 宣言時の具体的ステップ（precedent 参照 → 書式踏襲）が追記されている
- [ ] `agentdev-req-analysis` SKILL.md に precedent 活用の汎用プロセスが追記されている
- [ ] REQ-0119-025 が参照元として明記され、エージェントが自発的に発見できるようになっている
- [ ] （検討項目）retire 宣言テンプレートの新設可否が文書化されている

## 元learning item / 根拠

- **要約**: REQ-0119-025 precedent 形式で REQ-0109-038 を機械的に作成できた。新たな書式設計が不要だったが、この再利用パターンがスキルに文書化されていない。
- **根拠**: REQ-0119-025（REQ-0111 retire 宣言）と REQ-0109-038（REQ-0122 retire 宣言）の書式比較で実証。理由欄・移動先（`docs/requirements/retired/REQ-*.md`）・吸収なし宣言の同一構造を確認。Issue #803 で運用成功。
- **再発条件**: retire 宣言を行う全ケース
- **横展開可能性**: 今後の retire 宣言でほぼ確実に再利用可能。APPEND による宣言形式全般に適用可能

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement, documentation, developer-experience
- **関連Issue**: Issue #803, REQ-0119-025, REQ-0109-038
