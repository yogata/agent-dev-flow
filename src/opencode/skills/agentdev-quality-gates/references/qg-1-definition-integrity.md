# QG-1: Definition Integrity Gate

要件定義フェーズ（req-define / req-save）で生成される成果物の構造的完全性を検証する Gate。本ファイルは QG-1 の判定基準・検査観点を定義する。共通契約は [common-gate-contract.md](common-gate-contract.md) を参照。

## 配置

| コマンド | 配置ステップ | 対象成果物 |
|---------|-------------|-----------|
| req-define | Step 4（要件展開）〜Step 9（ドラフト保存） | 要件doc draft（`.agentdev/drafts/req-draft-*.md`） |
| req-save | Step 3（ドラフト検証）〜Step 4（REQ 操作） | REQ ファイル（`docs/requirements/REQ-*.md`）・ADR ファイル（`docs/adr/ADR-*.md`） |

## 検査観点

### 1. REQ / SPEC 分類

各要件行候補が「変更後仕様（REQ/SPEC 相当）」か「反映作業（コマンド実行・ファイル移動等）」か正しく分類されているか。詳細な分類基準は `agentdev-req-analysis` を参照。

- **fail**: REQ にすべき内容が反映作業として扱われている、またはその逆。
- **warn**: 分類は妥当だが境界が曖昧な候補がある。

### 2. ADR ゲート

ADR 候補が REQ/SPEC 相当でないか（ADR禁止ゲート）。作業手段 ADR（削除・廃止・移行・統合そのものを主題とするもの）が除外されているか。

- **fail**: REQ/SPEC 相当の内容が ADR 候補として提示されている。作業手段 ADR が ADR 候補に含まれている。
- **pass**: ADR 候補が技術判断（アーキテクチャ上の決定）を含む。既存 ADR との重複確認済み。

### 3. チェックボックス測可能性

要件doc のチェックボックスが測定可能（measurable）かつ一意（unambiguous）か。基準は `agentdev-req-analysis` の品質基準に従う。

- **fail**: チェックボックスが測定不能（例: 「適切に処理する」等の主観表現のみ）。
- **warn**: 測定可能だが粒度が粗い、または複数の意味を含む。
- **pass**: 各チェックボックスが客観的な達成基準を持つ。

### 4. ドキュメント分類妥当性

各要件の対象ドキュメント種別が `docs/specs/document-model.md` の Document Classification Policy に適合しているか。

- **fail**: SPEC にすべき内容が guides に、REQ にすべき内容が SPEC に、等の分類不適合。
- **warn**: 分類は妥当だが根拠が薄弱。

### 5. 必須セクション完全性

要件doc / REQ ファイルがテンプレート（`doc_requirement.md`）の【必須】セクションを全て含むか。

- **fail**: 必須セクション（目的 / 要件 / 適用範囲 等）の欠落。

## pass / warn / fail 基準

- **pass**: 上記 1〜5 の全てを満たす。
- **warn**: 構造は保たれているが改善推奨事項がある（主に観点 3 の粒度）。進行可能。
- **fail**: 構造的欠陥がある（観点 1, 2, 5 の fail）。req-define へ差し戻し。

## 委譲接続点

QG-1 の検査をサブエージェントに委譲する場合:

- サブエージェントは分類候補・測可能性判定候補・根拠のみを返す。
- 親エージェントが pass/warn/fail を確定し、ドラフト反映判断を行う。
- 具体的な委譲接続点は req-define / req-save の各 Step（4-2 分類ゲート, 5-1 ADR禁止ゲート 等）を参照。

## 責務境界

- QG-1 は**判定のみ**行う。ドラフト編集・REQ 保存は req-define / req-save コマンドの責務。
- QG-1 fail 時の差し戻し判断はユーザーが行う（自動差し戻し禁止）。

## See Also

- [common-gate-contract.md](common-gate-contract.md)
- **agentdev-req-analysis**: チェックボックス品質基準・REQ/SPEC 分類基準
- **agentdev-adr-guidelines**: ADR 判定基準
