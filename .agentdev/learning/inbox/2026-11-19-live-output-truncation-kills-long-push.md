---
id: learn-20261119-live-output-truncation-kills-long-push
created_at: 2026-11-19
source: case-close capture (PR #4160)
status: inbox
---
# 実行中ネイティブコマンド出力の Select-Object -First による絞り込みが長時間 push プロセスを途中強制終了させ障害検出を遅らせた

- 問題事象: 実行中の git push（pre-push フック内で全量テストを実行するため 30〜40 秒かかる）のライブ出力を PowerShell パイプで Select-Object -First により絞り込んだところ、パイプ後段の切断で push プロセスが途中強制終了した。フックの実行結果・出力が失われ、障害検出（フック内インシデントの観察）が遅れた
- 発生局面: case-run（Issue 4155・Case 4150 Wave-3。第 1 回 push の出力観察時）
- 検知方法: push プロセスの途中終了と出力消失の観察
- 根本原因: PowerShell パイプの後段コマンド（Select-Object -First）が先頭 N 件取得後にパイプラインを閉じるため、前段のネイティブコマンドの stdout 書込みが壊れる（broken pipe 相当）。長時間実行コマンドの stdout をライブパイプで絞る運用はプロセス打ち切りを誘発する
- 自律対応内容: ライブパイプでの絞り込みを廃止し、cmd /c によるリダイレクト（stdout/stderr の分離ファイル退避）で全量取得する方式へ切替。以降の push・検証実行は全量退避後にファイルから読む運用へ統一
- ユーザー確認有無: なし（運用改善として case-run 内で確定）
- Decision/REQ/spec 影響: なし（運用規律。AGENTS.md の PowerShell 一括 I/O 破壊回避指針〔リダイレクト演算子の cp932 再符号化〕と併せて、検証証跡退避は spawnSync + fs.writeFileSync の UTF-8 明示書出しが正となる）
- 横展開観点: 「長時間実行コマンドの出力をライブパイプで絞る」運用は全般的にプロセス打ち切りを誘発する。証跡が必要な実行は cmd /c リダイレクトまたは spawnSync 分離取得で全量退避し、絞り込みは退避ファイルの読み取り側で行う
- 再発条件: pre-push フック等の長時間ネイティブコマンドの出力を PowerShell パイプで絞り込む場合
- 予防策候補: 検証コマンド実行の証跡退避形式（spawnSync + UTF-8 明示書出し、stdout/stderr 分離）をフック・検証実行を含む全場面へ適用する
- 想定反映先: docs/knowledge/windows-powershell-bulk-io-corruption.md（ライブパイプ絞り込みによるプロセス打ち切りの知識追記候補）
- 関連: Case 4150、Issue 4155、PR 4160（Findings F1 の併記運用学び）
- タグ: PowerShell、ライブパイプ、プロセス打ち切り、証跡退避、運用改善
