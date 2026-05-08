# Example Workflow

**シナリオ**: SupabaseのRLSポリシーでエラーが発生し、解決した

### Step 1: 学びの検知

- RLSポリシーの設定ミスが原因
- `USING (auth.uid() = user_id)` の書き方を学んだ
- 将来同じミスを防ぐために記録すべき

### Step 2: 学びの抽出

```
## Supabase RLSポリシーのauth.uid()比較

**状況**: SupabaseでRLSポリシーを設定した際、SELECTで権限エラー
**原因**: `auth.uid()` と `user_id` の比較で、カラム名を間違えていた
**解決策**: テーブルのカラム名と一致しているか確認。`auth.uid()` は UUID を返す
**教訓**: RLSポリシー作成時は、カラム名と型を確認する
**タグ**: #supabase #rls #バグ修正
```

### Step 3: ユーザー確認

> 今回のRLS対応で学びがありました。追加しますか？
>
> ## Supabase RLSポリシーのauth.uid()比較
> ...
>
> - はい / いいえ

### Step 4: 学びの追加

ユーザーが「はい」と回答：

```
/tips-add "Supabase RLSポリシーのauth.uid()比較" --tags "supabase,rls,バグ修正"
```

これで `inbox.md` に学びが追加されます。

---

## Full Pipeline Example (Complete 3-Layer Flow)

### Layer 1: Capture Phase (学びの記録)

```
/tips-add "Supabase RLSポリシーのauth.uid()比較" --tags "supabase,rls,バグ修正"
/tips-add "Next.jsのISRでキャッシュ更新" --tags "nextjs,キャッシュ"
/tips-add "TypeScriptの型推論" --tags "typescript,型システム"
```

→ `inbox.md` にエントリが追加される

### Layer 2: Analysis Phase (セマンティック分析と整理)

```
/tips-refactor
```

→ 実行内容:
  - inbox.md のエントリをセマンティック分析でクラスタリング
  - evaluation-report.md にクラスタごとの重みとエントリを記録
  - ユーザー承認後、inbox.md の全エントリを archive.md に追記（append-only）
  - inbox.md をクリア

→ 出力例 (evaluation-report.md):
  - **クラスタ1**: テーマ「Supabase/RLS」 (3エントリ) - 重み: 高
  - **クラスタ2**: テーマ「Next.js/キャッシュ」 (2エントリ) - 重み: 中
  - **クラスタ3**: テーマ「TypeScript/型システム」 (4エントリ) - 重み: 高

### Layer 3: Elevation Phase (昇華判定とスタブ生成)

```
/tips-elevate
```

→ 実行内容:
  - evaluation-report.md のクラスタを分析
  - 各クラスタをスキル化/コマンド化/ワークフロー組み込み/保留の4段階で判定
  - ユーザー承認後、staging領域にスタブファイルを生成

→ 出力例 (elevation-staging/supabase-rls-skill-stub.md):
  ```markdown
  # Supabase RLS スキルスタブ

  ## 動機
  以下の学びから昇華:
  - 2026-05-08: Supabase RLSポリシーのauth.uid()比較
  - 2026-05-07: RLSポリシーのデバッグ方法
  - 2026-05-06: RLSポリシーのパフォーマンス影響

  ## Description（草案）
  SupabaseのRLSポリシー設計・実装・デバッグに関するナレッジ

  ## TODO
  - [ ] 完全なSKILL.mdの作成
  - [ ] トリガー条件の定義
  - [ ] ステップの具体化
  - [ ] Guardrailsの定義
  ```
