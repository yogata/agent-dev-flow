# agentdev-gh-cli SPEC のローカル版参照実体の明示（SPEC確定候補）

## 観測内容

SPEC agentdev-gh-cli.md「WRITE 手続きの Windows encoding 初期化必須化（REQ-011-009）」は、ローカル版の参照実体が standard-procedures.md ではなく local-procedures.md である構成を「ローカル版の扱い」節で明示していない。また「委譲時の一時ファイル代替配置先」節のローカル版への適用可否も未定義である。

## 影響

- ローカル版利用環境において手続き参照の解決先が SPEC 上不明確であり、委譲時の一時ファイル運用の適否が判断できない

## 課題

spec-save 経由で (1) ローカル版 references の実体構成（local-procedures.md 構成）の明示、(2) 委譲時代替配置先のローカル版適用可否の定義、を SPEC へ反映する。ローカル版への要件反映先の構造判断（2026-08-16-ou006-local-ghcli-git-init-requirements.md）と併せて扱うのが自然。

## 既存要件・成果物との関連

- SPEC: agentdev-gh-cli.md「ローカル版の扱い」「委譲時の一時ファイル代替配置先」各節
- 関連: 2026-08-16-ou006-local-ghcli-git-init-requirements.md（構造判断候補）
- 発行: Issue #2140 は完了条件 1/3 ティック・2 未達記録でクローズ

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2145 (Issue #2140 / OU-006, Epic #2134 Wave 1) SPEC確定候補 セクション
- 元 item: intake-2026-08-16-spec-cand-ghcli-local-procedures-structure.md
