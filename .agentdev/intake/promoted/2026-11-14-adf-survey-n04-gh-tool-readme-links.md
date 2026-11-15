# 配布物 README の未解決リンク2件（ADF簡素化調査 N-04）

## 観測内容

- `src/opencode/plugins/agentdev-gh-tool/README.md` の `../../../docs/guides/consumer-project-setup.md` と `../../../skills/agentdev-issue-management/references/issue-operation-safety.md` の2リンクが、このリポジトリの配置では解決しない。
- `scripts/install.ps1` に docs/ を配布先へ複製する対応は確認できなかった（未確認事項）。

## 影響

- 配布物 README の参照リンクが consumer 環境で解決しない可能性が残る（consumer 配置での解決可否が未確認）。解決する場合は誤検出、しない場合は配布時の複写と参照の不一致の是正対象。IR-055 の導入先未解決参照検出がこの形式（相対 Markdown リンク）を検出対象にしているかも未確認。

## 課題

- consumer 環境の配置で解決するかの確認が前提。解決する場合は誤検出として扱う。解決しない場合は配布時の複写の対応と参照の不一致の是正。
- IR-055 の導入先未解決参照検出がこの形式（相対 Markdown リンク）を検出対象にしているかも未確認。

## 既存要件との関連

- 2026-11-14 ADF全体簡素化調査 13 §3（候補 C-04 に類する配布境界の観点）
