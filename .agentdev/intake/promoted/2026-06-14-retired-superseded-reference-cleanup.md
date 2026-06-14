# active文書がretired/superseded ADR・REQをcurrentとして引用（多数・要個別判断）

## 観測

retired済みのADR-0001〜0023・REQ-0001/0004/0050/0111、およびsuperseded済みのADR-0111が、非retired文書（REQ・current ADR・SPEC・guide・README・AGENTS.md）でcurrent文脈の参照として使われている。integrity check（`accepted-adr-only-citation`, `retired-adr-as-current`, `retired-req-as-current`, `retired-req-primary-ref`）でWarning約40件が検出されている。各参照の多くは移行履歴・supersedes関係など歴史文脈と見られるが、機械検査では一律warningとなる。

### 対象箇所

**REQ-0119 / ADR-0111 引用（superseded ADR）:**
- `docs/requirements/REQ-0119.md`: ADR-0111（status: superseded）をcurrent根拠として引用。Warning 1件（`accepted-adr-only-citation`）

**retired ADR/REQ の current 引用（約40件）:**
- `docs/requirements/REQ-0112.md`: ADR-0001, 0004, 0007, 0009, 0014, 0015, 0017, 0018, 0019, 0020
- `docs/requirements/REQ-0119.md`: REQ-0111
- `docs/adr/ADR-0101.md`: ADR-0005, 0004 / `ADR-0102.md`: ADR-0013 / `ADR-0103.md`: ADR-0014, 0017 / `ADR-0104.md`: ADR-0015, 0016, 0018 / `ADR-0105.md`: ADR-0019 / `ADR-0106.md`: ADR-0020 / `ADR-0107.md`: ADR-0001 / `ADR-0108.md`: ADR-0002 / `ADR-0109.md`: ADR-0006 / `ADR-0110.md`: ADR-0007, 0008, 0004, REQ-0004 / `ADR-0111.md`: ADR-0011
- `docs/specs/document-model.md`: ADR-0001, 0017 / `docs/specs/integrity-rule-catalog.md`: ADR-0001 / `docs/specs/patterns.md`: ADR-0001, REQ-0001, REQ-0111 / `docs/specs/system.md`: REQ-0001, REQ-0111
- `docs/guides/project-docs-and-specs.md`: ADR-0001, REQ-0001, 0050, 0111 / `docs/README.md`: REQ-0001, 0050, 0111 / `docs/requirements/README.md`: REQ-0111 / `AGENTS.md`: REQ-0111

## 影響

- 読者がretired/superseded文書を現行の権威ある根拠と誤認しうる
- AGENTS.md「リタイア済みREQを現在の権威として引用しないこと」方針との関連
- integrity check結果が恒常的に約40件のwarningを含む（ノイズ増大）

## 課題

各参照について、歴史文脈参照として妥当か、current参照として是正が必要かを個別判断する。妥当な歴史参照には注記を追加し、不適切なcurrent参照は後継文書へ差し替える。件数が多く（約40件）、参照ごとの判断が必要。

## 既存要件との関連

- REQ-0108-125: `accepted-adr-only-citation` 検査
- REQ-0112-050: accepted ADR以外の引用検出
- AGENTS.md「信頼できる情報源の優先順位」: リタイア済みREQの引用制限
- AGENTS.md「リタイア済みREQを現在の権威として引用しないこと」

## 対応方針

1. 約40件の参照をファイル単位で分類（歴史参照妥当 / current参照不適切 / 判断保留）
2. current ADR側のsupersedes表記は歴史参照として妥当かを確認
3. 不適切なcurrent参照を後継文書へ差し替え、または歴史参照である旨を明記
4. 整理後にintegrity checkでwarning件数が減少することを確認

## 根拠

- 元item: `.agentdev/intake/inbox/2026-06-14-req-0119-cites-superseded-adr-0111.md`（REQ-0119/ADR-0111引用）+ `.agentdev/intake/inbox/2026-06-14-retired-adr-req-cited-as-current-in-source-docs.md`（retired ADR/REQ引用 約40件）
- 観測元: integrity check結果（`accepted-adr-only-citation`, `retired-adr-as-current`, `retired-req-as-current`, `retired-req-primary-ref`）
- 検査根拠: REQ-0108-125 / REQ-0112-050
