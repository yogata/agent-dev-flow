import os
import sys
import shutil
from pathlib import Path

def archive_plan(plan_name):
    base_dir = Path(".sisyphus")
    if not base_dir.exists():
        print(f"Error: .sisyphus directory not found in {os.getcwd()}")
        return

    archive_base = base_dir / "archives" / plan_name
    
    target_dirs = ["plans", "drafts", "evidence", "execution", "notepads", "tasks", "reports"]
    
    moved_files = []

    print(f"Archiving plan '{plan_name}'...")

    for category in target_dirs:
        source_dir = base_dir / category
        if not source_dir.exists():
            continue

        # notepadsは特別処理: サブディレクトリの内容を直接移動
        if category == "notepads":
            plan_notepad_dir = source_dir / plan_name
            if not plan_notepad_dir.exists() or not plan_notepad_dir.is_dir():
                continue

            dest_dir = archive_base / category
            if not dest_dir.exists():
                dest_dir.mkdir(parents=True, exist_ok=True)

            for item in plan_notepad_dir.iterdir():
                if item.name.startswith('.'):
                    continue
                try:
                    dest_path = dest_dir / item.name
                    if dest_path.exists():
                        if dest_path.is_dir():
                            shutil.rmtree(dest_path)
                        else:
                            os.remove(dest_path)

                    shutil.move(str(item), str(dest_path))
                    moved_files.append(f"{category}/{item.name}")
                except Exception as e:
                    print(f"Error moving {item}: {e}")
        else:
            # 他のカテゴリの標準処理
            candidates = list(source_dir.glob(f"{plan_name}")) + \
                         list(source_dir.glob(f"{plan_name}.*")) + \
                         list(source_dir.glob(f"{plan_name}-*"))

            candidates = list(set(candidates))

            if not candidates:
                continue

            dest_dir = archive_base / category
            if not dest_dir.exists():
                dest_dir.mkdir(parents=True, exist_ok=True)

            for item in candidates:
                try:
                    dest_path = dest_dir / item.name
                    if dest_path.exists():
                        if dest_path.is_dir():
                            shutil.rmtree(dest_path)
                        else:
                            os.remove(dest_path)

                    shutil.move(str(item), str(dest_path))
                    moved_files.append(f"{category}/{item.name}")
                except Exception as e:
                    print(f"Error moving {item}: {e}")

    if moved_files:
        print(f"Successfully archived to .sisyphus/archives/{plan_name}:")
        for f in moved_files:
            print(f"  - {f}")
    else:
        print(f"No files found for plan '{plan_name}' in .sisyphus/")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python archive_plan.py <plan_name>")
        sys.exit(1)
    
    archive_plan(sys.argv[1])
