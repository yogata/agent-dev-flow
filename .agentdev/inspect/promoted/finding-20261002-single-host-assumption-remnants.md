# OpenCode 単一ホスト前提の残存記述（F-05 投影面 + F-06 cli.ts 配置）

- **分類**: inspect finding promote（F-05 投影面・severity low・confidence high / F-06・low・high）
- **由来**: inspect-docs finding 20261002T154006Z（backlog-auto stage 1）

## 観測（evidence・実測確認済み）

- `docs/designs/authoring/vocabulary-registry.md:30`「配布物に含まれる語彙レジストリ（将来追加される場合）は `src/opencode/` 配下に配置し `.opencode/` へ投射する」— 将来追加時の投影記述が OpenCode 単一ホスト前提。DEC-049・accepted Design `multi-host-canonical-model.md:25`（`src/opencode/`、`src/senpi/` をホスト別接続領域として並列）と不整合
- `docs/designs/local/third-party-skill-management.md:81-82`「配置: `src/opencode/tools/agentdev-third-party/cli.ts`」「実行形式: bun `src/opencode/tools/agentdev-third-party/cli.ts`」— 実測: cli.ts は `src/common/tools/agentdev-third-party/cli.ts` に存在（src/opencode/tools/ 配下は Tool 登録面のみ）

## 影響課題

将来の語彙レジストリ追加・Tool 実行形式の参照が誤ったパス・前提に誘導される。DEC-049 決定(1)（共通正本 src/common/ 集約）との矛盾。

## 対応候補

- vocabulary-registry.md:30 の投影記述を multi-host 並列前提（src/common 正本 + ホスト別接続領域）へ更新
- third-party-skill-management.md:81-82 の cli.ts パスを `src/common/tools/agentdev-third-party/cli.ts` へ更新

## 既存要件関連

DEC-049 決定(1)・accepted Design `multi-host-canonical-model.md`

## 統合注記（backlog-review での統合判定候補）

- intake promoted `2026-10-02-3332-local-design-docs-modernization-pending`（local Design 現行化）と同主題（F-06 は当該 intake が明示していない実質新規 delta）。同一バッチ処理を backlog-review で判定。
