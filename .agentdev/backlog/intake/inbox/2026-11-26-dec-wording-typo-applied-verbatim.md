---
id: 2026-11-26-dec-wording-typo-applied-verbatim
created_at: 2026-11-26T22:50:00+09:00
source: case-open (Root Case #4227 の自工程 deviation capture)
status: unreviewed
---

# 設計PR #4228 の Definition 適用内容に誤記「其余」が verbatim 適用されている

- **課題**: 要件ドラフト由来の文言「其余」（日本語として正しくない表現）が verbatim 適用契約によりそのまま配信された。対象は PR #4228 の docs/decisions/DEC-071.md 11 行目（frontmatter reason）と docs/decisions/DEC-069.md 8 行目（frontmatter supersede_note）の「第3項の其余の非移設対象は維持する」
- **期待する処分**: 次回の Definition 変更（case-revise 経由）や文言品質修正の機会に正しい日本語表現へ修正するか、文意が通じるとして維持するかを判断する
- **出典**: Root Case #4227 の case-open 実行（2026-11-26、機械工程 60 編集の verbatim 適用と事後突合）
- **実証根拠**: worktree .worktrees/4227-definition の当該 2 ファイルの grep 実測（「其余」2 件）。機械工程は draft の oldText/newText をそのまま適用するため上流誤記が混入する
