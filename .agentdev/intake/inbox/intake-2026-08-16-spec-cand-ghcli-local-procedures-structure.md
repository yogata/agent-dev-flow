# Intake Item: SPEC確定候補 — agentdev-gh-cli SPEC のローカル版参照実体の明示

## 発生源

- PR: #2145 (Issue #2140 / OU-006, Epic #2134 Wave 1)
- 発生 phase: case-close Step 3-2 SPEC 確定フロー（パターン (c) 見送り、後続へ委ねる記録）
- capture 分類: intake（SPEC 更新候補。`## SPEC確定候補` 由来。`## Findings / Capture候補` とは区別）

## 問題

SPEC agentdev-gh-cli.md「WRITE 手続きの Windows encoding 初期化必須化（REQ-011-009）」は、ローカル版の参照実体が standard-procedures.md ではなく local-procedures.md である構成を「ローカル版の扱い」節で明示していない。また「委譲時の一時ファイル代替配置先」節のローカル版への適用可否も未定義。

## 推奨対応

spec-save 経由で (1) ローカル版 references の実体構成（local-procedures.md 構成）の明示、(2) 委譲時代替配置先のローカル版適用可否の定義、を SPEC へ反映する。ローカル版への要件反映先の構造判断（intake-2026-08-16-ou006-local-ghcli-git-init-requirements.md）と併せて扱うのが自然。

## 関連

- Issue: #2140 (CLOSED、完了条件 1/3 ティック・2 未達記録), Epic: #2134
- PR: #2145 (SPEC確定候補 セクション)
