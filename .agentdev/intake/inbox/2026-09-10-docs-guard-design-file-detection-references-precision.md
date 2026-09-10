# intake: check_changed_docs の Design 判定（isDesignFile）の references 配下区別精度改善

- **発生源**: PR #2763（Issue #2758 / Epic #2755 W2）の Findings を回収
- **capture 元**: case-close Epic Wave 2（Epic #2755）
- **captured_at**: 2026-09-10

## 内容

check_changed_docs.ts の `isDesignFile` は `docs/designs/**.md` を Design と判定し references 配下を区別しないため、references 配下の新規ファイル（perspective-registry.md 等）で `design_readme_update_required: true` が立つ。Design README 規約（references は独立行登録しない・親行で言及）と checker 判定の乖離があり、references 配下を区別する判定精度の改善候補。

## 補足

- 実運用では保守的フラグとして親 Design 行言及追加で対応済み（誤 pass ではなく過剰検出）。規約側を正として checker 判定に references 除外を追加するか、現行の保守的挙動を仕様として明記するかを intake-promote の review で判定すること
