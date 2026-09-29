# THIRD-PARTY-NOTICES

本リポジトリの配布成果物が依存する third-party 製成果物とライセンス種別を宣言する通知文書である。

## 範囲設定の根拠

依存実体（ビルド成果物、形態素解析辞書等の同梱生成物を含む）は git 管理対象と全配布経路（clone、ソース ZIP、release archive）から除外し、版固定情報（依存宣言と lockfile）の配布と導入手順（`bun install && bun run build:engine`）による導入時生成で解決する。依存実体を配布物へ含めないため、本通知は推移的依存を含めず、直接依存パッケージと特別なライセンス条件を持つ成果物（kuromoji 辞書とその基礎辞書 mecab-ipadic）の宣言で足りる。実体の再配布が発生しない前提の範囲設定であり、実体を再び配布する形態へ変更する場合は本通知の範囲を見直す。

対象は agentdev-textlint-guard plugin の依存（package.json の直接依存 5 パッケージ + kuromoji + mecab-ipadic 辞書）の計 7 成果物である。版欄は時点記録であり、依存更新（bun.lock 変更）時に追従更新する。

## 通知一覧

| 成果物 | 版 | ライセンス種別 | 配布形態 | 出所 |
|---|---|---|---|---|
| @textlint/kernel | 14.8.4 | MIT | 版固定情報のみ（導入時解決） | npm registry（package.json 依存宣言 + bun.lock pin） |
| @textlint/textlint-plugin-markdown | 14.8.4 | MIT | 版固定情報のみ（導入時解決） | npm registry（package.json 依存宣言 + bun.lock pin） |
| @textlint-ja/textlint-rule-preset-ai-writing | 1.7.0 | MIT | 版固定情報のみ（導入時解決） | npm registry（package.json 依存宣言 + bun.lock pin） |
| textlint-rule-preset-ja-technical-writing | 12.0.2 | MIT | 版固定情報のみ（導入時解決） | npm registry（package.json 依存宣言 + bun.lock pin） |
| textlint-rule-prh | 6.1.0 | MIT | 版固定情報のみ（導入時解決） | npm registry（package.json 依存宣言 + bun.lock pin） |
| kuromoji | 0.1.2 | Apache-2.0 | 版固定情報のみ（導入時解決。LICENSE-2.0.txt の同梱条件は依存実体を再配布しないため本リポジトリでは発生しない。導入先で生成した実体を第三者へ再配布する場合は該当ライセンスの条件に従う） | npm registry（直接依存 5 パッケージの形態素解析に必要な依存。bun.lock pin） |
| mecab-ipadic 辞書 | 2.7.0（kuromoji 0.1.2 同梱辞書） | mecab-ipadic 独自ライセンス（著作権表示の複製物包含を要求） | 版固定情報のみ（導入時解決。`bun run build:engine` が node_modules の kuromoji 同梱辞書から `vendor/kuromoji-dict/` へ複製する。導入先での利用が想定範囲であり、実体を第三者へ再配布する場合は著作権表示の複製物包含等の条件に従う） | kuromoji 0.1.2 package 同梱の dict/（基礎辞書は IPA 公開の mecab-ipadic） |

## 更新の手順

依存の追加・更新（package.json の dependencies 変更と bun.lock の pin 変更）を行う場合は、本通知一覧の該当行の版と出所を追従更新する。新しい直接依存の追加時は行を追加し、ライセンス種別を確認する。推移的依存は、その成果物が特別なライセンス条件（実体の再配布条件、辞書の著作権表示等）を持つ場合に限り行を追加する。
