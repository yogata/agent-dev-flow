# 検査スキル自身の SKILL.md の未解決リンク（ADF簡素化調査 N-01）

## 観測事実

- `.opencode/skills/repo-agentdev-integrity/SKILL.md` 206行の `[integrity-rule-catalog.md](../../../../docs/designs/integrity-rule-catalog.md)` が未解決。規則カタログの実在位置は `docs/designs/integrity/integrity-rule-catalog.md` で、リンクの深さと中間ディレクトリの両方が実在と一致しない。
- 基準コミット f7860194 にも同一の文とリンクが存在する（2026-08-20 のカタログ移動への編集の追随漏れと推定。原因は仮説）。
- 検出方法: 全774 Markdown ファイルの相対リンク解決の機械検査（2026-11-14 ADF全体簡素化調査、main @ e0f551be）。

## 具体的な修正対象

- 当該リンクの修正（1行）。あわせて、リポジトリ自身の検査器が .opencode 配下の skill 文書の相対リンクを検査対象にしているかの確認（対象外なら再発防止の検査範囲の見直し候補）。

## 関連

- 同一調査の N-02（語彙対照表の3リンク。同一原因と推定）
