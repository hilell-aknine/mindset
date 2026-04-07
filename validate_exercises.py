import json
import os
import sys

books_dir = r"C:\Users\saraa\OneDrive\שולחן העבודה\mindset\src\data\books"
book_files = [
    "atomic-habits.json",
    "happy-chemicals.json",
    "indistractable.json",
    "mindset-book.json",
    "next-five-moves.json",
    "strengths-finder.json"
]

errors = []
warnings = []
stats = {}

def err(book, ch_idx, les_idx, ex_idx, ex_type, msg):
    errors.append({
        "book": book,
        "chapter": ch_idx,
        "lesson": les_idx,
        "exercise": ex_idx,
        "type": ex_type,
        "msg": msg
    })

def warn(book, ch_idx, les_idx, ex_idx, ex_type, msg):
    warnings.append({
        "book": book,
        "chapter": ch_idx,
        "lesson": les_idx,
        "exercise": ex_idx,
        "type": ex_type,
        "msg": msg
    })

for book_file in book_files:
    fpath = os.path.join(books_dir, book_file)
    slug = book_file.replace(".json", "")

    with open(fpath, "r", encoding="utf-8") as f:
        book = json.load(f)

    chapters = book.get("chapters", [])
    total_exercises = 0

    # Check chapter 0 isFree
    if chapters:
        ch0 = chapters[0]
        if not ch0.get("isFree", False):
            err(slug, 0, -1, -1, "chapter", "Chapter 0 does NOT have isFree: true")

    for ch_idx, chapter in enumerate(chapters):
        lessons = chapter.get("lessons", [])
        for les_idx, lesson in enumerate(lessons):
            exercises = lesson.get("exercises", [])
            for ex_idx, ex in enumerate(exercises):
                total_exercises += 1
                ex_type = ex.get("type", "UNKNOWN")

                # Common checks
                ctx = ex.get("context")
                if ctx is None or (isinstance(ctx, str) and ctx.strip() == ""):
                    err(slug, ch_idx, les_idx, ex_idx, ex_type, "Missing or empty 'context' field")

                q = ex.get("question")
                if q is None:
                    err(slug, ch_idx, les_idx, ex_idx, ex_type, "Missing 'question' field")
                elif isinstance(q, str) and q.strip() == "":
                    err(slug, ch_idx, les_idx, ex_idx, ex_type, "Empty 'question' field")

                expl = ex.get("explanation")
                if expl is None:
                    err(slug, ch_idx, les_idx, ex_idx, ex_type, "Missing 'explanation' field")
                elif isinstance(expl, str) and expl.strip() == "":
                    err(slug, ch_idx, les_idx, ex_idx, ex_type, "Empty 'explanation' field")

                # Type-specific checks
                if ex_type == "multiple-choice":
                    options = ex.get("options", [])
                    correct = ex.get("correct")
                    wrong_explanations = ex.get("wrongExplanations", [])

                    if correct is None:
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "Missing 'correct' field")
                    elif not isinstance(correct, int):
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "correct is not an integer: {}".format(correct))
                    elif correct < 0 or correct >= len(options):
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "correct index {} out of bounds (options length={})".format(correct, len(options)))

                    if len(options) == 0:
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "No options provided")

                    # Check wrongExplanations
                    if len(wrong_explanations) != 4:
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "wrongExplanations should have exactly 4 items, has {}".format(len(wrong_explanations)))
                    else:
                        if isinstance(correct, int) and 0 <= correct < 4:
                            if wrong_explanations[correct] is not None:
                                err(slug, ch_idx, les_idx, ex_idx, ex_type, "wrongExplanations[{}] should be null (correct index) but is: {!r}".format(correct, wrong_explanations[correct]))
                            for i, we in enumerate(wrong_explanations):
                                if i != correct and we is None:
                                    err(slug, ch_idx, les_idx, ex_idx, ex_type, "wrongExplanations[{}] is null but index {} is not the correct answer (correct={})".format(i, i, correct))

                elif ex_type == "fill-blank":
                    options = ex.get("options", [])
                    correct = ex.get("correct")
                    template = ex.get("template", "")

                    if correct is None:
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "Missing 'correct' field")
                    elif not isinstance(correct, int):
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "correct is not an integer: {}".format(correct))
                    elif correct < 0 or correct >= len(options):
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "correct index {} out of bounds (options length={})".format(correct, len(options)))

                    if "_" not in template:
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "template has no blank (_): {!r}".format(template))

                    if len(options) == 0:
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "No options provided")

                elif ex_type == "order":
                    items = ex.get("items", [])
                    correct_order = ex.get("correctOrder", [])

                    if len(correct_order) != len(items):
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "correctOrder length {} != items length {}".format(len(correct_order), len(items)))

                    if items:
                        valid_indices = set(range(len(items)))
                        order_set = set(correct_order)
                        if order_set != valid_indices:
                            err(slug, ch_idx, les_idx, ex_idx, ex_type, "correctOrder indices invalid: got {}, expected {}".format(sorted(correct_order), sorted(valid_indices)))

                    if len(items) == 0:
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "No items provided")

                elif ex_type == "compare":
                    correct = ex.get("correct")
                    option_a = ex.get("optionA")
                    option_b = ex.get("optionB")

                    if correct not in ("A", "B"):
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "correct must be 'A' or 'B', got: {!r}".format(correct))

                    if option_a is None:
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "Missing 'optionA' field")
                    if option_b is None:
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "Missing 'optionB' field")

                elif ex_type == "match":
                    pairs = ex.get("pairs", [])
                    if len(pairs) == 0:
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "No pairs provided")
                    for p_idx, pair in enumerate(pairs):
                        if "left" not in pair:
                            err(slug, ch_idx, les_idx, ex_idx, ex_type, "Pair {} missing 'left' key".format(p_idx))
                        if "right" not in pair:
                            err(slug, ch_idx, les_idx, ex_idx, ex_type, "Pair {} missing 'right' key".format(p_idx))

                elif ex_type == "improve":
                    options = ex.get("options", [])
                    correct = ex.get("correct")

                    if correct is None:
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "Missing 'correct' field")
                    elif not isinstance(correct, int):
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "correct is not an integer: {}".format(correct))
                    elif correct < 0 or correct >= len(options):
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "correct index {} out of bounds (options length={})".format(correct, len(options)))

                    if not ex.get("text") and not ex.get("original"):
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "Missing 'text' or 'original' field")

                    if len(options) == 0:
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "No options provided")

                elif ex_type == "identify":
                    text = ex.get("text", "")
                    correct_start = ex.get("correctStart")
                    correct_end = ex.get("correctEnd")
                    correct_text = ex.get("correctText", "")

                    if correct_start is None:
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "Missing correctStart")
                    if correct_end is None:
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "Missing correctEnd")

                    if correct_start is not None and correct_end is not None and text:
                        if not isinstance(correct_start, int) or not isinstance(correct_end, int):
                            err(slug, ch_idx, les_idx, ex_idx, ex_type, "correctStart/correctEnd must be integers")
                        else:
                            if correct_start < 0 or correct_start > len(text):
                                err(slug, ch_idx, les_idx, ex_idx, ex_type, "correctStart={} out of bounds (text length={})".format(correct_start, len(text)))
                            if correct_end < 0 or correct_end > len(text):
                                err(slug, ch_idx, les_idx, ex_idx, ex_type, "correctEnd={} out of bounds (text length={})".format(correct_end, len(text)))
                            if 0 <= correct_start <= correct_end <= len(text):
                                extracted = text[correct_start:correct_end]
                                if extracted != correct_text:
                                    err(slug, ch_idx, les_idx, ex_idx, ex_type,
                                        "correctText mismatch: text[{}:{}] = {!r}, but correctText = {!r}".format(correct_start, correct_end, extracted, correct_text))

                    if not text:
                        err(slug, ch_idx, les_idx, ex_idx, ex_type, "Missing 'text' field")

                elif ex_type == "UNKNOWN":
                    err(slug, ch_idx, les_idx, ex_idx, ex_type, "Exercise has no 'type' field")
                else:
                    warn(slug, ch_idx, les_idx, ex_idx, ex_type, "Unknown exercise type: {!r}".format(ex_type))

    stats[slug] = total_exercises

# Print report
print("=" * 80)
print("QA VALIDATION REPORT -- MINDSET APP BOOKS")
print("=" * 80)
print()
print("EXERCISE COUNTS PER BOOK:")
print("-" * 40)
total = 0
for slug, count in stats.items():
    print("  {}: {} exercises".format(slug, count))
    total += count
print("  TOTAL: {} exercises".format(total))
print()

print("=" * 80)
print("ERRORS FOUND: {}".format(len(errors)))
print("=" * 80)
if errors:
    current_book = None
    for e in errors:
        if e["book"] != current_book:
            current_book = e["book"]
            print("\n--- BOOK: {} ---".format(current_book))
        print("  [ERROR] ch={} les={} ex={} type={}".format(e["chapter"], e["lesson"], e["exercise"], e["type"]))
        print("          {}".format(e["msg"]))
else:
    print("  No errors found!")
print()

print("=" * 80)
print("WARNINGS FOUND: {}".format(len(warnings)))
print("=" * 80)
if warnings:
    for w in warnings:
        print("  [WARN] {} ch={} les={} ex={} type={}".format(w["book"], w["chapter"], w["lesson"], w["exercise"], w["type"]))
        print("         {}".format(w["msg"]))
else:
    print("  No warnings found!")
