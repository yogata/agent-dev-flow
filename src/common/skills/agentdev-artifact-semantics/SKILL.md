---
name: agentdev-artifact-semantics
description: Deterministic assessment of artifact semantics (requirement/decision/design/implementation/verification) and phase-wise formal finalization. USE FOR: classifying artifact roles from self-declaration or placement conventions, resolving adopted conventions with the migration-period default, assessing design basis against adopted conventions (independent-design vs alternative-artifact, missing-basis detection), and judging phase finalization with a separate requirement-satisfaction outcome. DO NOT USE FOR: covers-relation analysis itself (agentdev-traceability owns declaration parsing and coverage), semantic judgement of design validity, editing REQ/Decision/Design files, workflow orchestration.
---

# agentdev-artifact-semantics

本スキルは、成果物の意味境界（要求・Decision・設計・実装・検証の区別）と工程別正式確定を
決定的に判定する Capability Skill である。
判断方法の分類上、本スキルは「機械的に決定可能な導出・判定をコードで行う」分担を所有し、
設計内容の妥当性そのもの（閉じた意味判断）は所有しない。

## モデルの基本（成果物の意味区別）

各工程の成果物は自らの意味を所有する。本判定器は5つの意味役割を区別する。

| 役割 | 意味 |
|---|---|
| requirement | 要求（満たすべき条件） |
| decision | Decision（重要判断と理由） |
| design | 設計（実現方式） |
| implementation | 実装（実体） |
| verification | 検証（方法と証拠） |

意味役割の解決は2段の決定的経路で行う。

1. **自らの宣言（第一経路）**: 成果物の frontmatter `artifact_roles` に役割を列挙する。
   宣言は配置規約より優先する。1つの成果物が複数の役割を宣言できる。
   これは、同じ設定・構成ファイルが設計と実装の双方の役割を担う場合に、役割ごとの
   別ファイルを必須としないための機構である。役割ごとの検証は、宣言された役割を
   キーに行う（ファイル分割を要求しない）
2. **配置規約（第二経路）**: 宣言が無い場合、正解が決定的に導ける配置のみから既定役割を
   導出する（要求文書配置 → requirement、Decision 文書配置 → decision、
   Design 文書配置 → design、テストファイル → verification。各配置の判定は
   producer 側リポジトリの文書種別配置規約に従う）。導出できない成果物は
   unclassified として報告する（誤った役割を推定しない、fail-closed）

## 採用規約の解決と移行期デフォルト

設計根拠の判定基準は、プロジェクトが採用した規約から解決する。解決は単一経路である。

1. **採用宣言の確認**: `--adopted` で採用宣言 YAML を指定した場合、その宣言を正規の
   採用規約として解決する
2. **移行期デフォルト**: 採用宣言が指定されない場合、プロジェクトが規約の採用宣言を
   行うまでの間、現に実効している工程・成果物の運用を採用済み規約として扱う
   （移行期デフォルト）。本判定器の移行期デフォルトは、現行要件行への design 対応を
   原則必須とする運用と、独立 Design 文書の存在を一律の必須条件としない運用の双方が
   実効している状態を反映し、`independentDesignRequired: true` かつ
   `alternativeDesignBasisAllowed: true` である
3. **接続の終了**: 採用宣言が行われた後は採用宣言を正規基準として解決し、移行期
   デフォルトを判定に使用しない

採用宣言が指定されたが読取・解析に失敗した場合、移行期デフォルトへフォールバックせず
fail-closed で失敗する（解決不能な規約で判定を下さない）。

## 設計責務の判定

設計責務の成立は、独立 Design 文書の存在に一律依存しない。

- **独立設計書型**: Design 文書配置規約に従う成果物に対する design
  役割の対応宣言（本判定器は producer 側リポジトリの Design 文書配置を独立設計書型として分類する）
- **代替成果物型**: 採用規約が認めるその他の適切な成果物に対する design 役割の
  対応宣言。代替成果物型は、採用規約（または移行期デフォルト）が認める場合に限り
  有効である

判定の出力は次のとおり。

