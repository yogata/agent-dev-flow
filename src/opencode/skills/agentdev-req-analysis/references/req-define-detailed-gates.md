# req-define 詳細ゲート

req-define が要件 doc を生成する際の詳細ゲートを定義する。親エージェントは壁打ち、要件 doc 生成、ドラフト保存、ユーザー提示を担当する。サブエージェントへ委譲する場合は探索・検査・分類候補・根拠抽出のみを依頼する。

## 変更影響候補抽出

1. 変更種別を判定する。
2. キーワードを抽出する。
3. 限定探索を行う。対象は `docs/specs/**`、`docs/requirements/**`、`docs/DOC-MAP.md`、`docs/adr/**`、`docs/README.md`、`.opencode/commands/**`、`.opencode/skills/**` とする。
4. 探索結果を直接矛盾 / 更新候補 / 影響なしに分類する。
5. REQ だけでなく ADR / SPEC / guides / DOC-MAP / commands / skills への影響候補を明示する。
6. 結果をドラフトに保持する。

この step は要求定義時の局所的な影響候補抽出であり、`/agentdev/inspect-docs` の全体意味レビューの代替ではない。

## 分類ゲート

各要件行候補を「変更後仕様」または「反映作業」に分類する。反映作業のみの候補は要件本文へ混入させず、移送候補としてマークする。

### SPEC 候補抽出（分類ゲート併用・REQ-0136-010）

分類ゲートの実行と併せて、各要件行候補に REQ/SPEC 境界判定（REQ-0101-067〜069）を適用し、SPEC 等に配置すべき候補を SPEC 候補として分離する。手順:

1. 各要件行候補の主たる文意が「外部契約・状態要件（REQ）」か「詳細・内部パラメータ（SPEC 等）」かを判定する（REQ/SPEC 境界判定基準に従う）。
2. SPEC 等に配置すべきと判定された候補は REQ 要件行に採用せず、`draft-meta.spec-candidates` にエントリを追加する。各エントリは以下のフィールドを持つ:
   - `id`: `SC-{NNN}`（3桁ゼロ埋め連番）
   - `content`: SPEC 候補の内容
   - `intended_spec`: 想定配置先 SPEC ファイルパス（例: `docs/specs/patterns.md`）。該当する既存 SPEC がなければ `new:{topic-slug}` とする
   - `classification`: REQ-0101-068 の SPEC 分離基準該当種別（schema field / enum 値一覧 / route・category・status 詳細判定表 / file pattern / template variant / report format / fixture detail / regression test 条件 / checker 個別ルール / false positive 抑制方式 / retry 回数 / token 目安 / 行数上限 / Step 番号 / Phase 番号 / 内部アルゴリズム / 作業履歴）
   - `source`: 元候補の出處（壁打ち候補行番号 または 対象 REQ の要件行 ID `REQ-NNNN-MMM`）
3. 安定契約例外（REQ-0101-069）に該当する候補は SPEC 候補から除外し、REQ に要約として残す（詳細は SPEC 等に分割してもよい）。

サブエージェントへ委譲する場合は SPEC 候補と分離根拠のみを返し、親エージェントが `draft-meta.spec-candidates` への記録を確定する。

## 文書分類妥当性検証

各要件の対象ドキュメント種別が `docs/specs/document-model.md` の Document Classification Policy に適合しているか検証する。不適合な文書種別を持つ要件は flag としてマークする。この検証は反映作業分類とは独立した文書種別の妥当性確認である。

### SPEC 残留検出（文書分類妥当性検証併用・REQ-0136-010）

REQ 要件行として残った各行について、SPEC 分離基準（REQ-0101-068）違反の残留がないか検出する。検出シグナルは SPEC 分離基準の9種別（schema field・enum 値一覧・fixture detail・checker 個別ルール・false positive 抑制・Step 番号・Phase 番号・内部アルゴリズム・作業履歴）を参照する。手順:

1. REQ 要件行の主たる文意が上記9種別のいずれかに該当する場合、SPEC 残留候補とする。否定文・境界条件・補足の文脈は検出対象外とする。
2. 安定契約例外（REQ-0101-069）に該当する要件行は検出対象外とする。
3. SPEC 残留候補を検出した場合、当該行を REQ 要件行から SPEC 候補へ移送し、`draft-meta.spec-candidates` に追加する（分類ゲートと同じフィールド構造）。
4. 検出結果は QG-1 観点 6（REQ/SPEC 配置判定）の入力となる。

サブエージェントへ委譲する場合は SPEC 残留候補と根拠のみを返し、親エージェントが移送判断を確定する。

## SPLIT 予兆計算（REQ-0136-011）

Step 3-2（既存REQ）および Step 10-2（生成ドラフト）で REQ 健全性メトリクスを計測し、`draft-meta.split-forecast` に SPLIT 予兆を記録する。閾値の正は `docs/specs/req-health-metrics.md` とする。

