# SPEC と command 定義の Step 番号ずれ解消

## 観測

複数の SPEC と command 定義で Step 番号がずれている。req-define.md（SPEC は Step 4、command は Step 5 で 1 オフセット）、case-close.md（SPEC は Step 0-7、command は Step 1-8）。番号再構成には全 Step 番号の再採番が必要で、各 Issue のスコープを超えるため別 Issue での扱いが推奨された。

## 根拠

PR #1103（req-define 効率化）:

> - **SPEC と command の Step 番号ずれ（既存）**: SPEC `docs/specs/commands/req-define.md` は「Step 4: 要件展開（4-1〜4-5）」、command は「Step 5: 要件展開（5-1〜5-5）」と番号が 1 ずれている（SPEC が Step 0=セッションコンテキスト検知を独立番号扱いするため）。本 Issue は内容で「Step 4-1=変更影響候補抽出=command Step 5-1」「Step 4-4=ADR要否確認ゲート=command Step 5-4」と特定し整合を取った。番号ずれ自体は既存の表記慣行であり本 PR では修正していない。必要なら別 Issue で SPEC/command 番号の統一を検討可。

PR #1200（align command SPEC Step numbering）:

> 本 PR では是正せず（SCOPE 外）。是正には command 側 Step 4-0 を Step 4-1 へ、後続 Step 4-1/4-2/4-3 を +1 シフトする必要がある。別 Issue で扱うべき。

> このずれは Step 0 起因ではなく、SPEC が非連番（Step 9-1 から Step 15 への jump）を持つ構造的問題。是正には SPEC の全 Step 番号を command の連番構造へ再構成する必要があり、本 Issue の「Step 0 扱い」スコープを超える。別 Issue で扱うべき。
