# baseline 存在 fail の観測拡充（checkExtensions integration 1件 + split3 環境依存系 11件）の別案件管理要否判断

## 観測事実

- PR #4070（Issue #4068・case-run TS-005）で integrity suite 3分割の baseline 実測を実施した際、前置 gate の既知 pre-existing 3件（relied-diff T6・cli-e2e -BootstrapMode archive・-SeedMode alias・RU-0280 系）に含まれない baseline 存在 fail を観測した。base HEAD bacd23d32（本変更未適用）で同一 fail を再現しており、本変更非起因の baseline 存在 fail である。
- split1-integrity: checkExtensions (integration against real repo) > returns ok=true with migrated stats after the atomic cutover の1件。実リポジトリの extensions 構造状態依存の fail。
- split3-plugins-scripts: scripts behavior 系（git clone checkout・junction 適用・-LocalMode 等の検証系テスト）と agentdev-textlint-guard distribution 系（vendor 欠落 fail-closed 通知）の環境依存系 fail 11件。PR 記録・case-close 再実行2回とも同一11件が安定再現（1回目の追加2件は suite 相互作用由来の非決定的観測変動で単独/フル再実行で非再現）。
- merge 後 main HEAD 0cac120d4 での再実行でも同一 fail 集合が維持され、既存債務として継続していることが機械確認されている。
- 関連する case-close 側の観測: check_extensions（IR-056）が extensions yaml 2件（agentdev-inspect-skills・agentdev-skill-authoring）が参照する docs/designs/integrity/backticks-identifier-threshold.md 不存在の strict failure 2件を継続観測（baseline HEAD で同一状態・対応記録コメント 6890914369 検証差分に記録）。

## 具体的な修正対象

- 上記 baseline 存在 fail のうち、環境調整（vendor 生成・junction 適用・実行形態整備）で消える fail と真の欠陥の区分けを行い、別案件管理対象への追加の要否を判断する。
- checkExtensions integration 1件は「実リポジトリの extensions 構造状態依存」であり、test 実行環境の整備手順（install.ps1 -Mode apply 相当の前置）で解消するか、テスト側の環境前提の明示で環境依存分類するかの判断を含む。
- scripts behavior 系 11件は install.ps1 検証系・git clone 系の環境依存系であり、CI/検証環境での再現条件の整理と、真の欠陥の場合の修正対象特定を含む。
- check_extensions strict failure 2件（backticks-identifier-threshold.md 不存在）の実修復（Design 文書の作成または参照削除）との統合判断を含む。

## 関連

- Epic #4054・Issue #4068・PR #4070 本文 Findings（TS-005 split1・split3 行）
- 対応記録コメント 6890914369（Issue #4068・検証差分セクションの check_extensions 行）
- RU-0280（既知 pre-existing 3件の別案件整理・本項目との区分け対象）
