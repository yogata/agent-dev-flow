# リリースノート草稿 — v5.1.1（準備物・公開は所定経路）

- リリース: v5.1.1（ターゲット 17cce65b、2026-10-16、backlog-auto 一気通貫 run 20261015T180807JST 由来）
- 基準: v5.1.0 からのパッチ増分（1 件のみ・事前タグ付与なし・混入コミット 0 を実測）

## 主な変更（11 実装 PR + Definition 更新）

### 修正
- case-ready 受入検査の overlap 要約が構造化警告（condition_a.warnings / detection_unavailable）を 0 件と誤表示する不具合を修正（#3733 / PR #3753）
- prepare_definition_pr.ts の既存型エラー 4 件（TS18048×2・TS2783×2）を解消（#3736 / PR #3747）
- traceability gate 入力（traceabilityReqIds）の不在・空・不整合を fail-closed 検証（#3734 / PR #3751）
- REQ-010-081 の implementation 対応を check_integrity 宣言へ追加し traceability 完全性を解消（#3740 / PR #3748）
- 一時 Git fixture の改行警告を解消し既存テスト回帰 2 件を正常化（#3741 / PR #3750）

### 追加
- content-corruption checker に既知混入形確定一致シグナル（known-corruption-literal、初期列挙「卡out」）を追加（#3746 / PR #3756）
- case-open/case-ready/case-run の 3 reference に書込み前 extension rules 解決工程を追加（#3739 / PR #3755）
- case-open STEP-4 に README 手動件数照合手順を追加（#3738 / PR #3754）
- lint_skills 出力 summary の NG/warning 区別と実行環境差の記録（#3743 / PR #3749）
- case-open reference 手順6 に labels 必須契約の注記（#3737 / PR #3752）
- REQ 行 8 行を追加（REQ-061-051、REQ-030-028/029、REQ-010-081〜083、REQ-017-024、REQ-095-004）（PR #3730）

### 文書
- backlog-auto Design の裸 ID 列挙を節参照へ集約（DS18/20/21）（#3744 / PR #3757）

## 検証
- bun test 4681 pass / 0 fail（正規 3 分割）・typecheck 0 エラー・check_integrity exit 0・traceability check 11/0

## 環境情報
- テスト: bun（正規 3 分割）、Windows 環境（git 管理外ローカル スキル 4 件の走査差は環境ラベル記録）

## 既知の未解決
- REQ-114 全行の implementation/verification 対応は本リリース対象外（親 Case #3725 側の継続義務として記録済み）
