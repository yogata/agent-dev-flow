# traceability check CLI の README 実行例が cwd 解釈で誤動作する

## 観測内容

traceability check CLI の README 実行例 `bun src/check.ts --root .` は、scripts ディレクトリを cwd にして実行すると `--root .` が scripts ディレクトリを指すため誤りとなり、root で走査して欠落検出が静かに不正になる。OU-016（PR #2532 の case-run）で実際に誤検知として検知した。同様の root 相対解釈誤りは check_integrity 実行でも報告があり、root 外へ飛ぶ事象を確認（実行側で修正・対応済み）。

README 例の是正や cwd 依存の排除は配布物変更を伴うため、本バッチ（AG-015 は AGENTS.md 規定追加）の対象外だった。

## 影響

README 実行例に従う利用者が scripts ディレクトリを cwd にした場合、欠落検出が静かに不正になる（エラーにならない）。誤動作に気づきにくい。

## 課題（レビューで決めること）

- README 例への root 明示追記（例: `--root <repo-root>`）または cwd 依存の排除（絶対パス解決）の要否
- 同系の root 相対解釈を持つ他 checker（check_integrity 等）への横展開

## 既存要件・契約との関連

- traceability check CLI（agentdev-traceability の check）、check_integrity 系 checker の root 相対解釈、REQ-050（scripts 公開入口境界）の実行契約記載。

## 根拠

- PR #2532 本文「Findings/ Capture候補」intake 小見出し（回収元: https://github.com/yogata/agent-dev-flow/pull/2532 ）
