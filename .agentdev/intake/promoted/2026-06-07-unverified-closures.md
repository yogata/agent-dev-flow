---
discovered_at: 2026-06-07
source: intake-promote inbox scan（19件一括処理）
tags: [intake, completion-criteria, unverified-closure]
---

# 未検証クローズ — 完了条件未チェックのままクローズされた Issue/PR

## 内容

複数の Issue で完了条件・テスト戦略のチェックボックスが未チェックのままクローズされている。実装自体は完了している可能性が高いが、検証が明示的に記録されていないため再確認が必要。

### 1. Epic #502 — Artifact Integrity Alignment (from #2)

完了条件9項目がすべて未チェックでクローズ。

未確認項目:
- `.opencode/skills/**/reference/` → `references/` 移行完了
- integrity-check の README index 抽出が `[REQ-NNNN](REQ-NNNN.md)` 形式に対応
- completion report 存在確認が Variant Registry + variant files で判定
- `mapping-table.md` の migration 用 retired REQ 参照が current-use warning 対象外
- `[URL]` 等 placeholder 記法が broken file link として扱われない
- ADR の naked retired REQ 参照が履歴参照として明示的表記
- `backlog-review` の implementation_pattern が command-map と整合
- load_skills 検査が pattern 固定 + substring matching だけで missing/excess を断定しない
- 検査ルール変更に regression fixture/test が含まれている

**根拠**: Issue #502

### 2. Issue #614 — Consumer repo install (from #4)

consumer install（REQ-0103-072~077）の完了条件12項目全未チェックでクローズ。

未確認項目:
- `scripts/` 配下に `sync-self-opencode.ps1` / `install-consumer-opencode.ps1` / `check-consumer-opencode.ps1` の配置
- root 直下の `sync-opencode.ps1` 削除
- `consumer-project-setup.md` への `.agentdev-plugin/` と script 分離の反映
- `artifacts-and-state.md` への `.agentdev-plugin/` 責務追加
- `README.md` への consumer install section 追加
- Consumer install が public runtime artifacts のみを対象としていること
- 推奨 .gitignore 方針の consumer-project-setup.md 記載
- 各 script の dry-run / check / apply モード動作確認

**根拠**: Issue #614

### 3. Epic #627 — 基盤整備パイプライン再構築 (from #5)

完了条件8項目がすべて未チェックでクローズ。

未確認項目:
- 全34要件（FPR-001〜FPR-034）の実装完了確認
- integrity-check 正常動作（エラー0件）確認
- 参照整合性0件（参照パス不存在・bare slash・廃止スキル参照・非accepted ADR引用）
- backlog-save 完全除去（コマンド・入口表・ガイド・テンプレート）
- backlog-review の RU 生成動作正常確認
- depends_on 検証動作正常確認
- パイプライン正常動作（learning-promote → backlog-review → req-define）
- 関連ドキュメント更新候補の直接矛盾（14ファイル）が全て解消されていること

**根拠**: Issue #627

### 4. RU Remediation 系列（RU-0001〜0006）(from #14)

不整合 Remediation 戦略に基づく6段階の完了条件全未達でクローズ。

- **RU-0001 台帳（#581）**: 台帳スキーマ文書化、integrity check 結果投入、全不整合エントリ化、ルート割り当て、台帳保存（5項目）
- **RU-0002 機械的修正（#584）**: strict_mechanical エントリ処理済み確認、修正後再検査、false_positive 根拠記録、deferred エントリ ルーティング（4項目）
- **RU-0003 旧語彙現行化（#585）**: REQ-0112 Pattern A/B/C/D 除去確認、旧語彙除去、分類済み確認、ambiguous/runtime ルーティング（4項目）
- **RU-0004 文書責務（#583）**: REQ-0101 guide count mismatch 解消、system.md stale references 更新、guides 内規範的 requirements 除去、未 acceptance ADR 引用確認、全意味矛盾解消（5項目）
- **RU-0005 Runtime 境界（#582）**: 全コマンド thin 確認、judgment/template/script 配置確認、.agentdev/ と .sisyphus/ 境界記述適合確認、runtime の docs/specs 暗黙依存確認、boundary_violation エントリ処理（5項目）
- **RU-0006 予防ゲート（#586）**: 語彙レジストリ作成、ゲート水準定義・反映、回帰テスト fixture 追加、authoring checklist 更新、false positive ルール文書化、REQ-0108 APPEND 候補確定（6項目）

**根拠**: Issue #580~#586
