# QG-1: Definition Integrity Gate

要件定義フェーズ（req-define/ req-save）で生成される成果物の構造的完全性を検証する Gate。本ファイルは QG-1 の判定基準、検査観点を定義する。共通契約は [common-gate-contract.md](common-gate-contract.md) を参照。

## 配置

| コマンド | 配置ステップ | 対象成果物 |
|---------|-------------|-----------|
| req-define | Step 3（既存REQ照合、SPLIT予兆計測）〜Step 10（要件doc確認、ドラフトSPLIT予兆計測） | 要件doc draft（`.agentdev/drafts/req-draft-*.md`） |
| req-save | Step 3（ドラフト検証）〜Step 4（REQ 操作） | REQ ファイル（`docs/requirements/REQ-*.md`）、ADR ファイル（`docs/adr/ADR-*.md`） |

## 検査観点

### 1. REQ/ SPEC 分類

各要件行候補が「変更後仕様（REQ/SPEC 相当）」か「反映作業（コマンド実行、ファイル移動等）」か正しく分類されているか。詳細な分類基準は `agentdev-req-analysis` を参照。

- **fail**: REQ にすべき内容が反映作業として扱われている、またはその逆。
- **warn**: 分類は妥当だが境界が曖昧な候補がある。

### 2. ADR ゲート

ADR 候補が REQ/SPEC 相当でないか（ADR禁止ゲート）。作業手段 ADR（削除、廃止、移行、統合そのものを主題とするもの）が除外されているか。

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

要件doc/ REQ ファイルがテンプレート（`doc_requirement.md`）の【必須】セクションを全て含むか。SPEC候補セクション（`## SPEC候補`）は補助（任意）セクションであり、必須セクションの完全性判定対象外である。

- **fail**: 必須セクション（目的/ 要件/ 適用範囲 等）の欠落。

### 6. REQ/SPEC 配置判定

要件行候補が REQ に記述すべき外部契約、状態要件であるか、SPEC、rule catalog、command reference 等に配置すべき詳細、内部パラメータであるかを判定する。判定基準は `agentdev-req-analysis` の REQ/SPEC 境界判定基準（-069, -055）に従う。

- **fail**: REQ に記述すべき外部契約、状態要件（公開 command 名、ドメイン状態の位置づけ、接続契約、安全境界等）が SPEC 等にしか配置されていない。または SPEC 等に配置すべき詳細、内部パラメータ（schema field、enum 値一覧、判定表、内部アルゴリズム等）が REQ 要件行を専有している。
- **warn**: 安定契約例外の適用境界が曖昧な候補がある。REQ/SPEC 両方に要約と詳細を分割すべき候補が未整理。
- **pass**: 各要件行が REQ/SPEC 境界判定基準に適合し、安定契約例外が必要な箇所は REQ に要約、SPEC 等に詳細が分割されている。

### 7. SPEC 候補分離の妥当性

SPEC 等に配置すべきと判定された要件行候補が、ドラフトの `## SPEC候補` 補助セクションと `draft-meta.spec-candidates`（SC-ID、content、intended_spec、classification、source）に分離されているか。各 SPEC 候補に想定配置先 SPEC と分離根拠（該当種別）が記録されているか。

- **fail**: SPEC 等に配置すべき要件行候補が REQ 要件行に残留している（SPEC 残留）。または SPEC 候補に想定配置先 SPEC、分離根拠が未記録。
- **warn**: 安定契約例外の適用境界が曖昧で、SPEC 候補と REQ 要件行の振り分けが判断余地のある候補がある。
- **pass**: SPEC 候補が全て `draft-meta.spec-candidates` に分離され、各候補に想定配置先 SPEC と分離根拠が記録されている。安定契約例外は REQ に要約として残されている。

### 8. SPLIT 予兆の記録

既存 REQ を APPEND/UPDATE 対象とする場合、または生成ドラフトの要件行数が 51 行を超える場合、`draft-meta.split-forecast`（target、metrics、signals、total、recommended_action、thresholds_ref）が記録されているか。閾値の正は `docs/specs/req-health-metrics.md` とする。

- **fail**: 記録すべき SPLIT 予兆（要件行数 51+、関心分類数 2+、成果物種別数 3+ のいずれか）があるのに `draft-meta.split-forecast` が未記録。
- **warn**: split-forecast は記録されているが推奨アクション（SPLIT 検討、SPLIT 推奨）に対するユーザー応答が未確認。
- **pass**: SPLIT 予兆がない、または split-forecast が記録され推奨アクションがユーザーに提示されている。

### 9. auto_gate完全性

要件doc draft の `auto_gate` フィールドが、req-define の完了条件として妥当に設定されているか（REQ-0102-070, REQ-0102-071）。`auto_ready:false` の場合は `stop_reasons` が記録され、かつユーザー承認（合意による解消、または明示的な false 選択）が得られているか。

- **fail**: `auto_gate` フィールドが不在、または `auto_ready:false` で `stop_reasons` が空。
- **warn**: `auto_ready:false` で `stop_reasons` が記載されているが、ユーザー承認（合意による解消、または明示的 false 選択の `conflict_resolutions` 記録）が未確認。
- **pass**: `auto_ready:true`、または `auto_ready:false` で `stop_reasons` がユーザー承認済み（`conflict_resolutions` 記録済み）。

## pass/ warn/ fail 基準

- **pass**: 上記 1〜9 の全てを満たす。
- **warn**: 構造は保たれているが改善推奨事項がある（主に観点 3 の粒度、観点 6 の境界曖昧候補、観点 7 の安定契約例外適用境界、観点 8 の推奨アクション未確認、観点 9 のユーザー承認未確認）。進行可能。
- **fail**: 構造的欠陥がある（観点 1, 2, 5, 6, 7, 8, 9 の fail）。req-define へ差し戻し。

## 委譲接続点

QG-1 の検査をサブエージェントに委譲する場合:

- サブエージェントは分類候補、測可能性判定候補、根拠のみを返す。
- 親エージェントが pass/warn/fail を確定し、ドラフト反映判断を行う。
- 具体的な委譲接続点は req-define/ req-save の各 Step（4-2 分類ゲート, 5-1 ADR禁止ゲート 等）を参照。

## 責務境界

- QG-1 は**判定のみ**行う。ドラフト編集、REQ 保存は req-define/ req-save コマンドの責務。
- QG-1 fail 時の差し戻し判断はユーザーが行う（自動差し戻し禁止）。

## See Also

- [common-gate-contract.md](common-gate-contract.md)
- **agentdev-req-analysis**: チェックボックス品質基準、REQ/SPEC 分類基準
- **agentdev-adr-guidelines**: ADR 判定基準


