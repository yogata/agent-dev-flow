# distribution-boundary-guard の over-block（リポジトリ外パスへの書き込み block）

## 観測

既存 Stage B pre-write guard（`.opencode/plugins/distribution-boundary-guard`）は、契約上の対象が src/opencode 配下の分散テキスト成果物であるにもかかわらず、リポジトリ外パス（TEMP 直下の PR 本文ドラフト等）への producer 内部 ID を含む書き込みも block した（over-block）。

## 今回扱わない理由

PR 2434（OU-003）は Custom Tool・Plugin/Hook の新配布種別の実装が対象であり、既存 guard プラグインのパス分類修正はスコープ外。over-block は誤検出ではあるが安全側の誤作動（fail-closed 方向）であり、即時の危険はない。

## 影響

委譲実行担当が worktree 隔離境界の代替配置先（TEMP 直下）へ PR 本文ドラフトを書き出す際に guard が block する場合、委譲の WRITE 手続きが中断し、リトライ・回避のオーバーヘッドが発生する。

## レビューで決めること

- guard のパス分類を src/opencode 配下の対象スコープへ狭める修正の実施要否
- over-block 発生時の回避手順（対象外パスの明示的な許容手段）を Design に記載するか

## 根拠

- PR 2434 本文「Findings / Capture候補」intake 2件目
- .opencode/plugins/distribution-boundary-guard（既存 guard）
