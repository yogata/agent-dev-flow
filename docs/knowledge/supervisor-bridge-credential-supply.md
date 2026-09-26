---
title: Supervisor 環境での credential 供給ブリッジ（ocenv と opencode bridge shim）
created: 2026-09-23
updated: 2026-09-23
---

# Supervisor 環境での credential 供給ブリッジ（ocenv と opencode bridge shim）

## 知識内容

Supervisor（Hermes 等、spawn する子プロセスから provider 資格情報を削除する実行環境）から dispatch された opencode 実行では、AI_GATEWAY_API_KEY 等の provider 資格情報が子プロセスへ供給されず、`agentdev_jev evaluate` が構造化失敗（not_configured 区分）を返すようになる。この問題への対処原則は「Supervisor から env で配る」ではなく「実行側が自身の起動コンテキストで取得する」（2026-09-23 ユーザー合意）であり、その橋が実行環境ブリッジ道具である（REQ-091）。正本は `scripts/self/supervisor-bridge/` 配下の `ocenv`（merge wrapper）と `opencode`（bridge shim）である。Supervisor 側の scrub 設計は credential を env で配らない正しいセキュリティ境界であり、変更しない。

機構は次のとおりである。

1. `ocenv` は powershell.exe -NoProfile から .NET `RegistryKey.GetValue` により HKCU\Environment（Windows User スコープ）の変数を列挙し、現在の環境で未設定の変数のみを自身の環境へ export して指定コマンドを exec する。既設定の変数は値を確認せず保持する（Supervisor や shell 設定が与えた値が優先される）。Machine スコープは読まない（システム既定の環境合成は OS が行う）。
2. `opencode` bridge shim は opencode コマンド解決を横取りし、`exec` で同一ディレクトリの `ocenv` 経由により opencode 本体を起動する。起動先の本体パスは調整点（`OPENCODE_BODY` 変数、既定 `$HOME/.bun/bin/opencode`）として明示する。
3. 導入環境では正本配置物を PATH 上の優先ディレクトリ（実証済みは `~/bin` 先頭配置）へ置き、Supervisor の spawn コンテキストで `opencode` の解決先が shim になることで、scrub された環境でも credential が供給される。

ocenv の供給範囲と注意:

- 供給範囲は「現在の環境で未設定の HKCU\Environment 変数の全て」であり、AI_GATEWAY_API_KEY のような Jev 関連の credential クラスに限定しない。AI_GATEWAY_API_KEY 以外の credential（provider API key、トークン等）を User スコープに正本化すれば、同じ機構で供給される。
- 変数を追加する場合の注意: HKCU\Environment は当該ユーザーの全プロセスから読めるため、格納できるのは「ユーザー自身の権限境界で保護される値」である。Machine スコープへ置くと全ユーザーへ公開されるため credential の格納先としては使わない。供給範囲を特定の変数に絞りたい環境では、ocenv を fork して allowlist（許可変数名のリスト）で列挙結果を絞る実装を記録的代替として採れる（正本の既定は全未設定変数の供給であり、allowlist 化は導入環境側の判断である）。
- REG_EXPAND_SZ の展開の扱い: 列挙は `RegistryValueOptions.None` で値を取得し、REG_EXPAND_SZ 値の `%VAR%` 参照は展開して供給する。これは Windows がプロセス起動時にユーザー環境を合成する際の展開挙動と同等である。展開前の生文字列は供給しない。`%VAR%` を含む値を正本化する場合は展開後の値が供給される点を踏まえる。
- 空文字列が設定された変数の扱い: レジストリ側の値が空文字列の場合も「設定あり」として供給する（空文字列は unset と区別される）。現在の環境で空文字列が設定済みの変数は既設定扱いとし、レジストリ値で上書きしない（POSIX では空文字列の環境変数は設定済みである）。
- 列挙失敗時は fail-closed である（対象コマンドを実行せず終了コード 1）。部分的な環境での実行による静かな `not_configured` 劣化を避けるためである。列挙結果はディスクへ書かず、1エントリ = 1 base64 行のプロセス間通信で受け渡し、生の credential 値は stdout に出力しない。

運用手順、失敗署名、検証手順の操作面は導入ガイド（[docs/guides/supervisor-credential-bridge.md](../guides/supervisor-credential-bridge.md)）が正であり、本書と重複する部分は相互参照に留める。

秘密値不在の検証手順（REQ-091-005）: ブリッジ成果物、マニュアル、知識文書、索引は credential 本体（秘密値）を含まない。作成・更新した成果物のファイル集合を対象に、credential 本体を示す文字列パターン（`sk-` 等の provider key プレフィックス、`ghp_` / `github_pat_` / `xoxb-` / `AKIA` 等の既知 token プレフィックス、base64 風の 40 字以上の長列、高エントロピーなランダム文字列）で検索し 0 件を確認する。変数名（AI_GATEWAY_API_KEY 等の名前そのもの）、配置場所、手順の記述は対象外である。

## 適用条件

- Supervisor（credential を env で配らない実行環境）から dispatch された Windows 上の opencode 実行で、`not_configured` 劣化または credential 欠落が疑われる場合。
- 新規環境でブリッジ道具を導入する場合、または opencode 本体の更新・PATH 変更後に導入検証をやり直す場合。
- AI_GATEWAY_API_KEY 以外の credential を User スコープから実行コンテキストへ供給したい場合。

## 適用対象

- `scripts/self/supervisor-bridge/`（ocenv、opencode bridge shim）の運用と導入（REQ-091-001、REQ-091-002）。
- 導入マニュアル（docs/guides/supervisor-credential-bridge.md）と知識文書（本書）の維持（REQ-091-003、REQ-091-004）。
- Jev 先行評価（REQ-090、DEC-040）の `agentdev_jev evaluate` の構造化失敗応答の区分読み分け（not_configured 区分と API failure 区分の区別）。

## 根拠

- Issue #3080（REQ-091: Supervisor 環境向け credential 供給ブリッジの正本管理）。credential 供給の原則「実行側が自身の起動コンテキストで取得する」の 2026-09-23 ユーザー合意を含む。
- REQ-091（要件行 001〜006）と REQ-050-009（実行環境ブリッジ道具の `scripts/self/` 配下配置）。Design は docs/designs/local/runtime-package-boundary.md（release archive に supervisor-bridge/ が構造的に含まれない境界）。
- 導入検証の実測（Case #3080 の case-run 完了報告、PR 検証差分セクション）: scrub 模擬環境（`env -u AI_GATEWAY_API_KEY`）での変数 SET 実測、Supervisor spawn コンテキストでの `command -v opencode` 解決先確認、実 Workflow での `agentdev_jev evaluate` の構造化失敗応答に not_configured 区分が出現しないことの確認。

## 関連知識

- [Windows PowerShell の一括読み書きによる UTF-8 ファイル破壊リスク](windows-powershell-bulk-io-corruption.md)。powershell.exe 経由の出力受け渡しでのコンソールコードページ（cp932）再解釈の隣接リスク。ocenv の列挙は base64（ASCII）のみを stdout に流すことでこの系統を回避する。
- [checker CLI の stdout ロス（Windows + bun）と encoding 破壊の区別](checker-cli-stdout-loss-on-windows-bun.md)。Windows 環境でのプロセス間出力受け渡しの隣接知識。