| 出力 | 条件 |
|---|---|
| confirmed（independent-design） | 実在する独立 Design 文書型の宣言がある |
| confirmed（alternative-artifact） | 独立設計書型の宣言が無く、実在する代替成果物型の宣言があり、規約が代替を認める |
| missing（alternative-basis-not-allowed-by-conventions） | 実在する宣言が代替成果物型のみで、規約が代替を認めない |
| missing（declared-artifact-not-found） | 宣言はあるが参照先成果物が実在しない（宣言の存在だけを根拠に合格にしない） |
| missing（no-design-basis-declaration） | 宣言が無い（独立設計書を必須成果物として採用した場合、この欠落を見逃さない） |

**設計妥当性の非合格構造保証**: 本判定器は designValidity として常に
`not-evaluated-by-this-tool` を返す。対応宣言の存在や参照先成果物の存在・コードの存在は、
設計の妥当性の合格根拠にならない。妥当性は、設計内容と根拠を確認する別手続き
（閉じた意味判断）で行う。

## 工程別正式確定と別判定

各工程の成果物は、次の条件をすべて満たすとき、後続工程を待たずに正式確定できる
（finalized: true）。

1. 成果物が実在する
2. 成果物が当該工程の意味役割を所有する（宣言または配置規約で解決できる）
3. 上流整合: 指定した上流要求行が現行要件として存在し、かつ成果物への対応宣言が存在する
4. 必要な検証の成立: 指定した検証根拠が実在し、検証の意味役割を持つ

条件が1つでも欠ければ finalized は false になる（上流・検証の未指定は確定させない、
fail-closed）。

**別判定の構造保証**: 本判定器は requirementSatisfaction として常に
`not-assessed-by-this-tool` を返す。正式確定と最終的な要求充足は別判定であり、
設計成果物の正式確定をもって最終的な要求充足済みと判定しない。要求充足の最終判定は、
後続工程（実装・検証）の結果を入力に別手続きで行う。

## 責務境界

| 関心 | 正規所有 |
|---|---|
| 対応宣言（covers）の解析・coverage・check | agentdev-traceability（本判定器は coverage CLI 出力を消費する） |
| 採用規約の宣言・保存・解決の構造（規範） | 採用規約機構の基盤 Design（採用規約機構を所有する領域） |
| 本判定器が所有する | 意味役割の決定的分類、移行期デフォルトを含む採用規約の解決、設計根拠の欠落判定、工程別正式確定と要求充足の別判定 |
| 設計内容の妥当性の判断 | 本判定器の対象外（閉じた意味判断。別手続き） |
| REQ/Decision/Design ファイルの作成・更新 | 各ファイル管理能力（本判定器は読み取り専用） |

## 公開操作契約（スクリプト一覧）

実行方法・入出力契約の詳細は [scripts/README.md](scripts/README.md) を参照する。

| 操作 | 入力 | 出力（主要フィールド） |
|---|---|---|
| classify | --root, --files | files[].roles（宣言優先・複数役割可・unclassified 報告） |
| design-basis | --root, --req, --coverage-report-file, --adopted（省略時は移行期デフォルト） | designBasis（confirmed/missing）、basisKind、missingReason、designValidity（常に not-evaluated-by-this-tool） |
| finalize | --root, --artifact, --phase, --upstream, --verification, --coverage-report-file | finalized、upstreamAlignment、verificationEvidence、requirementSatisfaction（常に not-assessed-by-this-tool） |

coverage 報告は事前に `agentdev-traceability` の coverage CLI（--req または --artifact）を
実行し、stdout JSON をファイルへ退避して渡す。

## 判定の入力限定

- 設計根拠判定・確定判定は、coverage 報告に現れた対応宣言だけを根拠にする。
  宣言されていない関係を推定して根拠としない（意味推定なし）
- 現行要件行の存在確認は、現行 REQ ファイルの走査（要件テーブル行の抽出）で行う。
  抽出規則の正は agentdev-traceability が所有し、本判定器はその実装を消費する

## See Also

- [scripts/README.md](scripts/README.md): 実行方法と判定規約の要点
- agentdev-traceability: 対応宣言の解析、coverage、check の正規所有スキル
- REQ（要件側の正）: 成果物の意味と工程別正式確定に関する要件行。本スキルの実装対応は
  リポジトリ top-level `traceability/` 配下 sidecar を正とする
