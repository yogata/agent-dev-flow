# 配布 skill 間の正本参照を backtick パス（リンクなし）で記述する運用の明文化

## 観測内容

- OU-006（Issue #4059、PR #4065）で adversarial-review-integration.md の正本1本化を実施した際、正本から参照側ファイルへの参照を backtick パス（Markdown リンクなし）で記述した。
- 理由: 配布スキルは skill ディレクトリ単位で独立配布され、他 skill ファイルへの相対リンクは配布先で破損する恐れがあるため。配布境界 checker（source/link 両 profile）で concrete path hits 0 を確認済み。
- この判断は PR 本文の記録にのみ存在し、正本前置きや配布境界 Design の様式としては明文化されていない。同種の複製統合（他 references 正本化）で再利用できる判断である。

## 影響

- 配布 skill 間の正本参照を backtick パスで記述する運用が PR 本文の記録にのみ存在し、Design 様式として明文化されていない。同種の複製統合で再利用する際の判断根拠が正規文書から辿れない。

## 課題

- 配布境界 Design または正本化の手順参照に「他 skill ファイルへの参照は backtick パスで記述し Markdown リンクを使用しない」運用を追記する候補。配布境界 checker の concrete path 検出（hits 0 確認）を併記する。

## 既存要件との関連

- Epic #4054・Issue #4059・PR #4065 本文 Findings（intake 候補として申告）
- 配布依存境界 Design・check_distribution_boundary.ts（concrete path 検出）
