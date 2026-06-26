# deprecated ADR-01XX の retired/ 物理配置規則が未確定

## 発生源

- Issue: #1105
- PR: #1108 (merged, squash 1fc14a18)
- 発生日: 2026-06-24

## 観測内容

ADR-0113 は `docs/adr/`（非 `retired/`）に配置されたまま frontmatter `status: deprecated` となっている。既存 IR-025（廃止 ADR path 規則）は ADR-0001〜0099 のみを `retired/` 移動対象とし、ADR-01XX 番台の deprecated ADR の物理配置を扱わない。

PR #1108 は AG-004 判断として ADR-0113 ファイル自体の編集を別 RU（ADR 整理フロー）に切り出すことを確定した。

## 影響

deprecated 状態の ADR-01XX が `docs/adr/` に残留し続ける。IR-036 が `status: deprecated` で検出対象から除外されるため docs-check 上の NG にはならないが、読者が非 deprecated ADR と deprecated ADR を混在して参照する可能性がある。

## 課題

- deprecated な ADR-01XX を `retired/` へ移動するか、現位置（`docs/adr/`）維持とするか
- IR-025 の適用範囲を ADR-0001〜0099 から ADR 全番台へ拡張するか、別規則を新設するか
- ADR lifecycle（REQ-0112）の扱いとして統合するか、独立 Issue とするか

## 既存要件との関連

- IR-025（廃止 ADR path 規則、ADR-0001〜0099 のみ対象）
- IR-036（status flag による機械的除外判定）
- REQ-0112（ADR lifecycle）
- Wave 3「Do NOT edit REQ/ADR files」制約の経緯

## 対応方針候補

- 別 RU（ADR 整理フロー）として、deprecated ADR-01XX の配置規則と IR-025 適用範囲拡張を確定する
