# agentdev-gh-tool/tests/tmp-plugin-local-* 6ディレクトリの追跡残渣

## 観測

`src/opencode/plugins/agentdev-gh-tool/tests/tmp-plugin-local-*/` の 6 ディレクトリが git 追跡対象として残っている。

- テスト残渣が release archive の staging に混入する（350 ファイル中に含まれることを PR 2459 で確認）
- main 既存。Epic 2446 Wave 1 が導入したものではない

## 今回扱わない理由

agentdev-gh-tool は Issue 2450 の変更対象成果物外。

## 影響

- リポジトリと配布 archive の清浄性低下（テスト残渣の配布）
- archive の staging サイズ増加

## レビューで決めること

- 6 ディレクトリの削除とテスト残渣の生成抑止（テスト後 cleanup または一時ディレクトリを os.tmpdir 側へ出す変更）の実施要否

## 根拠

- PR 2459 本文「Findings / Capture候補」intake 2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2459 ）
