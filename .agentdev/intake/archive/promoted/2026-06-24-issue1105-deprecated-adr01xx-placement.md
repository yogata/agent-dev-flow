# deprecated ADR-01XX の物理配置規則が未確定（retired/ 移動 vs 現位置維持）

## 発生源

- Issue: #1105
- PR: #1108 (merged, squash 1fc14a18)
- 発生日: 2026-06-24

## 観測

ADR-0113 は `docs/adr/`（非 `retired/`）に配置されたまま frontmatter `status: deprecated` となっている。既存の IR-025（廃止 ADR path 規則）は ADR-0001〜0099 のみを `retired/` 移動対象とし、ADR-01XX 番台の deprecated ADR の物理配置を扱わない。

## 今回扱わない理由

PR #1108 は AG-004 判断として、ADR-0113 ファイル自体の編集（`retired/` 移動、Decision セクション再分類）を別 RU（ADR 整理フロー）に切り出すことを確定した。本 PR は ADR-0113.md を編集せず、IR-036 の `status` flag による機械的除外判定のみを SPEC 化した（ファイル編集決定と独立して機能）。Wave 3「Do NOT edit REQ/ADR files」制約の経緯とも整合。

## 影響

deprecated 状態の ADR-01XX が `docs/adr/` に残留し続ける。IR-036 が `status: deprecated` で検出対象から除外されるため docs-check 上の NG にはならないが、読者が `docs/adr/` 内で非 deprecated ADR と deprecated ADR を混在して参照する可能性がある。

## レビューで決めること

- deprecated な ADR-01XX を `retired/` へ移動するか、現位置（`docs/adr/`）維持とするか
- IR-025 の適用範囲を ADR-0001〜0099 から ADR 全番台へ拡張するか、別規則を新設するか
- ADR lifecycle（REQ-0112）の扱いとして統合するか、独立 Issue とするか

## 根拠

PR #1108 本文「AG-004 decision」「Findings / Capture候補」セクション。AG-004 は ADR-0113 編集を「別 RU（ADR 整理フロー）に切り出す」と確定し、本 intake は別 RU の起点となる作業候補。
