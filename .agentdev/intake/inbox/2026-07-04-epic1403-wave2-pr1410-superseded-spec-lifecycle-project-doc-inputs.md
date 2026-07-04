# docs/specs/foundations/project-doc-inputs.md の歴史参照残置判断（superseded SPEC lifecycle）

## 観測

PR #1410（Epic #1403 Wave 2, Issue #1406）で .agentdev/doc-inputs/** を .agentdev/extensions/** へ一括移行した。この際、旧 SPEC `docs/specs/foundations/project-doc-inputs.md` を完全削除せず、冒頭に `superseded_by: project-extensions.md` frontmatter と履歴参照注記を追加して残置した。

判断理由（PR #1410 Findings F-1）:
- 完全削除ではなく履歴保持を選択
- 移行経緯・決定根拠を後続エージェントが追跡できるよう履歴参照価値を残す
- REQ/SPEC lifecycle における superseded SPEC の標準扱いが未整備のため、個別判断とした

## 今回扱わなかった理由

`docs/specs/foundations/document-model.md` の SPEC ライフサイクル定義（"SPEC は実装とともに変化する生きた文書"）では superseded 状態遷移が明示的に定義されていない。REQ ライフサイクル（created → active → superseded / partially superseded）や ADR ライフサイクル（proposed → accepted → superseded / deprecated）と異なり、SPEC は active のみで廃止状態を持たない運用。

本 Issue #1406 のスコープは doc-inputs→extensions 移行の実装完了であり、SPEC lifecycle モデル自体の拡張は別議論（backlog → req-define を経て判断）。

## 影響

- `project-doc-inputs.md` が `docs/specs/` 配下に残り続け、docs-check 検査対象となる
- superseded_by 宣言のみで実体削除しない場合、類似 case が増えると古い SPEC が蓄積する
- docs-check / inspect-docs で「現行 SPEC か履歴参照 SPEC か」を機械判定する基準が不在

## レビューで決めること

- superseded SPEC の標準扱い（完全削除 / 別ディレクトリへ移動 / 残置のいずれかを標準化）
- `superseded_by` frontmatter の formal 導入（document-model.md SPEC への追記）
- 履歴参照 SPEC を docs-check / inspect-docs の検査対象外とする判定基準
- ADR retired ディレクトリ（docs/adr/retired/）と REQ retired ディレクトリ（docs/requirements/retired/）との整合性（SPEC にも retired/ を新設するか）

## 根拠

PR #1410 Findings / Capture候補 F-1 より。Wave 2 case-close で回収。