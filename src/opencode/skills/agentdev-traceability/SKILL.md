---
name: agentdev-traceability
description: Requirement-artifact traceability (coverage, impact, check) resolving role-tagged relations from traceability sidecars, the policy, and ADF-COVERS declarations. USE FOR: artifacts covering a requirement, reverse lookup of covered requirements, re-confirmation candidates via artifact hops, relation integrity checks, sidecar and policy authoring procedures, check finding interpretation. DO NOT USE FOR: document exploration, path search, diagnostics, dependency exploration, index management, semantic coverage inference.
---

# agentdev-traceability

本スキルは AgentDevFlow の標準配布スキルである。
要件と成果物の明示的な対応関係（covers）について、coverage、impact、check の3能力を提供する。
正規成果物を直接走査して対応関係をその場で解決し、派生 Graph を前提としない。

## モデルの基本（対応関係と4役割）

対応関係は、要件行（`REQ-{NNNN}-{MMM}` 形式の個別要件行）を中心に、成果物役割（artifact role）付きで表現する。
成果物役割は次の4種である。

| 役割 | 意味 | 必須性 |
|---|---|---|
| decision | 要件に関する正式な意思決定を記録する永続成果物 | 任意（欠落を不完全と判定しない） |
| design | 要件を実現する現在の設計 | 全要件行で1件以上必須 |
| implementation | 要件を実現する永続成果物（ソースコードという物理種別を前提しない） | 全要件行で1件以上必須 |
| verification | 要件を検証する永続的な検証手段（個々の検証実行結果は保持しない） | 検証スコープポリシーが required とする要件行で1件以上必須 |

- Decision・Design・実装・検証の各対応は要件へ直接対応付ける。Design 対応を経由して実装または検証が成立したものと推定しない（推移阻止）
- 1つの成果物が複数の要件へ対応でき、複数の役割を持てる
- モデル要素・完全性規則・用語の正本は producer 側リポジトリの ADF v4 Traceability モデル Design（v4-traceability-model、docs/designs/<foundations/v4-traceability-model>.md）が所有する。本スキルはその利用知識と手順を提供し、規範の独立定義を行わない

## 対応関係の表現

対応関係は component / package 単位の sidecar（標準保存方式）と、producer-only artifact の inline declaration で保持する。
中央台帳を新設しない。

### sidecar（標準保存方式）

- 配置: リポジトリ top-level `traceability/` 配下の YAML（`traceability/<component-slug>.yaml`）。作成・更新手順は [references/sidecar-and-policy.md](references/sidecar-and-policy.md) を参照。対応宣言の追加前には、producer / component（配布物単位）の責務境界で所属 sidecar を事前確認する（変更対象ファイルの見た目で所属を決めない。手順は [references/sidecar-and-policy.md](references/sidecar-and-policy.md)「対応宣言追加前の component / sidecar 対応一覧の事前確認」参照）
- 最小データ: component 識別子、artifact のリポジトリ相対パス、role（4役割）、要件行 ID の列挙
- `traceability/policy.yaml`（検証スコープポリシー）は sidecar ではない。対応関係を保持せず、検証対応の要否のみを宣言する

### inline declaration（producer-only）

- 宣言形式の表記仕様（対応宣言マーカーと4役割、`REQ-{NNNN}-{MMM}` 形式の要件行 ID で構成される）は producer 側 Design が正規所有する
- 宣言は各ファイル種別のコメント記法（Markdown は HTML コメント、TypeScript は `//` 等）の内部に1行で記述する
- consumer distribution closure（配布対象の製品ソース）に含まれる成果物では使用しない。配布対象成果物の対応関係は sidecar で保持する
- 解析対象は正規宣言位置（各ファイル種別のコメント記法内部の宣言行）に限定する。本文 prose（見出し・段落・箇条書き等）内の宣言マーカー形状の言及は解析対象外とする（説明文コンテキスト対象外判定）。正規位置の形式不備宣言は引き続き検出する
- 1ファイルに複数の宣言行を含められる。解析結果は和集合とする
- 解析は行単位のパターン照合で行い、意味推定を行わない
- 宣言の REQ-ID は子要件行 ID で指定する。親要件 ID のみの参照（bare ID）は対応宣言の配置対象とならず、check に対応の欠落として計上され得る
- sidecar と inline declaration は同一の論理的な対応関係へ正規化され、coverage、impact、check から同一に扱われる。同一論理関係の不整合な重複は check が検出する

#### inline declaration 優先規則（重複解消の整備方向）

同一論理関係（同一 artifact パス × role × 要件行 ID）が inline declaration と sidecar の両方から生じた場合の整備方向の優先を定める。

