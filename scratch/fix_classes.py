import os
import re

replacements = {
    r'bg-gray-100': 'bg-background',
    r'bg-gray-50': 'bg-background',
    r'bg-gray-200': 'bg-muted',
    r'bg-gray-300': 'bg-muted/80',
    r'bg-white': 'bg-card',
    r'bg-black': 'bg-background',
    r'bg-gray-900\/50': 'bg-card/50',
    r'bg-gray-900\/95': 'bg-card/95',
    r'bg-gray-900\/80': 'bg-card/80',
    r'bg-gray-900': 'bg-card',
    r'bg-gray-950': 'bg-background',
    r'bg-gray-800\/50': 'bg-muted/50',
    r'bg-gray-800': 'bg-muted',
    r'bg-gray-700': 'bg-muted-foreground/20',
    r'border-gray-800': 'border-border',
    r'border-gray-600': 'border-border',
    r'border-gray-300': 'border-border',
    r'border-gray-200': 'border-border',
    r'border-gray-100': 'border-border',
    r'text-gray-900': 'text-foreground',
    r'text-gray-700': 'text-foreground',
    r'text-gray-600': 'text-muted-foreground',
    r'text-gray-500': 'text-muted-foreground',
    r'text-gray-400': 'text-muted-foreground',
    r'text-gray-300': 'text-muted-foreground',
    r'text-slate-950': 'text-foreground',
    r'text-slate-600': 'text-muted-foreground',
    r'text-slate-500': 'text-muted-foreground',
    r'bg-slate-300': 'bg-muted',
    r'bg-slate-200': 'bg-muted',
    r'bg-slate-50': 'bg-card',
    r'border-slate-200': 'border-border',
    r'text-black': 'text-foreground',
    r'text-white': 'text-foreground',
    r'bg-emerald-600': 'bg-primary',
    r'text-emerald-600': 'text-primary',
    r'bg-emerald-100\/80': 'bg-primary/20',
    r'bg-emerald-100': 'bg-primary/20',
    r'bg-emerald-50': 'bg-primary/10',
    r'text-emerald-800': 'text-primary-foreground',
    r'bg-emerald-900': 'bg-primary',
    r'bg-green-600': 'bg-primary',
    r'hover:bg-green-700': 'hover:bg-primary/90',
    r'hover:bg-green-600': 'hover:bg-primary/90',
    r'text-green-700': 'text-primary',
    r'text-green-600': 'text-primary',
    r'text-green-500': 'text-primary',
    r'text-green-400': 'text-primary',
    r'bg-green-500\/20': 'bg-primary/20',
    r'border-green-500': 'border-primary',
    r'ring-green-500': 'ring-primary',
    r'bg-green-500': 'bg-primary',
    r'bg-green-100': 'bg-primary/20',
    r'hover:bg-green-50': 'hover:bg-primary/10',
    r'hover:border-green-100': 'hover:border-primary/20',
    r'bg-red-500\/20': 'bg-destructive/20',
    r'text-red-400': 'text-destructive',
    r'bg-red-500': 'bg-destructive',
    r'text-red-900': 'text-destructive',
    r'bg-red-50': 'bg-destructive/10',
    r'text-red-700': 'text-destructive',
    r'bg-red-100': 'bg-destructive/20',
    r'hover:bg-red-200': 'hover:bg-destructive/30',
    r'bg-rose-500': 'bg-destructive',
    r'text-teal-500': 'text-primary',
    r'bg-teal-500': 'bg-primary',
    r'hover:bg-teal-600': 'hover:bg-primary/90',
    r'border-teal-500\/30': 'border-primary/30',
    r'text-teal-400': 'text-primary',
    r'hover:text-teal-300': 'hover:text-primary/80',
    r'text-orange-400': 'text-secondary',
    r'bg-orange-500\/20': 'bg-secondary/20',
    r'border-orange-500\/30': 'border-secondary/30',
    r'bg-orange-500': 'bg-secondary',
    r'text-blue-400': 'text-accent',
    r'bg-blue-500': 'bg-accent',
    r'text-purple-400': 'text-secondary-foreground',
    r'bg-amber-600\/20': 'bg-accent/20',
    r'border-amber-600\/30': 'border-accent/30',
    r'bg-amber-600': 'bg-accent',
}

files_to_process = [
    'app/res/reports/page.tsx',
    'app/res/settings/page.tsx',
    'app/res/requests/page.tsx',
    'app/drv/points/page.tsx',
    'app/drv/page.tsx'
]

for filepath in files_to_process:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath}, not found")
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Specific edge case for points/page.tsx stroke color
    if 'page.tsx' in filepath:
        content = content.replace('stroke="#14b8a6"', 'stroke="currentColor" className="text-primary"')
        content = content.replace('from-orange-400 to-orange-600', 'bg-secondary')

    for old, new in replacements.items():
        # Using word boundaries to avoid replacing parts of strings
        # Because class names have hyphens, we use a negative lookbehind/lookahead for word chars and hyphens
        # actually, simply using re.sub with `(?<![\w-])` and `(?![\w-])`
        pattern = r'(?<![\w-])' + old + r'(?![\w-])'
        content = re.sub(pattern, new, content)
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Processed {filepath}")
