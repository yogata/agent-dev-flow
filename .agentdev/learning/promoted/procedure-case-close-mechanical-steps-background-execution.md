# case-close-mechanical-steps-background-execution

## 背景

case-close の機械工程 script（close_mechanical_steps.ts。mergeable ポーリング + traceability + full integrity suite 3 分割 + textlint 最終 gate。実測約 7.5 分）を foreground の bash ツール呼び出しで起動したところ、既定 timeout 120s で tool 呼び出しが切断された（Issue 3548 の case-close で実証）。Windows 環境では打ち切りが子プロセス（bun）の即時 kill を伴わない挙動であり、spawnSync のメモリ捕捉（stdout 捕捉）のみに依存する実行形態では、打ち切りと同時に証跡が失われる。

実証済みの対応: 機械工程の各 gate 出力を `.agentdev/tmp/` 配下の stdout/stderr 分離ファイルへ退避する input を組んだ上で、`(bun script --input in.json > report.json 2> report.err; echo $? > report.exit) &` の形式で背景起動した。tool 呼び出し切断後も bun プロセスが生存して完了し、report.exit の出現で完了を検知して報告 JSON と全 gate 証跡を回収できた。

## 問題

case-close / case-run の機械工程実行手順に、120s を超え得る長時間機械工程の実行形態規律（timeout 明示指定、背景起動+証跡ファイル退避+exit ファイルポーリング）が未規定である。このため実行者が foreground 実行で証跡喪失するリスクを毎回負う。full integrity suite、textlint 全件走査、AUTOGEN 再生成など長時間機械工程全般に適用し得る知見が reference に反映されていない。

## 望ましい変更

case-close / case-run の機械工程実行手順（references または docs/knowledge）に、次の実行形態規律を追記する:

- 長時間機械工程の実行指示には timeout 明示指定（600s 標準）を付与する
- 120s を超え得る機械工程は、背景起動+証跡の stdout/stderr 分離退避+exit ファイルポーリングの実行形態を標準候補とする（`(bun script --input in.json > report.json 2> report.err; echo $? > report.exit) &` 形式）

## 対象範囲

### 対象

- case-close / case-run の機械工程実行手順（references または docs/knowledge）

### 対象外

- close_mechanical_steps.ts 本体の実行方式（spawnSync 構造）の変更
- harness（bash ツール）の timeout 既定値の変更
- 証跡退避の置き場所規約（既存: `.agentdev/tmp/` 配下、cleanup-and-capture.md の退避ファイル掃除と整合）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | case-close / case-run の機械工程実行手順 reference | 長時間機械工程の実行形態規律（timeout 明示+背景起動+分離退避+exit ポーリング）の追記 |
| knowledge（候補） | docs/knowledge/ | harness timeout 切断耐性のある機械工程実行形態の知識文書化候補 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分的）
- **該当ファイル**: `src/common/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md` L89（実測確認。worktree 内退避ファイル〔checker stdout / stderr 分離退避等〕の掃除規定は既存=分離退避の運用実績を裏付けるが、実行形態規律〔背景起動・timeout 明示・exit ポーリング〕の規定は不在。grep: 「背景起動」「timeout 600」表記なし）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 分離退避の掃除規定から分離退避運用の存在は推せるが、実行形態規律（foreground 打ち切り時の子プロセス生存・メモリ捕捉証跡の喪失・背景起動手順）は未規定

## 制約

- Windows 環境の挙動（打ち切りが子プロセスの即時 kill を伴わない）に依存する知見であり、harness 差異がある環境では再検証を要する
- 背景起動中の worktree 操作（remove 等）は実行しない。完了検知（report.exit 出現）後に証跡回収する
- 実行形態は運用候補であり、script 側の非同期実行対応は対象外

## 受け入れ条件

- [ ] 機械工程実行手順に、120s 超過が見込まれる機械工程の timeout 明示指定（600s 標準）が規定されている
- [ ] 背景起動+証跡分離退避+exit ファイルポーリングの実行形態が標準候補として記載されている
- [ ] 既存の退避ファイル掃除規定（cleanup-and-capture.md L89）と矛盾しない

## 元learning item / 根拠

- **要約**: 長時間機械工程は shell 既定 timeout の foreground 実行で打ち切られるため、背景起動と証跡ファイル退避で実行する（エントリ: 「長時間機械工程は shell 既定 timeout の foreground 実行で打ち切られるため背景起動と証跡ファイル退避で実行する」）
- **根拠**: Issue 3548 の case-close で実証（機械工程実測約 7.5 分、foreground で timeout 120s 切断。背景起動+分離退避+report.exit ポーリングで全 gate 証跡を回収）。根本原因は機械工程の所要時間が tool 呼び出し既定 timeout を大きく超えることと、証跡退避がメモリ（spawnSync stdout 捕捉）のみの場合に打ち切りと同時に証跡が失われる構造
- **再発条件**: 長時間機械工程を foreground 実行し、かつ証跡退避がメモリのみの場合
- **横展開可能性**: full integrity suite、textlint 全件走査、AUTOGEN 再生成など 120s を超え得る機械工程全般（case-close / case-run）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: docs
- **関連Issue**: 3548
