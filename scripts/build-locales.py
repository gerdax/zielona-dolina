import json,re
from pathlib import Path
root=Path(__file__).resolve().parent.parent
summaries=[]
rows=[];seen=set()
for path in sorted((root/'locales').glob('*.tsv')):
 for line in path.read_text().splitlines():
  if not line or line.startswith('#'):continue
  row=line.split('|')
  if len(row)!=8 or any(not c for c in row):raise ValueError(f'Expected 8 nonempty columns: {line[:100]}')
  if path.name=='rules.tsv':
   summaries.append(row);continue
  key=row[0].casefold()
  if key in seen:raise ValueError(f'Duplicate translation: {row[0]}')
  seen.add(key);rows.append(row)
(root/'dist/locale-data.js').write_text('const LOCALE_ROWS='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\nconst LOCALE_SUMMARIES='+json.dumps(summaries,ensure_ascii=False,separators=(',',':'))+';\n')
print(f'{len(rows)} translation entries, 8 languages')
