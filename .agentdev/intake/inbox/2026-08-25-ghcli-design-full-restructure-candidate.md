# agentdev-gh-cli Design の段階的再編（Custom Tool 操作契約への一本化）

## 観測

docs/designs/skills/agentdev-gh-cli.md には gh CLI 手続き委譲時代の構成が残存する（操作契約表が gh 手続きベース、docs/designs/responsibilities/custom-tool-contracts.md と一部二重）。PR 2441 では差し替え可能性・検出スコープの新方式整合のみ実施され、全面再編は未実施。

## 今回扱わない理由

全面再編（Custom Tool 操作契約への一本化）は backlog 候補として PR 2441 本文が申し送りした案件。case-close の Design 確定チェック（最小限の確定事項反映）の範囲を超える構造変更であり、個別要件化（req-define 経由）で扱う。

## 影響

agentdev-gh-cli Design と custom-tool-contracts Design の記述二重が残存する（内容矛盾ではなく、詳細度の偏在）。配布物実装には影響なし（Tool 実装は操作契約 Design 側が正）。

## レビューで決めること

- 再編の方式（agentdev-gh-cli Design の縮退・廃止、custom-tool-contracts Design への集約方法）と要件化の優先度

## 根拠

- PR 2441 本文「Design確定候補」2項目
- case-close Design 確定チェック結果（Issue 2439 対応記録コメント、見送り理由記録）
