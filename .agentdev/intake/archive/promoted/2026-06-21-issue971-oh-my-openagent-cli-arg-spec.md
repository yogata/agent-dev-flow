# oh-my-openagent v4.12.1 CLI 引数仕様（prompt 渡し）

## 観測

PR #977（Issue #971 OU-013 case-run 手順）の実行過程で `bunx oh-my-openagent run` の起動を検証した際、prompt を標準入力で渡すと `error: missing required argument 'message'` で即時失敗することを確認した。prompt は位置引数で渡す必要がある。OU-013 では本件の事後処理として「直接実装に切り替え」を選択し、SKILL にタイムアウト事後処理手順を新設した。

## 影響

- `references/oh-my-openagent.md` の起動スクリプト例や driver 引き継ぎプロンプトで「prompt を標準入力で渡す」記述が残っていた場合、case-run 実行担当が同様のトラップに陥る。
- Windows 環境では標準入力パイプのハングアップリスクも併存する（従来から観察要点）。
- bunx → npx フォールバック経路（OU-013 で新設）は、モジュール解決エラー時のみを想定しており、引数仕様起因のエラーはフォールバック対象外。

## レビューで決めること

- `references/oh-my-openagent.md` の起動例で prompt を位置引数で渡す形式に統一するか。
- 「`--help` で必須引数を事前確認」を SKILL（agentdev-case-run-execution-adapter）の標準起動前チェックに追記するか。
- Windows 環境での標準入力パイプ使用を禁止し、位置引数・`--prompt-file` 等の代替に統一するか。

## 根拠

- PR #977: https://github.com/yogata/agent-dev-flow/pull/977 (Issue #971 / バッチC OU-013 case-run 手順)
- Issue #971: https://github.com/yogata/agent-dev-flow/issues/971
- 改善対象 SKILL: `src/opencode/skills/agentdev-case-run-execution-adapter/references/oh-my-openagent.md`
- 関連学習: 本 Issue の learning inbox エントリ「ハーネスタイムアウト事後処理の実証」
