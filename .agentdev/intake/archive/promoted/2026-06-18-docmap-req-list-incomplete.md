# docs/DOC-MAP.md の REQ 一覧が REQ-0133 までで停止し REQ-0134/0135/0136 が未掲載

## 観測

Issue #900 (RU-3) の実装で `docs/DOC-MAP.md` を確認したところ、REQ 一覧表が REQ-0133 までしか記載しておらず、REQ-0134 / REQ-0135 / REQ-0136 が未掲載であることを発見した。これは PR #911 (Issue #898) / PR #912 (Issue #899) でも未修正の既存不備。本 PR #913 では対象の REQ-0102 行のみ更新し、REQ-0134〜0136 の追加は scope 外として見送った。

## 影響

- DOC-MAP の REQ 一覧が実ファイル（`docs/requirements/REQ-*.md`）と乖離しており、REQ-0136-002（定量的データ検証: 文書記載レンジと実ファイルの照合）に抵触する可能性がある
- ナビゲーション用途で DOC-MAP から REQ-0134/0135/0136 に到達できない

## レビューで決めること

- DOC-MAP REQ 一覧表へ REQ-0134 / REQ-0135 / REQ-0136 の行を追加するか（maintenance / docs_chore）
- あわせて AGENTS.md の REQ レンジ記載（"REQ-0101〜REQ-0135"）も REQ-0136 含めに更新するか

## 根拠

- PR #913: https://github.com/yogata/agent-dev-flow/pull/913 (Findings / Capture候補)
- Issue #900: https://github.com/yogata/agent-dev-flow/issues/900
- Epic #896: REQ-0136 (REQ/SPEC/ADR 適正運用の自動化)
- 関連: REQ-0136-002 (定量的データ検証)