- **適用範囲は producer 側限定**: 優先規則は producer 側文書（docs 配下の正規成果物、producer 側スクリプト等、inline declaration の正規配置対象）にのみ適用する。consumer distribution closure に含まれる配布対象成果物では inline declaration を使用しないため、sidecar が唯一の情報源であり本規則は適用されない（配布対象成果物の対応関係は sidecar 正規配置とする現行規定による除外）
- **優先保持**: producer 側成果物に対応する同一論理関係の二重宣言を解消する場合、inline declaration を優先保持し、sidecar 側の重複行を解消する。inline declaration は成果物本体と同一ファイルに共存するため、成果物の rename・移動・削除時に対応関係が追随し、sidecar の更新漏れを構造的に起こしにくいことが優先の根拠である
- **検出と整備の分離**: 検出自体は check の `duplicate-inconsistencies` が行う（sidecar と inline declaration の間、または同一情報源内で矛盾する状態を fail として検出）。本優先規則は検出結果の解消方向のみを定め、check の検出条件、判定、検出計上を変更しない。二重宣言が内容矛盾していなくても、`duplicate-inconsistencies` 節が検出する重複状態にある場合、本優先規則に従い単一情報源へ解消する

## Scripts（決定的処理）

`scripts/` 配下の決定的スクリプトが3能力を機械的に実行する。
実装は TypeScript + bun である。
解析コア（`lib/`）と CLI（`src/`）を分離しており、外部契約を変えずにキャッシュまたは索引を追加できる構造とする。
ユニットテスト（宣言解析に架空の concrete 要件行ID を使うため配布物に含めない）は producer 側リポジトリの検証スイート（`traceability_*.test.ts`）が担う。

### I/O 契約（共通）

| 項目 | 規約 |
|---|---|
| 入力 | argv（`--root`, `--req`, `--artifact`） |
| 出力 | stdout に JSON |
| エラー | 非ゼロ終了コード + stderr にエラーメッセージ（check は検査 fail ありで終了コード 2） |
| 走査 | `--root` 配下の正規成果物を直接走査（拡張子 `.md` / `.ts`。`.git`、`.agentdev`、`.agentdev-plugin`、`.worktrees`、`node_modules` を除外） |

### 公開操作契約（スクリプト一覧）

| スクリプト | 能力 | 引数 | 出力 JSON の要点 |
|---|---|---|---|
| `src/coverage.ts` | coverage | `--root` + `--req` または `--artifact` | 要件起点: 役割付き対応関係の全件（`relations`, `counts`, `truncated: false`）/ 成果物起点: 当該成果物の対応要件（`relations`, `emptyResult`） |
| `src/impact.ts` | impact | `--root` + `--req` または `--artifact` | 要件起点: 再確認候補 / 成果物起点: `viaRequirements` + `recheckCandidates`。空結果は `emptyResult: true` と `note`（影響なしの証明ではない旨）で明示 |
| `src/check.ts` | check | `--root`（任意: `--req` で完全性検査対象限定、`--artifact` で根拠検査追加） | 9種検査の `checks`（項目ごと pass / fail と findings）、`summary` |

check の9種検査: `malformed-declarations`（sidecar および inline declaration の形式・構文違反）、`unknown-roles`（未知の成果物役割）、`unknown-req-refs`（存在しない要件行への参照。sidecar、inline declaration、policy.yaml の optional 列挙を含む）、`invalid-artifact-paths`（存在しない、または取得不能な artifact path）、`missing-design`（Design 対応の欠落。現行要件行で0件）、`missing-implementation`（実装対応の欠落。現行要件行で0件）、`missing-verification`（検証対応の欠落。検証スコープポリシーが required と判定する現行要件行のみ計上）、`policy-invalid`（検証スコープポリシーの不正。schema 違反、default 値不正、optional 列挙の要件行 ID 形式違反、存在しない要件行の列挙、policy 読取不能）、`duplicate-inconsistencies`（同一論理関係の不整合な重複。同一 artifact パス × role × 要件行 ID の組み合わせが sidecar と inline declaration の間、または同一情報源内で矛盾する状態）。

- Decision 対応の欠落は不合格に計上しない（対応完全性規則の任意役割）
- 検証スコープポリシーは `traceability/policy.yaml` から解決する。ポリシーが存在しない場合は全現行要件行を検証対応必須として扱う（安全側既定）。読取不能または schema 不適合の場合、検証対応の要否判定が不能となるため当該検査を不合格にする（完全性判定不能を合格として扱わない、fail-closed）
- 各検出項目の finding の読み方と解消手順は [references/check-interpretation.md](references/check-interpretation.md) を参照

### 実行方法

`--root` には検証対象リポジトリのルート（`<repo-root>`）を指定する。絶対パスを推奨する。相対パスは実行時のカレントディレクトリ基準で解決されるため、ルートを明示せず `--root .` とすると、実行位置によっては走査対象が欠落し検査が静かに誤動作する。

実行前提（共通）:

