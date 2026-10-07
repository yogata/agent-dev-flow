# Design ライフサイクル適用


本資料は SKILL.md「Design ライフサイクル適用」「ファイル操作モード」「ADF-COVERS 宣言ブロックの更新確認（Design 保存時）」セクションの補完であり、Design frontmatter の `status`（`draft` / `accepted` の2値）を Design 操作（CREATE/APPEND/UPDATE）で適用する規則と、Design 保存工程での ADF-COVERS 宣言ブロック更新確認手順を記述する。

## status 値と遷移契機

| status | 意味 | 遷移契機 |
|--------|------|----------|
| `draft` | Design 保存で保存された直後の状態。境界違反検査の対象外 | Design 保存（case-ready / case-revise の Capability Skill 委譲）が新規 Design 作成時に付与（既定値） |
| `accepted` | case-close で Design 状態評価（棚卸し制）を通過した状態。すべての integrity rule の検査対象 | case-close STEP-3 の Design 状態評価（棚卸し制）で実装・検証との整合確認を通過時 |

`status` 欠落は後方互換のため `accepted` 相当として扱う。

## CREATE 時の status 適用

新規 Design 作成時（`operation: create`）は frontmatter に `status: draft` を必ず付与する。

frontmatter 完全性（4フィールド）:
- `title`: Design タイトル
- `status`: `draft`（固定）
- `created`: 作成日（`YYYY-MM-DD`）
- `updated`: 作成日（`YYYY-MM-DD`、`created` と同値）

`accepted` を付与しないこと。
`draft` から `accepted` への昇格は case-close の責務。

## APPEND / UPDATE 時の status 扱い

既存 Design へ新規セクション追加（APPEND）またはセクション置換（UPDATE）の場合、当該 Design の `status` を変更しない。
既存 Design の成熟度を尊重する。

- `status: draft` の Design へ追記 → `status: draft` を維持
- `status: accepted` の Design へ追記 → `status: accepted` を維持
- frontmatter `updated` のみ更新日時に更新する

## accepted 昇格時の対応記録

Design status を draft から accepted へ昇格する場合、昇格は Design status frontmatter と Design 管理インデックス（Design README 一覧の status 列）の状態更新のみを行い、Design 本文へ作業履歴・評価記録を追記しない。

昇格評価の証跡として次の4必須項目を当該 Case の Issue への対応記録コメントに保存する:

- 昇格日
- 評価契約根拠
- 対応 Case/PR
- REQ との整合確認結果

昇格根拠の記録と見送り記録は同一対象で排他に管理する（同一対象に両方を記録しない）。
draft から accepted への状態遷移と Design 管理インデックスの status 列との整合維持要求は維持する。
見送り記録は当該 Case の Issue への対応記録コメントに保存し、現在 Design 本文へ作業履歴として新規保存しない。新規の一時成果物種別や新規ドメイン状態は作成しない。再評価契機を持つ未解決の見送り事項は追跡Issue として育成できる。
既存 Design 本文に残存する対応記録節の除去は純化処理の対象であり、本節は再生成防止の契約のみを所有する。

## 置換済み Design の扱い

置換済み Design は現行 Design ツリーへ保持しない。
置換時は旧 Design を現行ツリーから除外し、履歴は Git、Issue、Decision 等の既存履歴手段から確認する。
`superseded`、`superseded_by` を Design ライフサイクルで使用しない。

## Design 一覧表（docs/designs/README.md 相当）登録

新規 Design 作成時（CREATE）は Design 一覧表へ当該 Design の行を登録する。

登録内容:
- Design パス（相対リンク）
- `status`: `draft`（Design 保存の新規作成時）
- タイトル
- 責務の概要

既存 Design へ追記（APPEND/UPDATE）の場合は一覧表の `status` 列のみ更新し、行を追加しない。
Design のドメイン間移送が発生した場合は旧ドメイン表から行を削除し、新ドメイン表へ登録する。

## ADF-COVERS 宣言ブロックの更新確認（Design 保存時）

Design 保存（Design 本体へ要件を反映する case-ready / case-revise 内部責務の保存工程。v4 標準ライフサイクルの語彙）は、当該 Design ヘッダの既存 ADF-COVERS 宣言ブロックについて今回の反映による更新要否（実装対応・検証対応の過不足）を確認対象に含める。
確認結果に基づく宣言ブロックの更新を要する場合、保存工程の一部として反映する。

確認手順:

1. **確認対象の特定**: 保存対象 Design のヘッダ（frontmatter 直後）に既存の `ADF-COVERS` 宣言ブロックが存在するか確認する。宣言ブロックが存在しない場合（新規 Design の CREATE 等）、既存宣言ブロックの更新確認は対象とならず、対応宣言の付与は実装担当工程（case-run の対応宣言）へ委ねる
2. **更新要否の判定**: 今回の反映で追加・更新される Design 節の内容が、既存宣言ブロックの実装対応・検証対応の範囲に対して過不足（新たな対応関係の宣言追加要否、既存宣言の対応範囲からの逸脱）とならないか確認する
3. **保存工程内での反映**: 更新を要すると確認した場合、宣言ブロックの追加・更新を Design 本文の保存と同一の保存工程の一部として反映する。保存後の後追い修正工程を別途設けない