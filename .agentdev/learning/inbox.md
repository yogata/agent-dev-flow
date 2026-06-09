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

### L-20260608-01: Junction worktree の git worktree remove 失敗パターン

- **問題事象**: Windows 環境で junction ベースの worktree（.worktrees/683-feature）に対して `git worktree remove` を実行したところ、"Not a directory" エラーで失敗した
- **発生局面**: 実装（case-close Step 7: worktree 削除）
- **検知方法**: コマンド実行時のエラー出力
- **根本原因**: Windows の junction（ディレクトリシンボリックリンク）が git worktree remove の内部実装で通常ディレクトリとして扱われない。git worktree list では既に表示されない状態（prune 対象）になっていた
- **自律対応内容**: `git worktree prune` で管理情報をクリーンアップし、その後ローカルブランチ削除とリモートブランチ削除は正常に完了
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: Windows 環境で junction を使用する全 worktree で同様に発生する可能性がある。worktree 作成時に junction を使う install-consumer-opencode.ps1 でも同問題が想定される
- **再発条件**: Windows + junction worktree + git worktree remove の組み合わせ
- **予防策候補**: worktree 削除手順に「junction 環境では git worktree remove が失敗する可能性があるため、失敗時は prune + 手動ディレクトリ削除にフォールバック」を明記
- **想定反映先**: agentdev-git-worktree/references/worktree-operations.md の削除手順セクション
- **関連**: .worktrees/683-feature, PR #687, Issue #683
- **タグ**: `#worktree` `#windows` `#junction` `#cleanup`

### L-20260608-02: 配布境界品質の固定参照除去パターン

- **文脈**: Issue #695 (配布境界品質改善)。37ファイルから REQ-ID/ADR-ID/src/opencode/repo-local 参照を除去
- **学び**: 配布物からの固定参照除去では3つの除外カテゴリを明確に区別する必要がある: (a) code block 内の検出パターン例示 (b) 検査ルール自体の記述（NG例・チェックリスト・教育用対照表） (c) frontmatter tags。(b) の判定が最も難しく、command-authoring の source/projection 対応表は教育目的で src/opencode/ を含むが、これは検出ルールの除外対象として扱うのが適切。形式例示（ADR-0111の次→ADR-0112 等）は汎用プレースホルダー（ADR-NNNN）に置換することで、教育価値を維持しつつ固定参照を除去できる
- **適用範囲**: 今後の配布物クリーンアップ、docs-check 検出ルールの設計、教育コンテンツと固定参照の境界判断

### L-20260609-01: chars/4概算の日本語過小評価傾向

- **文脈**: Issue #699 (Command/Skill token削減)。chars/4 をトークン概算として導入し、8ファイルの薄型化を実施
- **学び**: 日本語テキストにおいて chars/4 は実際のトークン消費を過小評価する傾向がある（例: skill-authoring/SKILL.md は要件docで5,450tkと見積もったが実際は3,789tk）。しかし逆に、要件docの測定が過大だった可能性もある。chars/4 は「目安」として十分実用的だが、精确な測定には tokenizer が必要。REQ-0103-082 で「日本語過小検出は許容」とした判断は実践的に妥当
- **適用範囲**: 今後の token 予算管理、skill/command のサイズ閾値判定

### L-20260609-02: 同型分岐の共通手順+差分表パターン

- **文脈**: Issue #699 (Command/Skill token削減)。case-open.md でマルチREQ Epic flowと単一REQ Epic flow を共通Steps+差分表に統合
- **学び**: 同じ手順が分岐ごとに重複記述されている場合、共通手順＋差分表（5行程度）に統合することで大幅なトークン削減が可能（case-open.md: 152行→129行）。セマンティクスは完全維持。このパターンはREQ-0103-085でSHOULD化済み
- **適用範囲**: 今後の command 定義での分岐記述、skill 内の類似手順統合
