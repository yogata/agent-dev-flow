---
name: agentdev-traceability
description: Requirement-artifact traceability (coverage, impact, check) resolving role-tagged relations from traceability sidecars, the policy, and ADF-COVERS declarations. USE FOR: artifacts covering a requirement, reverse lookup of covered requirements, re-confirmation candidates via artifact hops, relation integrity checks, sidecar and policy authoring procedures, check finding interpretation. DO NOT USE FOR: document exploration, path search, diagnostics, dependency exploration, index management, semantic coverage inference.
---

# agentdev-traceability

要件と成果物の明示的な対応関係（covers）と、採用した隣接工程間の対応関係（links）について、coverage、impact、check、links、inventory、reuse の6能力と対応宣言の導出（derivations）を提供する。正規成果物を直接走査して対応関係をその場で解決し、派生 Graph を前提としない。

## モデルの基本（対応関係と4役割）

covers 対応関係は要件行（`REQ-{NNNN}-{MMM}`）を中心に、成果物役割（artifact role）付きで表現する。役割は次の4種。

| 役割 | 意味 | 必須性 |
|---|---|---|
| decision | 正式な意思決定の記録 | 任意（欠落を不完全と判定しない） |
| design | 要件を実現する現在の設計 | 全要件行で1件以上必須 |
| implementation | 要件を実現する永続成果物（物理種別を前提しない） | 全要件行で1件以上必須 |
| verification | 要件を検証する永続的な検証手段（実行結果は保持しない） | ポリシー required の要件行で1件以上必須 |

- 各対応は要件へ直接対応付ける。Design 対応を経由して実装または検証が成立したものと推定しない（推移阻止）
- 1つの成果物が複数の要件へ対応でき複数の役割を持てる。すべての成果物に重複した直接対応を必須としない（下記 links で追跡できる関係は covers の完全性検査対象にしない）
- モデル要素・完全性規則・用語の正本は traceability-model Design が所有。本スキルは利用知識と手順を提供し規範を独立定義しない

## 隣接工程間対応（links）

採用した隣接工程の成果物・追跡単位を明示的に関連付ける有界な標準関係。上流と下流を双方向に追跡し、存在しない詳細工程への対応を強制しない。

- 宣言は下流→上流の参照（upstream 方向）のみ。逆方向は links 能力の逆引きで追跡し、双方向の宣言を要求しない
- links の完全性検査は存在しない。不在は check の不合格に計上せず、未採用の参照例を判定基準に含めない
- links 対応は covers の対応完全性（missing-*）の代替にならない。グループ化しても個別の covers 計上と検証義務は消えない
- 語義の正本は traceability-model Design「標準関係の構造（v5 語義）」節

## 対応関係の表現

対応関係は component / package 単位の sidecar（標準）と producer-only artifact の inline declaration で保持する。中央台帳を新設しない。

### sidecar（標準保存方式）

- 配置: top-level `traceability/` 配下の YAML。作成・更新手順と宣言追加前の所属 sidecar 事前確認（ファイルの見た目で所属を決めない）は references/sidecar-and-policy.md 参照
- 最小データ: component 識別子、artifact のリポジトリ相対パス、role（4役割）、要件行 ID の列挙
- `traceability/policy.yaml` は sidecar ではない。対応関係を保持せず検証対応の要否のみ宣言する

### inline declaration（producer-only）

- 表記仕様は producer 側 Design が正規所有。宣言はファイル種別ごとのコメント記法内部に1行で記述する
- consumer distribution closure（配布対象ソース）では使用しない。配布対象成果物は sidecar で保持する
- 解析対象は正規宣言位置（コメント記法内部の宣言行）に限定する。本文 prose 内の宣言マーカー形状の言及は対象外とする。正規位置の形式不備は引き続き検出する
- 1ファイルに複数の宣言行を含められる（解析結果は和集合）。解析は行単位のパターン照合で行い、意味推定を行わない
- 宣言の REQ-ID は子要件行 ID で指定する。親要件 ID のみ（bare ID）は配置対象とならず、check の欠落計上対象となり得る
- sidecar と inline declaration は同一論理関係へ正規化され、coverage、impact、check から同一に扱う。不整合な重複は check が検出する

### links 宣言（隣接工程間対応）

- inline 宣言は `ADF-LINKS(upstream): <リポジトリ相対パス>{, <パス>}*` 形式で、下流側成果物のコメント記法内部に1行で記述する。covers と同一の正規宣言位置限定（prose 対象外）
- sidecar はトップレベルキー `links` の `upstream` 配下へ「source（下流）→ target（上流）パス列挙」を記述する。書式詳細は references/sidecar-and-policy.md 参照
- inline 宣言と sidecar links は同一論理関係へ正規化され、links、check から同一に扱う。同一 source × target の矛盾重複は check が検出する
- 方向は upstream（下流→上流）のみ許容する。不明方向の宣言は check（`malformed-links`）の検出対象とする

