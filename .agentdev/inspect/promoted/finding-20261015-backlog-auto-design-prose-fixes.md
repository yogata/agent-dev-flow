# backlog-auto Design 2 ファイルの表現是正（二重保持・裸列挙・対象外重複）

- 出所: inspect-docs 20261015T093252Z DS18・DS20・DS21（backlog-auto stage 1、系統識別 [inspect-docs]）
- 種別: 表現是正（Design 本文の単一参照点遵守・参照先明示・重複除去）
- 対象: `docs/designs/skills/agentdev-workflow-backlog-auto.md`、`docs/designs/commands/backlog-auto.md`
- 関連注記: REQ-114 反映未完了群（DB02〔配布物未追随・Case #3725 remaining work、PR #3727 に含まれる〕・DS17/DS19〔covers 実体欠落〕）と同根の可能性。統合・分割判断は backlog-review に委譲する。対象 Design は Case #3725 関連のため、Case #3725 完了後の処理を推奨する

## DS18: 同一ファイル内の契約文逐語二重保持

- target: `docs/designs/skills/agentdev-workflow-backlog-auto.md:78-101`（「現在の動作」小節群）と `:112-121`（「一気通貫実行の実行構造（REQ-114）」節）
- evidence: :80 と :116 が set-state 記録内容で逐語一致（現物実読で確認。:116 側は「set-state 永続化形式:」接頭辞と配置情報・保持期間を付加した同一内容文）。:89/:118（基準点確認手続）、:96-101/:120（リリース手順シーケンス）も同様の二重保持
- severity: medium / confidence: high
- source_of_truth: REQ-001（単一参照点原則）、REQ-032-025 の運用趣旨（作業記録の Design 本体二重保持回避）
- 処置方針: 「現在の動作」側へ集約し REQ-114 節を指針化する案、または両所同期義務の明記案のいずれか。選択は req-define 壁打ちに委譲する（「現在の動作＝現行状態記述」「REQ-114 節＝追加節」の意図的構成の可能性を含む。意図的構成でも更新時の二重編集義務が本文に明記されていない点は残る）

## DS20: 本文への審議参照の裸列挙

- target: `docs/designs/commands/backlog-auto.md:80-81`
- evidence: 「- RU-0227 AC-01〜AC-09」「- 対論型レビュー F-A/F-C/F-D/E-1/E-2/E-4/F-E/N-2」が検証観点の bullet 列に無文脈で連なる（現物実読で確認）。参照先文書の所在指示がない
- severity: low / confidence: medium
- source_of_truth: REQ-001（Design は現在設計のみ）、REQ-114（実行契約の正）
- 処置方針: 参照先の明示または「検証観点」節への統合。既存の審議アンカー慣行（case-close.md:274「（adversarial-review F3）」等）との様式整合を是正時に判断する

## DS21: 対象外項目の重複記載

- target: `docs/designs/commands/backlog-auto.md:78` と `:94-95`
- evidence: :78「対象外: 子ワークフロー内部ロジックの再実装、Epic/Wave 構成規則・共有並列上限・依存判断の再定義、major/minor 自動判定、本番自動配備」が対象外節 :94「子ワークフロー内部ロジックの再実装、Epic/Wave 構成規則・共有並列上限・依存判断の再定義」・:95「major/minor バージョンの自動判定、本番環境への自動配備」と同内容で二重出現（現物実読で確認）
- severity: low / confidence: high
- source_of_truth: REQ-114.md 適用範囲対象外（:36-42）が一次
- 処置方針: 対象外節への集約（:78 側の bullet を REQ-114 対象外への参照または削除に置換）

## review 検証記録（Jev 先行評価 + adversarial-review 2026-10-15、backlog-auto stage 2 inspect 系統）

- Jev 先行評価（観測 20261015T094749Z-77ac、confidence 0.91・15 項目全て top-1 妥当）: DS18 は promote 0.46 / defer 変更 0.42 の近接対抗。adversarial-review Stream A で defer 論（Case #3725 完了後の REQ-114 反映 Wave への一括・意図的構成の可能性）を検証した結果、採否（inspect-promote 責務）と統合判断（backlog-review 責務）の分離により promote 維持と合意した（本成果物に同根注記を付す。前例: 20260929T165249Z DS-21/DS-24/DC-14 の対象統合を「backlog-review で束化判定」として処理）
- Stream B（証拠適合）: DS18 の :80/:116 逐語一致、DS20 の :80-81 裸列挙、DS21 の :78/:94-95 重複を現物実読で確認済み
- HITL 0件・破壊的変更なし
