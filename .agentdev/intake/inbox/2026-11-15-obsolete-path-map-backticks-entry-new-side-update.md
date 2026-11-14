# obsolete-path-map.yaml の backticks-identifier-threshold 対照登録 2件の new 側パス不在解消

## 観測事実

- OU-003（Issue #4056、PR #4064）が docs/designs/integrity/backticks-identifier-threshold.md を document-type-responsibilities.md へ統合して廃止した。
- .opencode/skills/repo-agentdev-integrity/data/obsolete-path-map.yaml に同文書を new 側とする履歴対照登録が 2件残存する（L108-109: docs/specs/backticks-identifier-threshold.md → docs/designs/integrity/backticks-identifier-threshold.md、L184-185: docs/specs/integrity/backticks-identifier-threshold.md → 同一）。new 側パスが本バッチ廃止により存在しない。
- case-close（Epic #4054）の E6-2 廃止キーワード全文検索で検出した。対照登録は retired 履歴領域であり、OU-003 の委譲対象（現行層5ファイル＋索引2件）の外側。本バッチの完了条件には含まれない。現行層の旧参照残存は 0件を確認済み。
- 対照登録の new 側更新は retired-artifact-registry の運用であり、#4058 と同様に検出語彙・対照登録の追加は checker 定数同期条件を伴う領域である。

## 具体的な修正対象

- obsolete-path-map.yaml の backticks 2件の new 側を、現行の統合先（docs/designs/responsibilities/document-type-responsibilities.md の識別子と散文普通名詞の区別節）へ更新する。または retired 様式に従い new 側不在の表現へ整理する。対照登録の現行様式と checker 同期条件を確認のうえ別作業単位で処置する。

## 関連

- Epic #4054 完了記録コメント検証差分節（E6-2 観察の記録）
- Issue #4056・PR #4064（廃止本体）・Issue #4058・PR #4063（対照登録不要判断の前例）
- .opencode/skills/repo-agentdev-integrity/data/obsolete-path-map.yaml L108-109・L184-185
