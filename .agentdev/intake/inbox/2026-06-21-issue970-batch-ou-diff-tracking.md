# docs_chore 系バッチ Issue の OU 分散追跡性改善候補

## 観測

Issue #970 のバッチ構造（OU-002/009/010 を1 Issue に束ねた運用）は、docs_chore 系の細目整備を1つの PR にまとめる妥協点として機能している。ただし OU ごとの完了判定が分散する（OU-010 は別 commit で既完了）ため、Issue 本文の OU×REQ/SPEC マッピング表と実 PR の diff 対応を手動で追う必要がある。

## 影響

- OU が複数にまたがるバッチ Issue で、どの OU がどの commit / PR で対応されたかを Issue 本文だけから追跡するのが難しい。
- spec-save / req-save で先行完了した OU が本筋 PR の diff に含まれない場合、Reviewer が「PR を開いただけでは完了状態が分からない」状態になる。

## レビューで決めること

- 今後の同種バッチでは「OU ごとに sub-issue を分離」または「完了判定表を Issue 本体に保持」のいずれかで追跡性を改善するか。
- バッチ Issue テンプレートに「OU × commit hash / PR 番号」の対応表欄を設けるか。

## 根拠

- PR #975: https://github.com/yogata/agent-dev-flow/pull/975 (Issue #970 / バッチB 文書品質・整備)
- Issue #970: https://github.com/yogata/agent-dev-flow/issues/970
- Epic #968: Wave 1 子 Issue バッチ構成
