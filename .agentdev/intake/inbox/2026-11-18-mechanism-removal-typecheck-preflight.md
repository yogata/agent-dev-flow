# intake: 機構撤去系変更での宣言側参照・消費側 import の取残し早期検証（typecheck 前置）

- **発見元**: Epic #4138 Wave-1 子 Issue #4142（OU-003）case-run。PR #4146 本文 Findings/ Capture候補
- **内容**: 先行する lib（distribution-boundary-baseline/exemptions）削除の際、tsconfig include 参照と check_distribution_boundary_cli.ts の未使用型 import が取残され typecheck が赤のままになっていた（PR #4146 で include 2行と import 1行を除去済み）。機構撤去系の変更では「宣言側参照（tsconfig include）」と「消費側 import」の取残し確認を一つの検証（typecheck）で早期に実施するのが有効
- **分類**: intake 候補（機構撤去系変更の検証手順改善候補。case-run 委譲契約への前置規律追加を検討する対象）
- **影響**: 機構撤去系変更で typecheck が赤のまま後続工程へ進むリスクが残存し得る（本件は PR #4146 内で解消済み）
- **再評価条件**: 機構撤去系・大規模削除系の変更を含む case-run 委譲契約を更新する Case の実行時（既存 learning「大規模 checker 手術では削除対象スクリプトを import / copyFileSync / fixture から逆方向 grep で先に列挙」と組合せて検討）
- **関連**: Issue #4142・PR #4146・Epic #4138・check_distribution_boundary 系（tsconfig.distribution-boundary.json）
