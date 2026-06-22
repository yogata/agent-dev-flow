# oh-my-openagent CLI の prompt 引数仕様（位置引数必須・標準入力不可）

## 観測

`bunx oh-my-openagent run` で prompt を標準入力で渡すと `error: missing required argument 'message'` で即時失敗する。prompt は位置引数で渡す必要がある。Windows 環境では標準入力パイプのハングアップリスクも併存。

## 影響

- `references/oh-my-openagent.md` の起動スクリプト例や driver 引き継ぎプロンプトで「prompt を標準入力で渡す」記述が残っている場合、case-run 実行担当が同様のトラップに陥る
- bunx → npx フォールバック経路はモジュール解決エラー時のみを想定しており、引数仕様起因のエラーはフォールバック対象外

## 課題

- `references/oh-my-openagent.md` の起動例で prompt を位置引数で渡す形式に統一するか
- 「`--help` で必須引数を事前確認」を SKILL（agentdev-case-run-execution-adapter）の標準起動前チェックに追記するか
- Windows 環境での標準入力パイプ使用を禁止し、位置引数・`--prompt-file` 等の代替に統一するか

## 既存要件との関連

- 改善対象 SKILL: `src/opencode/skills/agentdev-case-run-execution-adapter/references/oh-my-openagent.md`
- ADR-0114・ADR-0128（oh-my-openagent 選定・導入）

## 根拠

- 元 inbox item: `2026-06-21-issue971-oh-my-openagent-cli-arg-spec.md`
- Issue #971
