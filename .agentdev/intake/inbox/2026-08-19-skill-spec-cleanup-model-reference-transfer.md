# inspect 系3スキルの cleanup モデル適用経路の skill SPEC への反映要否

## 観測

agentdev-doc-diagnostics、agentdev-req-structure-diagnostics、agentdev-inspect-skills の3 SKILL.md へ document-model L580 cleanup モデルへの適用経路節が追記された（PR 2282）。SKILL.md は原本 SPEC を正とする参照構造を取るため、各 skill SPEC（docs/specs/skills/）へ同一参照を正式反映するかは未確定。

## 今回扱わない理由

Issue 2249（OU-0033）の変更対象成果物は各 SKILL.md に限定。SPEC 側への反映は後続の spec-save / inspect 経路での確定判断とされた（PR 本文 SPEC確定候補の明示）。

## 影響

SKILL.md と skill SPEC の間で cleanup モデル適用経路の記述整合が取られていない状態が続く。

## レビューで決めること

- 3スキルの skill SPEC（docs/specs/skills/agentdev-doc-diagnostics.md 等）へ「cleanup モデルへの適用経路」相当の参照を反映するか

## 根拠

- PR 2282 本文「SPEC確定候補」1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2282）
- SSoT: docs/specs/foundations/document-model.md「恒久基準と非規範情報の整理」（L580 cleanup 実行契約）
