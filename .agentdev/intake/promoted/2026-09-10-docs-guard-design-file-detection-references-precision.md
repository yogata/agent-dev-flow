# check_changed_docs の Design 判定（isDesignFile）の references 配下区別精度改善

## 観測内容

- 発生源: PR 2763（Issue 2758 / Epic 2755 W2）の Findings を回収
- capture 元: case-close Epic Wave 2（Epic 2755）
- captured_at: 2026-09-10

check_changed_docs.ts の `isDesignFile` は `docs/designs/**.md` を Design と判定し references 配下を区別しないため、references 配下の新規ファイル（perspective-registry.md 等）で `design_readme_update_required: true` が立つ。Design README 規約（references は独立行登録しない・親 Design 行の備考欄で言及。docs/designs/README.md の登録手順節）と checker 判定の乖離がある。

## 影響・課題

- 実運用では保守的フラグとして親 Design 行言及追加で対応済み（誤 pass ではなく過剰検出）
- 過剰検出が運用ノイズとして継続する

## 後続判断に残る選択肢

- 規約側を正として checker 判定に references 配下除外を追加する
- 現行の保守的挙動を仕様として明記する（targeted-docs-guard-implementation 系の契約に追記）

## 既存要件・契約との関連

- REQ-010（自己監査コマンド docs-check）
- docs/designs/integrity/targeted-docs-guard-implementation.md
- docs/designs/README.md（references 登録規約）
