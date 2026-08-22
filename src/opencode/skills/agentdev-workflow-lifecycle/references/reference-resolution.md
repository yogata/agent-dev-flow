# 参照先解決ポリシー（source / projection 目的判別）

AgentDevFlow の配布物参照で、正規原本（source）と実行時投影（projection）のどちらを確認対象とするかを実行目的に基づいて判別するポリシー。
原本仕様は `<workflows/workflow-contracts>` Design「工程間構造化文脈引き継ぎ契約」（解決済み参照先の正規参照先渡し）と、source / projection 責務境界を定める Decision である。
本参照は配布物への適用形を定める。

## 目的

- 実行目的に応じた参照先の判別を可能にし、「常に source のみ」「常に projection のみ」の固定ルールによる参照経路の硬化を排除する。
- 当該作業で使用すべき解決済み参照先を、構造化文脈の canonical_references を通じて後工程へ渡す。
- 品質保証上必要な source / projection 双方の確認（整合確認）を維持する。source / projection 責務境界自体の変更は本ポリシーの対象外とする。

## 参照経路の記号

本参照では、参照経路を次の記号で表す。
パス表記は consumer 環境で解決できないため、次のコードブロック内に限定する。

```
source      = src/opencode/    （配布物の正規原本）
projection  = .opencode/       （実行時投影）
```

## 判別の前提

- 判別の対象は配布成果物（command、skill、template、script）の参照である。docs 配下の REQ、Decision、Design、Issue 本文、PR 本文は単一の正規情報源であり、source / projection の別を持たない。
- 判別の問いは参照経路ではなく実行目的に置く。「何の確定のためにこの参照を読むか」をまず確定し、その後に参照経路（source、projection、双方）が従う。
- 固定ルールを設けない。リポジトリ種別（自己ホスト、consumer）、実行環境（メインリポジトリ、worktree）、投影方式（junction、copy）の違いにより同一の目的でも利用可能な経路が変わるため、判別は目的を正とし、環境差はフォールバック条件として扱う。

## 目的判別（3分類）

| 実行目的 | 意味 | 参照経路 | 代表場面 |
|---|---|---|---|
| 正規原本確認（source） | 配布物の正しい内容そのものの確定 | source（正規原本） | 配布物の編集（原本が編集の唯一の入口）、skill / command / 文書品質査読の対象テキスト確認、配布依存境界 gate の `--profile source`（PR 変更分の内容検証） |
| 実行時投影確認（projection） | 実行環境が実際に読み込む実態の確定 | projection（実行時投影） | 実行時入口の実効確認（実行環境が読み込む command、skill の実態）、consumer 導入状態の健全性確認（install 状態、junction / copy 投影の実態）、配布依存境界 gate の `--profile link`（投影経路の健全性） |
| 双方整合確認（both） | source と projection の対応関係（整合）自体の確定 | source と projection の双方 | 整合性検査の `source-projection-sync`、配布依存境界の最終 gate（source / link 両 profile を必須とする双方反映検証）、投影が原本を正しく反映する状態の検証を要する品質保証 |

### 判別手順

1. 当該参照の実行目的を「配布物の内容確定」「実行時実態の確定」「両者の整合の確定」のいずれかに分類する。
2. 分類した目的に対応する参照経路（上表）を読み取り対象とする。
3. 読み取り対象が実行環境で利用できない場合は環境フォールバック（次節）を適用し、適用内容を検証記録の環境ラベルに含める。

## 環境フォールバック（worktree、ジャンクション未伝播）

- worktree では projection 配下の junction が未伝播であり、projection 側が実体化していないことがある。
- 実行時投影確認の目的で projection が読み取れない場合は、junction 構成が維持されたメインリポジトリ root を位置引数に指定した読取専用実行で代替できる。運用例は配布依存境界 最終 gate の `--profile link` における repoRoot 指定である。
- `resolvePathWithFallback`（ランタイムパスからソースパスへの部分フォールバック）は存在しない投影の代替読み取りを一部補うが、source / projection 双方向の存在比較を要する双方整合確認を代替しない。
- フォールバックの適用有無は環境ラベル（worktree または main、junction 伝播状態、読取専用実行の別）として検証記録に残す。

## canonical_references への直列化

- 構造化文脈の canonical_references の各項目は、配布物参照の場合に当該参照先の目的判別を含む。
- 表記は参照先の末尾に判別を括弧書きで付す。例: `src/opencode/skills/{skill}/SKILL.md（正規原本確認）`。
- 判別の根拠となった実行目的が自明でない場合は、項目に目的の要約を併記する。
- 単一の正規情報源（docs、Issue 本文、PR 本文）は判別なしで正規参照先として扱う。

工程間の直列化形式は `structured-stage-handoff.md` が、委譲時の直列化形式は `agentdev-case-run-execution-adapter` スキルの委譲プロンプト雛形が所有する。本参照は判別の内容のみを定め、直列化形式を重複して定義しない。

## 制約

- 「常に source のみ」「常に projection のみ」の固定ルールを設けない。
- 品質保証上必要な双方整合確認（整合性検査の `source-projection-sync`、配布依存境界の最終 gate）を本ポリシーの適用によって削除、緩和しない。
- source / projection の責務境界自体（原本配置、投影方式、編集入口の一意性）を変更しない。境界の変更が必要な場合は正規の設計判断として別途扱う。
- 環境フォールバックは読み取りに限る。worktree 内での junction 再作成、同期スクリプトの実行を本ポリシーは要求しない。

## 参照

- `<workflows/workflow-contracts>` Design「工程間構造化文脈引き継ぎ契約」（解決済み参照先の正規参照先渡し）
- 「OpenCode ソース・プロジェクション分離」を定める Decision（source / projection 責務境界の原本）
- `structured-stage-handoff.md`（工程間の直列化形式の所有者）
- `agentdev-case-run-execution-adapter` スキルの委譲プロンプト雛形（委譲時の直列化形式の所有者）
- `agentdev-workflow-case-run` の `references/delegation-and-result.md`（配布依存境界 最終 gate における双方反映検証の適用形）
