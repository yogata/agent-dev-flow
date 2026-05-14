---
description: inbox.mdとarchive.mdをセマンティック分析し、evaluation-report.mdを出力後inbox→archive移動を行う
agent: sisyphus
load_skills:
  - tips-capture
---

# 学びのセマンティック分析とアーカイブ

`docs/tips/inbox.md` の学びエントリと `docs/tips/archive.md` の過去エントリをセマンティック分析し、テーマ別クラスタを生成して `evaluation-report.md` に出力。ユーザー承認後に inbox → archive へ原子的に移動する。

## Steps

1. **inbox.mdの内容確認**:
   - `docs/tips/inbox.md` を読み込む
   - ファイルが存在しない → エラー終了。「先に `/tips-add` で学びを追加してください」
   - `---` 区切りのエントリをカウント（ヘッダー除く）
   - 0件 → 「分析対象の学びがありません」と報告して終了

2. **archive.mdの読込**:
   - `docs/tips/archive.md` が存在すれば読み込む
   - 存在しない場合は空として扱う

3. **全エントリの読込**:
   - inbox.md + archive.md から全エントリをパース
   - エントリフォーマット:
     ```
     ## YYYY-MM-DD: タイトル

     - **事象**: ...
     - **原因**: ...
     - **対策**: ...
     - **関連**: ...
     - **タグ**: #xxx #yyy

     ---
     ```

4. **セマンティッククラスタリング**:
   - LLMが全エントリの内容（事象・原因・対策）を分析し、テーマ/トピックでグループ化
   - タグは参考情報として扱い、分類の主軸にはしない
   - 最小クラスタサイズ: 2エントリ以上。単独エントリは「未分類」クラスタへ
   - クラスタ粒度の目安: 「Windows環境エスケープ問題」「Supabase RLS落とし穴」レベルの具体性
   - クラスタ数はLLMがエントリ間の意味的類似性に基づき決定

5. **重み付け計算**:
   - 重み = inbox内出現数（同一クラスタのinboxエントリ数） × archive内類似度（archive.md内の類似テーマの過去エントリ数）
   - 高い重み = 再発性が高いテーマ = 昇格候補

6. **evaluation-report.mdの生成**（上書き、追記しない）:
   - パス: `docs/tips/evaluation-report.md`
   - スキーマ:
     ```markdown
     # 分析レポート

     ## メタデータ
     - **実行日時**: YYYY-MM-DD HH:mm
     - **対象エントリ数**: N件（inbox: N件, archive参照: N件）
     - **クラスタ数**: N

     ## クラスタ一覧

     ### クラスタ1: {テーマ名}
     - **テーマ概要**: そのクラスタが表すテーマの説明
     - **重み**: X.X（inbox内出現数 × archive内類似度）
     - **エントリ数**: N件
     - **代表エントリ**: 最も内容が豊富なエントリの引用
     - **関連エントリ一覧**:
       - YYYY-MM-DD: タイトル
       - YYYY-MM-DD: タイトル

     ### クラスタ2: {テーマ名}
     ...

     ## 分析サマリ
     - 全体的な傾向と観察所見
     - 高頻出テーマの特徴
     ```

7. **ユーザーに分析結果提示**:
   - evaluation-report.md の内容を表示
   - アーカイブ移動の承認を求める
   - ユーザーが承認しない → 「アーカイブをキャンセルしました。evaluation-report.mdは保存済みです」と報告して終了

8. **アーカイブ移動**（原子的操作 — 最重要）:
   - **Step A**: inbox.mdの全エントリを archive.md に追記。各エントリに `**移動日**: YYYY-MM-DD` フィールドを追加
   - **Step B**: archive.md の書込を検証（追記したエントリ数をカウントして照合）
   - **Step C**: Step Bが成功した場合のみ、inbox.mdをヘッダーのみにクリア:
     ```markdown
     # 学び・教訓

     このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
     まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

     ---
     ```
   - Step Bが失敗 → inbox.mdは変更しない。エラー内容を報告

9. **完了報告**:
   - クラスタ数
   - 処理したエントリ数（inbox → archive）
   - evaluation-report.md のパス

10. **tips-elevate提案**:
    - evaluation-report.mdにクラスタが検出された場合:
      「クラスタが検出されました。`/tips-elevate` で昇華判定を行うことを推奨します」

## Error Handling

| エラー | 対処 |
|--------|------|
| inbox.mdが存在しない | エラー終了。「先に `/tips-add` で学びを追加してください」 |
| 学びが0件 | 「分析対象の学びがありません」と報告して終了 |
| ユーザーが承認しない | 「アーカイブをキャンセルしました。evaluation-report.mdは保存済みです」と報告 |
| archive.md書込失敗 | inbox.mdは変更しない。エラー内容を報告 |

## 使用例

```
/tips-refactor
→ inbox.md + archive.md を分析し、evaluation-report.md を生成
→ 分析結果を提示し、アーカイブ移動の承認を求める
→ 承認後、inbox → archive へ原子的に移動
→ 完了後、/tips-elevate を提案
```

## 注意事項

- **evaluation-report.mdは毎回上書き**: 過去のレポートは保持しない
- **archive.mdは追記専用**: 既存エントリの変更・削除は禁止
- **セマンティック分析（LLMによるテーマ判定）**: エントリの自動分類に使用
- **最小エントリ数の閾値なし**: 1件以上のエントリがあれば実行可能
- **昇格判定は別コマンド**: evaluation-report.mdに基づく昇格推奨は `/tips-elevate` の役割
