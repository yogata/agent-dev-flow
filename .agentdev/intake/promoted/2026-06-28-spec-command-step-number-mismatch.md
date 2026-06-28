## 観測内容
PR #1103（req-define 効率化）および PR #1200（align command SPEC Step numbering）で複数の SPEC と command 定義で Step 番号がずれていることが確認された。

- `docs/specs/commands/req-define.md` の SPEC は「Step 4: 要件展開（4-1〜4-5）」、command 定義は「Step 5: 要件展開（5-1〜5-5）」で 1 オフセット（SPEC が Step 0=セッションコンテキスト検知を独立番号扱いするため）
- `case-close.md` の SPEC は Step 0-7、command は Step 1-8 でずれあり
- PR #1200 指摘: このずれは Step 0 起因ではなく、SPEC が非連番（Step 9-1 から Step 15 への jump）を持つ構造的問題

番号再構成には全 Step 番号の再採番（command 側 Step 4-0 を Step 4-1 へ、後続 Step 4-1/4-2/4-3 を +1 シフト等）が必要で、各 Issue のスコープを超えるため別扱い推奨された。

## 影響
ドキュメント整合性に直結し、SPEC と command 定義の対応付けに混乱を招く。既存の表記慣行として認識されているが、整合性観点で是正推奨。

## 課題
SPEC と command 定義の Step 番号を統一する。是正には SPEC の全 Step 番号を command の連番構造へ再構成する必要があり、複数ファイルを対象とする docs_chore 作業となる。

## 既存要件との関連
- IR-044（Step number warning 検出）
- command-file-format SPEC（Step 一致原則）
