<!-- ADF-COVERS(implementation): REQ-005-010 -->
# クイックスタート

要件定義からマージまでの標準フロー。要求入口は `req-define`（requirements-driven）と `backlog-auto`（backlog-driven）の 2 つであり、実行は標準実行コマンド `case-auto` へ合流する。

```
/agentdev/req-define    # 要件を壁打ちする
/agentdev/case-auto     # Root Case を確立し、Definition 確定からマージまでを自走する
```

`case-auto` は内部 lifecycle（case-open → case-ready → case-run → case-close）を駆動する。
`case-ready` に相当する Definition 確定は、要件doc（draft）の `artifact_actions` の有無にかかわらず実行される。

## REQ/Decision・Design の保存対象がない場合

バグ修正、保守作業、ドキュメント作業のように要件docに `artifact_actions` がない場合がある。
この場合も内部 lifecycle の Definition 確定をスキップしない。
`/agentdev/req-define` の直後に `/agentdev/case-auto` を実行する。

```
/agentdev/req-define    # 再現手順・修正方針を整理する
/agentdev/case-auto     # Issue 作成からマージまでを自走する
```

## 既存 GitHub Issue から実行する場合

既存 Root Case（GitHub Issue）を入力にする場合も `/agentdev/case-auto` へ Issue番号・URL を指定する。
Root Case の状態と resume_command から通常経路と例外経路が解決される。

## 廃止コマンドの移行案内

v4（DEC-033）では case-open、case-ready、case-run、case-close、case-revise は公開 command ではなく内部 lifecycle 段階へ回収された。旧 case-* コマンドに相当する操作は `/agentdev/case-auto` へ Root Case を指定して実行する。alias は残さない。

## 各コマンドの概要

各コマンドの入出力の詳細は [コマンドリファレンス](../../src/opencode/commands/agentdev/README.md) を参照する。
Definition 確定の詳細は [コマンド選択](command-selection.md) の補足を参照する。

`/agentdev/case-auto` は標準実行コマンドである。`/agentdev/req-define` 完了後の後続工程を一括実行する。標準導線は req-define 完了直後の単一要件doc 処理であり、引数なし時の drafts 全件処理は従来どおりの対象解決として維持する。