# inspect-docs / inspect-skills からの document-model L580 cleanup モデル明示参照検討

## 観測内容

`docs/specs/foundations/document-model.md` L580「## 恒久基準と非規範情報の整理」は cleanup 実行契約として新設されたが、`src/opencode/skills/**` でこれを処置契約として明示的に参照しているスキルは現在存在しない。L580 は inspect-docs / inspect-skills / 専用 cleanup 作業（L584）を想定するが、各 inspect 系スキルが L580 cleanup モデルを明示参照するか、cleanup 実行時に L580 を適用するかは Issue #1847 の「既存参照の整合確認」スコープ外であったため未検証である。

## 影響

- cleanup 実行契約の SSoT（L580 セクション）と実際の cleanup 実行者（inspect 系スキル群）の間の適用経路が未確立

## 課題

次の推奨検討対象について、L580 を処置契約として明示参照するか、cleanup 実行時に L580 を適用するかを検討する:

- `agentdev-doc-diagnostics/`: inspect-docs の cleanup 実行時の明示参照の要否
- `agentdev-req-structure-diagnostics/`: 同上
- `agentdev-inspect-skills/`: 同上
- `agentdev-learning-pipeline/`、`agentdev-intake-pipeline/`: L153 適格性判定を既に参照する両スキルが L580 cleanup 実行契約を併用するか

## 既存要件・成果物との関連

- references: docs/specs/foundations/document-model.md (L580-639, 特に L584)
- L580 セクションは inspect 系 cleanup 実行のための契約 SSoT として機能できる状態にある

## 出典

- 発生日: 2026-07-27
- 発生源: PR #1848 (Issue #1847 / OU-001, Epic #1845 Wave 1)、commit 6eeedabf（spec-save）、025a20a1（OU-001 case-close）
- 元 item: intake-2026-07-27-skills-english-reference-vs-spec-japanese-heading.md
