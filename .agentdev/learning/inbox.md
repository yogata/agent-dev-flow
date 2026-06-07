# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

### L-20260607-01: ADR再編成の3区分パターン

- **文脈**: Issue #653 (ADR責務境界是正)。ADR-0017の責務境界に基づき11件のADRを再分類
- **学び**: 技術判断含有無を基準に「圧縮（技術判断あり、詳細は分離）/ deprecated（技術判断なし）/ 維持」の3区分に分類する手法は、文書体系の健全性回復に有効。deprecated化時には本文に誤分類理由・移管先候補を明記し、README.mdのstatus viewと矛盾させない運用が重要
- **適用範囲**: 今後のADR/REQ/SPEC文書体系の見直し、誤分類の検出と是正

### L-20260607-02: 「禁止条件」の明示パターン

- **文脈**: Issue #653 (ADR禁止ゲート追加)。5つのcommand/skillにADR化禁止条件を追加
- **学び**: ガイドラインに「〜すべき」だけでなく「〜してはならない」条件を明示的に列挙することで、同種の誤分類を構造的に防止できる。adr-guidelinesの10項目の禁止条件、req-defineのStep 5a REQ/SPEC相当判定ゲートが具体例
- **適用範囲**: 他のコマンド/skillの品質ゲート設計、誤操作防止の仕組み化

### L-20260607-03: runtime path 明示規約の有効性

- **文脈**: Issue #655 (メタ品質基準)。command-authoring に runtime path 規約（source=src/opencode/..., runtime=.opencode/...）を追加
- **学び**: エージェントは source と runtime のパスを混同しやすい。特に SKILL.md 内の @path 参照やコマンド内のファイルパス指定で混同が発生する。runtime path を OK/NG 表で明示することで、エージェントのパス誤用を構造的に防止できる
- **適用範囲**: 今後の skill/command 作成時のパス参照、エージェント向け文書のパス表記

### L-20260607-04: skill 行数ガバナンス閾値の実践値

- **文脈**: Issue #655 (メタ品質基準)。skill-authoring に行数ガバナンス（≤400 OK, 401-500 警告, >500 抽出必須）を追加
- **学び**: skill-authoring SKILL.md は追加時点で 596 行であり、自身が導入した閾値に違反している状態。これは「既存文書の肥大化に気づく仕組み」としてガバナンス自体が機能していることを示す。閾値は新規作成時の予防と既存文書の段階的是正の双方に有効
- **適用範囲**: 今後の skill 文書の作成・拡張時の行数管理、既存 skill のリファクタ判断

### L-20260607-05: subagent edit safety の明示化

- **文脈**: Issue #656 (workflow品質)。subagent-protocol.md を新規作成し、worktree 内編集時の安全手順を明文化
- **学び**: subagent によるファイル編集で worktree 外への漏れ出し（main checkout の変更）や、ファイルパスの worktree プレフィクス省略が発生しやすい。edit 安全手順（プレフィクス確認・存在確認・worktree 内制約）を独立した protocol として明示することで、エージェントの誤操作を防止できる
- **適用範囲**: 今後の subagent を用いる skill/command の設計、worktree 運用全体

### L-20260607-06: Wave 境界横断残存参照の検出パターン

- **文脈**: Issue #656 (workflow品質)。Wave 境界をまたぐ変更時に残存参照を検出するチェック手順を追加
- **学び**: 複数 Wave にまたがる変更（namespace 変更、command deprecation、large rename）では、docs/ 内だけでなく .opencode/skills/ や references/ などの runtime 投影先にも旧名称の残存参照が残りやすい。Wave 境界横断をトリガーに grep sweep を拡張する条件付きチェックが効果的
- **適用範囲**: 今後の namespace 変更・command deprecation・large rename を含む Wave 設計
