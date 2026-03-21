"""
Generate chapter audio summaries for MindSet using NotebookLM.

Usage:
    python scripts/generate-audio-summaries.py                    # All books
    python scripts/generate-audio-summaries.py --book atomic-habits  # Single book
    python scripts/generate-audio-summaries.py --book atomic-habits --chapter 0  # Single chapter

Requirements:
    pip install notebooklm-py
    notebooklm login  (run once to authenticate)
"""

import asyncio
import json
import sys
import os
import argparse
from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
BOOKS_DIR = PROJECT_ROOT / "src" / "data" / "books"
AUDIO_DIR = PROJECT_ROOT / "public" / "audio"


def build_chapter_summary_text(book_data, chapter_data):
    """Build a rich text summary of a chapter from its exercises/context."""
    book_title = book_data["title"]
    chapter_title = chapter_data["title"]
    chapter_desc = chapter_data.get("description", "")

    lines = [
        f"# {book_title}",
        f"## {chapter_title}",
        "",
        chapter_desc,
        "",
        "### עיקרי הפרק:",
        "",
    ]

    # Extract unique context texts and explanations from exercises
    seen = set()
    for lesson in chapter_data.get("lessons", []):
        lines.append(f"#### {lesson['title']}")
        lines.append("")
        for ex in lesson.get("exercises", []):
            ctx = ex.get("context", "").strip()
            if ctx and ctx not in seen:
                seen.add(ctx)
                lines.append(f"- {ctx}")
            explanation = ex.get("explanation", "").strip()
            if explanation and explanation not in seen:
                seen.add(explanation)
                lines.append(f"- {explanation}")
        lines.append("")

    return "\n".join(lines)


async def generate_chapter_audio(book_slug, book_data, chapter_index, chapter_data):
    """Generate audio summary for a single chapter using NotebookLM."""
    from notebooklm import NotebookLMClient
    from notebooklm.rpc.types import AudioFormat, AudioLength

    output_dir = AUDIO_DIR / book_slug
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"chapter-{chapter_index}.mp3"

    if output_file.exists():
        print(f"  [SKIP] {output_file.name} already exists")
        return True

    # Build chapter content
    content = build_chapter_summary_text(book_data, chapter_data)
    chapter_title = chapter_data["title"]
    book_title = book_data["title"]

    print(f"  [GEN] {book_title} > {chapter_title}")

    try:
        async with await NotebookLMClient.from_storage() as client:
            # Create temporary notebook
            nb_title = f"MindSet: {book_title} - {chapter_title}"
            nb = await client.notebooks.create(nb_title)
            print(f"    Notebook created: {nb.id}")

            # Add chapter content as text source
            src = await client.sources.add_text(nb.id, content, title=chapter_title)
            await client.sources.wait_for_sources(nb.id, [src.id], timeout=120)
            print(f"    Source processed")

            # Generate brief Hebrew audio
            instructions = (
                f"צור סיכום קצר וממוקד של הפרק '{chapter_title}' מהספר '{book_title}'. "
                "דבר בגוף שני (אתה/את), בטון חם ומעודד. "
                "התחל עם משפט פתיחה קצר על הפרק, עבור על הנקודות המרכזיות, "
                "וסיים עם טיפ מעשי אחד ליישום. "
                "שמור על שפה פשוטה ונגישה."
            )
            status = await client.artifacts.generate_audio(
                nb.id,
                language="he",
                instructions=instructions,
                audio_format=AudioFormat.BRIEF,
                audio_length=AudioLength.SHORT,
            )
            print(f"    Audio generation started (task: {status.task_id})")

            # Wait for completion (up to 15 minutes)
            await client.artifacts.wait_for_completion(nb.id, status.task_id, timeout=900)
            print(f"    Audio ready, downloading...")

            # Download
            await client.artifacts.download_audio(nb.id, str(output_file))
            print(f"    [OK] Saved: {output_file}")

            # Clean up notebook
            await client.notebooks.delete(nb.id)
            return True

    except Exception as e:
        print(f"    [ERROR] {e}")
        return False


async def main():
    parser = argparse.ArgumentParser(description="Generate MindSet chapter audio summaries")
    parser.add_argument("--book", help="Single book slug (e.g., atomic-habits)")
    parser.add_argument("--chapter", type=int, help="Single chapter index (requires --book)")
    args = parser.parse_args()

    # Find book JSONs
    book_files = sorted(BOOKS_DIR.glob("*.json"))
    if not book_files:
        print("No book files found!")
        sys.exit(1)

    results = {"success": 0, "skipped": 0, "failed": 0}

    for book_file in book_files:
        book_slug = book_file.stem
        if args.book and book_slug != args.book:
            continue

        with open(book_file, "r", encoding="utf-8") as f:
            book_data = json.load(f)

        print(f"\n{'='*50}")
        print(f"Book: {book_data['title']} ({book_slug})")
        print(f"{'='*50}")

        for chapter in book_data.get("chapters", []):
            ci = chapter["orderIndex"]
            if args.chapter is not None and ci != args.chapter:
                continue

            output_file = AUDIO_DIR / book_slug / f"chapter-{ci}.mp3"
            if output_file.exists():
                print(f"  [SKIP] Chapter {ci}: {chapter['title']} (already exists)")
                results["skipped"] += 1
                continue

            ok = await generate_chapter_audio(book_slug, book_data, ci, chapter)
            if ok:
                results["success"] += 1
            else:
                results["failed"] += 1

            # Brief pause between generations to avoid rate limits
            if not (args.chapter is not None):
                await asyncio.sleep(5)

    print(f"\n{'='*50}")
    print(f"Done! Success: {results['success']} | Skipped: {results['skipped']} | Failed: {results['failed']}")


if __name__ == "__main__":
    asyncio.run(main())