### 計測手順

1. **要件行数**: 対象 REQ（または生成ドラフトの要件テーブル）の `^| REQ-NNNN-\d{3} |` に一致する行数を計測する。目的・適用範囲セクションの散文は除外する。
2. **関心分類数**: 以下4シグナルの検出数を集計する（`agentdev-req-structure-diagnostics` スキルの SPLIT 観点に準拠）:
   - 関心対象（要件の主題となる対象領域）の複数混在
   - 複数 artifact 種別の混在（command + skill + template 等）
   - 複数 command family の混在
   - 複数 lifecycle 段階の混在
3. **artifact 種別数**: `docs/specs/req-impact-map.md` の「影響する Artifact」列、または要件本文の対象 artifact 記述から集計する。新規 CREATE のドラフトで影響マップに未載の場合は要件本文から推定する。

### シグナル算出

| メトリクス | 閾値 | SPLIT シグナル |
|---|---|---|
| 要件行数 | 0〜50 / 51〜80 / 81+ | +0 / +1 / +2 |
| 関心分類数 | 0〜1 / 2+ | +0 / +1 |
| artifact 種別数 | 1〜2 / 3+ | +0 / +1 |
| SPEC分離基準違反（high-specificity） | 0 / 1以上 | +0 / +1（安定契約例外は対象外） |

合計シグナルに基づく推奨アクション: 0〜1 → no-action/APPEND、2 → SPLIT 検討、3+ → SPLIT 推奨。

### `draft-meta.split-forecast` 構造

```yaml
split-forecast:
  target: "REQ-0101"        # 既存REQ ID、または "draft" / "new"
  metrics:
    requirement_lines: 84
    concern_classifications: 2
    artifact_types: 1
    spec_separation_violations: 0
  signals:
    requirement_lines: 2     # 81+ → +2
    concern_classifications: 1  # 2+ → +1
    artifact_types: 0        # 1-2 → +0
    spec_separation: 0
  total: 3
  recommended_action: "SPLIT推奨"
  thresholds_ref: "docs/specs/req-health-metrics.md"
```

推奨アクションが SPLIT 検討（合計2）以上の場合、req-define はユーザーへ SPLIT 要否を提示する。APPEND を継続する場合はその理由をドラフトに明記する。新規 CREATE のドラフトで要件行数が 51 行を超える場合も肥大化傾向としてユーザーへ提案する。

## ADR 禁止ゲート

ADR 候補を提示する前に、REQ / SPEC 相当判定を行う。以下に該当する場合、ADR 候補から除外し、REQ / SPEC 更新候補として整理する。

1. 仕様変更のみを含み、技術的決定がない。
2. command 動作仕様の定義である。
3. workflow 定義または状態遷移の記述である。
4. 命名規約または directory 規約の変更である。
5. 運用ルールの変更である。
6. template 形式または入出力形式の変更である。
7. 非技術的合意事項の記録である。

分類先は以下を基準にする。

- 振る舞い・制約・状態: REQ 更新候補
- schema・path・lifecycle: SPEC 更新候補
- 方針・ガイドライン: guide 更新候補

## ADR 判断根拠の記録

ADR 判断後、判断根拠をドラフトに保存する。記録項目は判断結果、適用基準、根拠事実を含める。

## 複数 RU 処理

Step 1 で 2 件以上の RU が検出または指定された場合、全ての RU を同時入力として扱う。単一の壁打ちセッションで複数 RU を一括処理対象とする。

入力 RU 群は統合または分離を判定する。同一トピック、同一対象 REQ、同一理由の場合は 1 つの req-save 操作に統合する。いずれかが異なる場合は個別の req-save 操作に分離する。判定結果は draft-meta に記録する。

統合または分離後の各操作単位について、対象 artifact（REQ / SPEC）、操作種別、要件候補一覧、依存関係を req-save / spec-save が消費可能な形式で出力し、ドラフト内に保持する。操作種別は対象 artifact により2系統とする（REQ-0136-013）:

- **REQ 操作**（`target_req` フィールド指定）: `create` / `append` / `update`。req-save が消費
- **SPEC 操作**（`target_spec` フィールド指定）: `spec-create` / `spec-update`。spec-save が消費

両系統は後方互換性のため既存の `create` / `append` / `update` を維持する。SPEC 候補（Step 4-2/4-3 で分離した `draft-meta.spec-candidates`）が存在する場合、対応する SPEC 操作 OU を生成し `target_spec` に想定配置先 SPEC パスを設定する。

## Epic 規模記録

scale が large かつ Epic 規模と判定された場合、`scale: large` と分解計画を draft-meta に記録する。複数 RU にまたがる Epic の場合は、関係する RU 群を関連付けて記録する。

操作間に逐次制約が存在する場合は、wave 候補および依存関係を draft-meta に記録する。順序依存があれば明示する。