inline declaration 優先規則（重複解消の整備方向）の詳細は references/sidecar-and-policy.md 参照。

## Scripts

`scripts/` 配下の決定的スクリプトが6能力を機械的に実行する（TypeScript + bun、解析コア `lib/` と CLI `src/` を分離）。ユニットテストは架空の concrete 要件行ID を使うため配布物に含めず producer 側の検証スイートが担う。I/O 契約と実行方法の詳細（`--root` はルート絶対パス指定。相対パスでは走査対象が欠落し静かに誤動作する）は scripts/README.md 参照。

### 公開操作契約（スクリプト一覧）

| スクリプト | 能力 | 引数 |
|---|---|---|
| `src/coverage.ts` | coverage | `--root` + `--req` または `--artifact` |
| `src/impact.ts` | impact | `--root` + `--req` または `--artifact` |
| `src/relied-diff.ts` | impact 拡張（差分候補） | `--root`、`--relied`、`--head`、`--paths`、`--downstream`、`--evidence-basis`、`--basis-note` |
| `src/check.ts` | check | `--root`（任意: `--req`、`--artifact`） |
| `src/derivations.ts` | derivations（導出 checker） | `--root` |
| `src/links.ts` | links | `--root` + `--artifact` |
| `src/inventory.ts` | inventory | `--root` |
| `src/reuse.ts` | reuse | `--root` + `--evidence`（任意: `--revision`） |

出力 JSON・check の12種検査・対応宣言の導出の詳細は scripts/README.md 参照。要点:

- Decision 対応の欠落は不合格に計上しない（対応完全性規則の任意役割）
- links の完全性検査は存在しない。不在は不合格に計上せず missing-* 判定の入力にしない
- check は構造検査のみを担い、pass は要求内容の充足（意味的品質）の証明ではない。`structuralOnly: true` が境界を機械的に明示する。意味的品質検証の恒久的なゲートを追加しない
- 検証スコープポリシーは `traceability/policy.yaml` から解決する。ポリシー不在時は全現行要件行を検証対応必須として扱う（安全側既定）。読取不能・schema 不適合は当該検査を不合格にする（fail-closed）

## 運用規約

- coverage は明示された対応関係を全件返す（候補数上限・ランキング・探索深度の切り捨てなし、役割絞り込みなし〔解釈は呼出側の責務〕）。coverage を cleanup 突合の認定根拠に使用しない。cleanup 突合の判定根拠は配布物本文の対応宣言 0件突合である
- impact の探索範囲は成果物 ↔ 要件 ↔ 成果物（固定2ホップ）、links は隣接成果物間の固定 1 ホップ。空結果を「影響なし」「隣接工程が存在しない」の証明として扱わない
- inventory の発見候補は advisory・fail-open で欠落（missing-*）とは別分類。欠落と誤判定せず、作成・修正の最終判断は各工程が行う。棚卸し結果を対応完全性の合格条件にしない
- reuse は構造検査のみを担い、証拠の適用可否を合格判定しない。`manualConfirmation` 確認を経ない再利用を変更反映完了の根拠にしない。局所試験合格でも受け入れ条件の最終実証が不足なら完了と判定しない。最終受入は各工程が現在有効な条件から必要な検証を独立に評価する
- check の `structuralOnly: true` は、check 合格が受け入れ条件の実証を代替しない構造的証拠である。check 合格を workflow の完了判定へ直結させない
- 現行要件の判定は `docs/requirements/REQ-{NNNN}.md` の要件テーブル行を標準とする。`retired/` は廃止扱い
- coverage と impact は補助的（advisory）で fail-open。機能の不在や実行失敗のみを理由に workflow を恒常停止させず、正規成果物の直接読取等へ fallback できる。対応完全性を完了条件とする工程では、check が完全性判定できていない状態（実行不能、読取不能、判定不能）を pass として扱わない（fail-closed）。「対応関係が完全である」と「完全性を検査できなかった」を区別して扱う

## 対象外

- 一般文書探索、任意経路探索、構造診断、依存関係探索
- 派生索引の生成・鮮度管理
- OpenFastTrace、Eclipse Capra、専用グラフDBの実行依存
- 対応関係の意味推定（LLM による自動確定を含む）
- 要求内容の充足（意味的品質）の検証ゲート

## See Also

- references/sidecar-and-policy.md: sidecar 作成・更新手順、links 書式、policy.yaml 利用、対応関係更新手順、inline declaration 優先規則
- references/check-interpretation.md: finding 解釈、coverage / impact / links / inventory / reuse の利用と結果の読み方
- scripts/README.md: スクリプト構成、I/O 契約、実行方法とコマンド例、出力 JSON 詳細、12種検査、対応宣言の導出
- **Design**: producer 側リポジトリの `agentdev-traceability` Design と traceability-model Design（原本仕様とモデルの正本）
