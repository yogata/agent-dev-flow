# REQ-0033 の promoted/req-define/ 参照 (3件)

## 観測
`docs/requirements/REQ-0033.md` に旧 `promoted/req-define/` サブディレクトリ構造への参照が3件残存している。REQ-0039 でフラット構造 (`promoted/*.md`) に移行済み。

## 今回扱わない理由
REQ-0039 の関連ドキュメント更新候補として検出されたが、REQ-0039 scope 外と明示的に判断（REQ-0039 Section G 対象は REQ-0026/0007/0019/0023/0013/0029 のみ）。連鎖更新で別途対応。

## 影響
REQ-0033 の該当記述が現状のフラット構造と矛盾している。intake-promote や req-define の実際の動作と整合しない記述となる。

## レビューで決めること
- REQ-0033 の該当箇所をフラット構造に合わせて UPDATE するかどうか
- 他の REQ ファイルにも同様の旧構造参照がないか追加確認の要否

## 根拠
- Oracle 再検証 (Epic #421 post-implementation review) で検出
- REQ-0039 で `promoted/req-define/` → `promoted/*.md` フラット化を実施 (PR #428)
