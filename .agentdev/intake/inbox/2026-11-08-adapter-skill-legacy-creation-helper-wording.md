# agentdev-case-run-execution-adapter SKILL.md L94 の旧機構（作成ヘルパー・作成時機械登録・台帳登録接続）参照文言の現行化

## 観測事実

- Case #3966（PR #3976）で close_mechanical_steps.ts から旧機構（作成時機械登録・作成先拒否・台帳登録接続）の実行経路が除去された。agentdev_gh の機械受理・residue 検査は維持され、受け入れ評価接続へ再構成された。
- `src/common/skills/agentdev-case-run-execution-adapter/SKILL.md` L94（検証用一時資材の作成報告節）は「正規の作成経路は作成ヘルパー経由の作成時機械登録であり…報告を受領した委譲元の実行処理が台帳へ登録する」「作成先確認の制約（作成ヘルパーの機械検査に接続）」「作成先違反は登録時に機械拒否される」等の文言を現行のまま含む。
- 作成ヘルパー・台帳系モジュール自体（verification-resources-ledger.ts・verification-resource-register.ts・deletion-confirmation.ts・verification-resource-reclamation.ts 台帳部分）の実体撤去は RA-002（#3970）が所有する。REQ-119-007（TS-008）が「Design 正本本体・実装は変更対象外」を明示し、adapter SKILL の文言現行化を別作業単位として所有する。

## 具体的な修正対象

- adapter SKILL.md L94 の文言を、現行の受け入れ評価接続（後片付けは作業完遂責任の一部・報告義務は v4-delegation-contracts Design「検証用一時資材の作成・報告義務」節）へ再整合する。REQ-119-007（TS-008）または RA-002 完了後の後続実現単位で対応。
- 台帳系モジュール撤去（RA-002・#3970）時に同文言の参照先（台帳の保存場所・空状態区別の Design 節）が後継記述へ追随していることを確認する。

## 関連

- Case #3966・PR #3976 本文 Findings（case-run 委譲 DEL-3966-1 の corpus 検索で検出・所有者分類済み）
- REQ-119-007（TS-008）・RA-002（#3970）・REQ-118（検証に伴う一時資材の取扱いと後片付け責任）
