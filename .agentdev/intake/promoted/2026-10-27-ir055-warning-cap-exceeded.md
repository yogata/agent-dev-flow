# IR-055 warning_total_cap 超過（49から60、cap 58）の処置判断

## 観測内容

- Case #3862（REQ-009-053）の合意済み対象範囲（IR-044 req-spec 行パターン dead check 解消）により、既存 REQ（REQ-001、REQ-008、REQ-010、REQ-014、REQ-034、REQ-061、REQ-094、REQ-103）の Design 候補行 11件が初めて warning 検出され、pre-demote warning total が 49 から 60 になり `ir-055-baseline.json` の warning_total_cap（58）を超えた
- 本 Case では検出の黙殺・cap の無断変更・検出弱体化を行わず、PR 本文 Findings と Issue 工程記録コメントへ記録して完了した

## 影響

- warning total が cap を超過した状態が継続し、check_integrity が稼働 NG（exit 1）構成要素を持つ。リリース前の「正常な検証」条件に抵触する。
- 60 warning の実体は REQ/Design 分離基準違反（Design 候補行の REQ 行残存）の実債務の顕在化である。

## 確定した処置（HITL 代理回答 2026-10-27 確定）

**(b) を後続要求として採用し、実施までの間 (c) を維持。(a) の cap 変更は不採用。**

根拠:
- (i) 60 warning は IR-044 dead check 解消により顕在化した正当な検出（8 REQ の Design 候補行11件 = REQ/Design 分離基準違反の実債務）であり、(a) の cap 引上げは実債務の新常態化で ratchet の意味論（債務可視化）を弱体化する
- (ii) (b) は document-type-responsibilities の分離基準に沿った根本解消であり、本 backlog-auto サイクルの RU 一式（docs 機械修正系と同種の docs_chore 作業）に含めて req-define → case-auto で実施するのが最短の解消経路
- (iii) 修正完了後は warning 総数が cap 58 を下回り ratchet は自然に維持される（cap 変更は最後まで不要）
- (iv) check_integrity exit 1 の稼働 NG 構成要素が解消され、リリース前の「正常な検証」条件に合致する

後続要求（RU）の内容: 該当 8 REQ の Design 候補行 11件の分離修正（REQ/Design 分離基準への準拠）。実施まで warning total 60 は記録残件として維持（cap 変更なし）。

## 課題

- 後続要求（RU）を backlog-review 経由で RU 化し、req-define → case-auto で実施する。

## 既存要件との関連

- IR-055（warning_total_cap ratchet）、IR-044（req-spec 行パターン dead check）、REQ/Design 分離基準（document-type-responsibilities）、Case #3862、PR #3864

## 出典

- 観測元: PR #3864 本文「Findings / Capture候補（2026-10-26 第2ラウンド）」セクション、Case #3862 工程記録コメント（6419252754、6419460990）
- 実測証跡: check_integrity.ts --json 本体実行（NG 4件のうち RuntimeReference 1件が warning-cap、IR-044 warning 11件、pre-demote warning total 60）。QA レーン独立再観測（.agentdev/tmp/case-3862-close/qa-review3-archived/check-integrity-full.json）
- 分類確定: HITL 代理回答（利用者の権限付与による Hermes 監督・根拠記録済み。2026-10-27）
