---
id: 2026-11-25-pwsh-pipe-stdout-cp932-mojibake-ascii-assertion
created_at: 2026-11-25T09:10:00+09:00
source: case-close (Issue #4223 PR #4226 本文 Findings の回収)
status: unreviewed
---

# pwsh パイプ stdout の cp932 再符号化による mojibake は ASCII 断片一致で回避する

- **問題事象**: pwsh のパイプ stdout が本環境のコンソール規格では cp932 へ再符号化され、node 側の UTF-8 復号で日本語が mojibake した。Bun 自身の出力と bun test が起動する pwsh の出力は正しく復号される
- **発生局面**: PR #4226（case #4223）の検証ドライバ実装（導入先検証 CC1/CC2、2026-11-24〜25 JST）
- **検知方法**: 検証ドライバの stdout アサーションの失敗（日本語断片の復号不一致）
- **根本原因**: パイプ経由の pwsh stdout の cp932 再符号化（`docs/knowledge/windows-powershell-bulk-io-corruption.md` の知見の別面。bulk IO ではなくパイプ stdout 経路）
- **自律対応内容**: 検証ドライバの stdout アサーションを ASCII 断片一致へ変更して回避した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（検証ドライバ実装の観測であり、正規成果物への影響なし）
- **横展開観点**: pwsh を子プロセス起動して stdout を検証する場合は ASCII 断片一致を使う。既存 intake `2026-11-23-powershell-node-stdin-ufffd-corruption`（stdin 経由の U+FFFD）と合わせ、Windows の PowerShell I/O 破損知識への追補候補
- **再発条件**: pwsh パイプ stdout の日本語を node 側で UTF-8 復号してアサーションする場合
- **予防策候補**: windows-powershell-bulk-io-corruption.md へのパイプ stdout 経路の追補
- **想定反映先**: docs/knowledge/windows-powershell-bulk-io-corruption.md
- **関連**: `.agentdev/backlog/intake/inbox/2026-11-23-powershell-node-stdin-ufffd-corruption.md`、PR #4226、Issue #4223
- **タグ**: `#windows` `#pwsh` `#encoding`
