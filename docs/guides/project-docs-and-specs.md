# プロジェクトドキュメントと Design

REQ / Decision / Design の関係と、それぞれの役割を説明する。

## 文書体系の全体像

```
REQ（要件定義：満たすべき状態）
  ↓
Decision（アーキテクチャ決定：判断根拠）
  ↓
Design（現在設計：現在の姿）
```

各文書は独立した基準性を持ち、下位の文書が上位を代替することはない。
Knowledge、Report、guides は基準の階層の外側にある補助文書種別である。

## REQ（要件定義）

**格納先**: `docs/requirements/REQ-{NNN}.md`

要件定義の永続基準。
システムが満たすべき要件を記述する。

- 現行 REQ の一覧、範囲は `docs/requirements/README.md` を正とする

> 本ガイドでは REQ の件数・番号範囲を複製しない（REQ の増減に追従しないため）。

## Decision（アーキテクチャ決定記録）

**格納先**:
- 現行基準: `docs/decisions/DEC-{NNN}.md`（現行の番号帯）

将来の設計、運用、文書システムを制約する決定とその背景を記録する。

- 現行 Decision は DEC-001〜 の番号範囲を使用する
- 後継関係は Decision Map（`docs/decisions/README.md`）を参照のこと
- 承認済み Decision の決定内容は安定して維持する。変更が必要な場合は新規 Decision を作成する
- 参照の方向は「参照関係のルール」節を参照する
- 一覧は `docs/decisions/README.md` に索引がある（現行基準ビュー）

## Design（現在設計）

**格納先**: `docs/designs/**/*.md`（commands/skills/workflows の3層と基盤6ドメイン: foundations/responsibilities/quality/integrity/local/authoring）

実装者が参照する現在のシステム設計。
「今どう動いているか」を記述する。
リポジトリ内部の設計文書であり、実行時配布物の依存先ではない。
監査・評価・観測記録は Report として `docs/reports/` へ分離する。

> 現行 Design の一覧は `docs/designs/README.md`（Design インデックス）を正とする。
> 本ガイドでは Design 一覧を複製しない。

## Report（監査、観測記録）

**格納先**: `docs/reports/**/*.md`

監査、評価、観測の事実記録。
Design の管理対象から分離されており、分離の規約は `docs/designs/README.md`「Report の分離」を参照する。

## Knowledge（Project Knowledge）

**格納先**: `docs/knowledge/*.md`

プロジェクト固有の再利用可能な判断材料を保持する独立文書種別である。
1知識1 Markdown ファイル（kebab-case slug、固定 ID 採番なし）で配置する。
REQ/Decision/Design への ADF-COVERS 宣言は持たない。
所有と workflow 利用の契約は REQ-056、知識層の分離判断は DEC-025 を参照する。
一覧は `docs/knowledge/README.md` を参照する。

## このガイドの位置づけ

本ファイルを含む `docs/guides/` は人間向けの案内層である。
REQ/Decision/Design と矛盾する記述がある場合は基準文書を優先する。

## 参照関係のルール

文書間で矛盾があった場合、以下の順位で解決する。

1. REQ（最優先）
2. Decision
3. Design
4. guides（基準への導線を提供する）

参照の方向は次のとおりである。

- REQ → Decision、Decision → Decision、Issue → Decision の参照を許可する
- REQ → Issue の一方向参照である。Issue から REQ への逆参照は行わない
- Decision → Issue の逆参照は不可

guides（本ファイルを含む）は参照用読み物であり、基準文書への導線を提供する。
