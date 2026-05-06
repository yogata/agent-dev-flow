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
