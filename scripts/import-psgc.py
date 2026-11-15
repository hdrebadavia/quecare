"""Build local address reference data from PSA's PSGC publication (Python stdlib only).
Usage: python3 scripts/import-psgc.py /path/to/PSGC-3Q-2026-Publication-Datafile.xlsx
Review release dates, totals and provenance before importing another release.
"""
import hashlib, json, re, sys, zipfile
from pathlib import Path
import xml.etree.ElementTree as E
source = Path(sys.argv[1])
ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(source) as z:
    strings = [''.join(e.itertext()) for e in E.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', ns)]
    workbook = E.fromstring(z.read('xl/workbook.xml'))
    sheet = next(s for s in workbook.find('m:sheets', ns) if s.attrib['name'] == 'PSGC')
    rel = sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
    target = next(r.attrib['Target'] for r in E.fromstring(z.read('xl/_rels/workbook.xml.rels')) if r.attrib['Id'] == rel)
    rows = []
    for row in E.fromstring(z.read('xl/' + target)).findall('m:sheetData/m:row', ns):
        cells = {}
        for c in row:
            v = c.findtext('m:v', default='', namespaces=ns)
            cells[re.sub(r'\d', '', c.attrib['r'])] = strings[int(v)] if c.attrib.get('t') == 's' else v
        if cells.get('E') in ('Reg', 'Prov', 'City', 'Mun', 'Bgy'):
            rows.append((cells['B'].zfill(10), cells['C'].strip(), cells['E']))
provinces = {c for c, n, l in rows if l == 'Prov'}
places = []
for code, name, level in rows:
    kind = {'Reg':'region', 'Prov':'province', 'City':'city', 'Mun':'city', 'Bgy':'barangay'}[level]
    parent = '' if kind == 'region' else code[:2] + '00000000'
    if kind == 'city':
        candidate = code[:5] + '00000'
        if candidate in provinces: parent = candidate
    if kind == 'barangay':
        # Manila's barangays are encoded under sub-municipal districts.
        parent = '1380600000' if code.startswith('13806') else code[:7] + '000'
    places.append({'code':code, 'name':name, 'kind':kind, 'parent':parent})
by_code = {p['code']:p for p in places}
assert len(by_code) == len(places)
assert all(not p['parent'] or p['parent'] in by_code for p in places)
counts = {k:sum(p['kind']==k for p in places) for k in ('region','province','city','barangay')}
assert counts == {'region':18,'province':82,'city':1642,'barangay':42010}, counts
out = {'release':'2026-Q3','asOf':'2026-09-30','publishedAt':'2026-10-12',
       'source':'https://psa.gov.ph/system/files/scd/PSGC-3Q-2026-Publication-Datafile.xlsx',
       'retrievedFrom':'https://github.com/rbillyjames0221/psgc-api/blob/main/seed/PSGC-3Q-2026-Publication-Datafile.xlsx',
       'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
       'attribution':'Philippine Statistics Authority (PSA), Philippine Standard Geographic Code. Names and codes extracted; other workbook columns omitted.',
       'counts':counts, 'places':places}
Path('server/data/psgc.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')
print(counts)
