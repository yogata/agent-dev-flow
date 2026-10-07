# 委譲文脈の索引自動生成Designへの参照パスを正す

## 内容

#3511 の委譲文脈で、索引自動生成Designの参照を `foundations/references/index-auto-generation.md` と記載したが、実体は `docs/designs/integrity/index-auto-generation.md` である。

## 影響

委譲先が存在しない参照先を探索する。文脈生成側の参照パス揺れとして整理が必要。

## 提案

委譲文脈生成側の正規参照と実在確認を見直す。Design本文自体は変更しない。

## 根拠

ユーザーの再開指示で保存対象として明示された #3511 委譲結果の観測。PRのない verify-only SSoT コメントをCapture入力源として流用したものではなく、ユーザーからの手動入力として受領した。

関連: Epic #3507、子Issue #3511、DEL-3507-CLOSE-1。
