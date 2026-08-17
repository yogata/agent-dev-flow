# ローカル版 agentdev-gh-cli への git CLI 初期化要件の反映先・要否の整理

## 観測内容

ローカル版 agentdev-gh-cli（`src/opencode-local/agentdev-gh-cli/`）の references/ は contracts.md / local-procedures.md / retry.md / verify.md 構成であり standard-procedures.md を持たない。一方 SPEC agentdev-gh-cli.md「ローカル版の扱い」は「git CLI 直接操作の初期化要件はローカル版にも適用する（ローカル版も git 操作を行うため）」と定義するが、local-procedures.md に該当記述がない。ローカル版への git CLI 初期化要件（および委譲時代替配置先）の反映先・要否の整理が必要。

Issue #2140 完了条件1・完了条件3のローカル版部分は、対象パス `src/opencode-local/agentdev-gh-cli/references/standard-procedures.md` が origin/main に実在しないため unmet-by-stale-path として未達記録済み（case-close コメント参照）。投機的な `src/opencode-local/**` の新規作成は実行委任の MUST NOT に従い見送った。

## 影響

- SPEC が適用を定義する要件の実体がローカル版配布物に存在せず、定義と実装の間に空白が残る

## 課題

REQ-009 / DEC-004 の構造判断として、(a) ローカル版へ standard-procedures.md を新設する、(b) local-procedures.md へ git CLI 初期化要件を追記する、のいずれかを要件側で確定する。

## 既存要件・成果物との関連

- 対象: src/opencode-local/agentdev-gh-cli/references/
- SPEC: agentdev-gh-cli.md「ローカル版の扱い」
- 関連: 2026-08-16-spec-cand-ghcli-local-procedures-structure.md（SPEC確定候補、併せて扱うのが自然）
- 発行: Issue #2140 は完了条件 1/3 ティック・2 未達記録でクローズ

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2145 (Issue #2140 / OU-006, Epic #2134 Wave 1) Findings / Capture候補 セクション intake（stale-reference）
- 元 item: intake-2026-08-16-ou006-local-ghcli-git-init-requirements.md
