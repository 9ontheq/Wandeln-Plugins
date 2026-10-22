import json, sys

text = sys.argv[1] if len(sys.argv) > 1 else ""
items = []
if text:
    for label, value in [("UPPER", text.upper()), ("lower", text.lower()), ("Title", text.title())]:
        items.append({"title": value, "subtitle": label, "action": {"type": "copy", "value": value}})
print(json.dumps({"items": items}, ensure_ascii=False))