- `--req` は要件行ID（`REQ-{NNNN}-{MMM}`）の個別カンマ指定のみを受理する。`..` 形式の範囲構文は範囲展開されずリテラルの reqId として扱われ、完全性検査の対象限定が空振りして未検査の行が pass に見える。対象行は1つずつ列挙すること
- worktree を検証対象とする場合、および scripts ディレクトリを cwd に起動した場合も、`--root` は検証対象リポジトリのルート明示を維持する（相対パス指定の事故像は上記のとおり）
- 宣言の走査対象は拡張子 `.md` / `.ts` のファイルのみであり、除外ディレクトリ（一覧は「I/O 契約（共通）」参照。`.agentdev/` 等）配下に配置した宣言は計上されない

```bash
# coverage: 要件起点
bun .opencode/skills/agentdev-traceability/scripts/src/coverage.ts --root <repo-root> --req REQ-{NNNN}-{MMM}

# coverage: 成果物起点（逆引き）
bun .opencode/skills/agentdev-traceability/scripts/src/coverage.ts --root <repo-root> --artifact docs/designs/<path/to/artifact>.md

# impact: 要件起点
bun .opencode/skills/agentdev-traceability/scripts/src/impact.ts --root <repo-root> --req REQ-{NNNN}-{MMM}

# impact: 成果物起点（成果物 ↔ 要件 ↔ 成果物の再確認候補）
bun .opencode/skills/agentdev-traceability/scripts/src/impact.ts --root <repo-root> --artifact src/<path/to/artifact>.ts

# check: コーパス全体
bun .opencode/skills/agentdev-traceability/scripts/src/check.ts --root <repo-root>

# check: 完全性検査の対象要件を限定
bun .opencode/skills/agentdev-traceability/scripts/src/check.ts --root <repo-root> --req REQ-{NNNN}-{MMM},REQ-{NNNN}-{MMM}
```

スクリプト構成の詳細は [scripts/README.md](scripts/README.md) 参照。

## 運用規約

- coverage は明示された対応関係を全件返す。候補数上限、ランキング、探索深度による切り捨てを行わない
- coverage は decision / design / implementation / verification の4役割の役割付き対応関係を全件返却し、役割毎の絞り込みを行わない。役割付き出力の解釈は呼出側の責務である。coverage を配布物本文の対応宣言除去可否判定（cleanup 突合）の認定根拠として使用しない。配布対象成果物の対応関係は sidecar のみに保持され、配布物本体に対応宣言は存在しないため、cleanup 突合の判定根拠は配布物本文の対応宣言 0件突合である
- impact の探索範囲は成果物 ↔ 要件 ↔ 成果物（固定2ホップ）であり、任意深度のグラフ探索を行わない。空結果を「影響なし」の証明として扱わない
- 現行要件の判定は `docs/requirements/REQ-{NNNN}.md` 直下の要件テーブル行（`REQ-{NNNN}-{MMM}`）を標準とする。`retired/` サブディレクトリは廃止扱い
- 完全性の基準は、Design 対応は全現行要件行で1件以上、implementation 対応は全現行要件行で1件以上、verification 対応は検証スコープポリシーが required と判定する要件行で1件以上。Decision 対応は任意であり、Decision 対応0件のみを理由に不完全と判定しない。ポリシー不在時は全現行要件行を検証対応必須として扱う（安全側既定）
- coverage と impact は補助的（advisory）な能力であり、fail-open で運用する。機能の不在または実行失敗のみを理由に workflow を恒常停止させず、正規成果物の直接読取等の独立した確認へ fallback できる。workflow が対応完全性を完了条件として要求する工程では、check が完全性判定できていない状態（実行不能、読取不能、判定不能）を pass として扱わない（fail-closed）。「対応関係が完全である」と「完全性を検査できなかった」を区別して扱う

## 対象外

- 一般文書探索、任意経路探索、構造診断、依存関係探索
- 派生索引（`.agentdev/graph/` 等）の生成・鮮度管理
- OpenFastTrace、Eclipse Capra、専用グラフDBの実行依存
- 対応関係の意味推定（LLM による自動確定を含む）

## See Also

- [references/sidecar-and-policy.md](references/sidecar-and-policy.md): sidecar の作成・更新手順、検証スコープポリシー（`traceability/policy.yaml`）の利用手順、要件・Design・実装・検証変更時の対応関係更新手順
- [references/check-interpretation.md](references/check-interpretation.md): check の9検出項目の finding 解釈、coverage / impact の利用方法と結果の読み方
- **Design**: producer 側リポジトリの `agentdev-traceability` Design と ADF v4 Traceability モデル Design（v4-traceability-model、docs/designs/<foundations/v4-traceability-model>.md。本スキルの原本仕様とモデルの正本）
- **トレーサビリティ要件・意思決定**: producer 側リポジトリの要件インデックスと Decision インデックスを参照
