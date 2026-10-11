---
title: 長時間機械工程の背景起動実行形態（timeout 切断耐性と証跡の stdout/stderr 分離退避）
created: 2026-10-11
updated: 2026-10-11
---

# 長時間機械工程の背景起動実行形態（timeout 切断耐性と証跡の stdout/stderr 分離退避）

## 知識内容

case-close / case-run の機械工程 script（close_mechanical_steps.ts 等の mergeable ポーリング + traceability + full integrity suite 3 分割 + textlint 最終 gate。実測約 7.5 分）を foreground の bash ツール呼び出しで起動すると、既定 timeout 120s で tool 呼び出しが切断される。Windows 環境では打ち切りが子プロセス（bun）の即時 kill を伴わない一方、spawnSync のメモリ捕捉（stdout 捕捉）のみに依存する実行形態では、打ち切りと同時に証跡が失われる。

長時間機械工程の標準候補の実行形態は次のとおりである。

1. **timeout 明示指定**: 長時間機械工程の実行指示には timeout 明示指定（600s 標準）を付与する。
2. **背景起動 + 証跡分離退避 + exit ポーリング**: 120s を超え得る機械工程は、背景起動 + 証跡の stdout/stderr 分離退避 + exit ファイルポーリングの実行形態を標準候補とする。具体形式は `(bun script --input in.json > report.json 2> report.err; echo $? > report.exit) &`。tool 呼び出し切断後も bun プロセスが生存して完了し、report.exit の出現で完了を検知して報告 JSON と全 gate 証跡を回収できる。
3. **背景起動中の worktree 操作禁止**: 背景起動中の worktree 操作（remove 等）は実行しない。完了検知（report.exit 出現）後に証跡を回収する。

制約: 本実行形態は Windows 環境の挙動（打ち切りが子プロセスの即時 kill を伴わない）に依存する知見であり、harness 差異がある環境では再検証を要する。証跡退避の置き場所規約は既存（`.agentdev/tmp/` 配下、cleanup-and-capture.md の退避ファイル掃除規定と整合）。script 側の非同期実行対応は対象外の運用候補である。

## 適用条件

- 長時間機械工程を foreground 実行し、かつ証跡退避がメモリ（spawnSync stdout 捕捉）のみの場合。
- 機械工程の所要時間が tool 呼び出し既定 timeout（120s）を超え得る場合。
- case-close / case-run で full integrity suite、textlint 全件走査、AUTOGEN 再生成等の長時間検証を実行する場合。

## 適用対象

- case-close / case-run の機械工程実行手順（references または docs/knowledge で規律を記載する場所）。
- spawnSync 経由で gate を起動して報告 JSON を組み立てる機械工程 script の実行形態。
- 120s を超え得る検証実行全般（integrity suite 分割、textlint 最終 gate、AUTOGEN 再生成）。

## 根拠

- Issue 3548 の case-close で実証: 機械工程実測約 7.5 分、foreground で timeout 120s 切断。背景起動 + 分離退避 + report.exit ポーリングで全 gate 証跡を回収した。
- `src/common/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md` L89: worktree 内退避ファイル（checker stdout / stderr 分離退避等）の掃除規定が既存で、分離退避運用の実績を裏付ける。実行形態規律（背景起動・timeout 明示・exit ポーリング）の規定は本知識化時点で不在。
- learning promoted procedure-case-close-mechanical-steps-background-execution（backlog-review 2026-10-11 で知識化）。

## 関連知識

- [Windows + bun test の spawn timeout 由来分類と単独再実行手順](windows-bun-test-spawn-timeout-classification.md)（bun test 内部の既定 5s timeout 由来分類。本知識は tool 呼び出し切断耐性の階層で別現象）。
- [temp 領域デバッグ残渣の削除基準と provenance 記録](temp-file-debug-residue-cleanup-criteria.md)（退避ファイルの削除基準・provenance）。
- [worktree 環境差 fail の由来分類](worktree-environment-fail-classification.md)（実行形態知見の関連）。
