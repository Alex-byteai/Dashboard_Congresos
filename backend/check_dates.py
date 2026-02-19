import json
d = json.load(open('public/congresses.json', encoding='utf-8'))
print(f"{'Evento':<30} | {'Fecha inicio':<12} | {'Fecha fin':<12} | {'Deadline'}")
print('-' * 80)
for c in d['congresses']:
    print(f"{c['evento']:<30} | {str(c['fechaInicio']):<12} | {str(c['fechaFin']):<12} | {c['deadline']}")
