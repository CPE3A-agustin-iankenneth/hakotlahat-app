import re

with open("app/res/requests/page.tsx", "r") as f:
    content = f.read()

# Add imports
if "import { Card }" not in content:
    content = content.replace('import { Button } from "@/components/ui/button";', 'import { Button } from "@/components/ui/button";\nimport { Card } from "@/components/ui/card";\nimport { Badge } from "@/components/ui/badge";')

# Replace div cards
content = content.replace(
    '<div className="flex flex-row items-center bg-card p-5 rounded-3xl border border-border shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 group">',
    '<Card className="flex flex-row items-center p-5 rounded-3xl hover:shadow-md hover:scale-[1.02] transition-all duration-300 group">'
)
# Close div cards
content = re.sub(
    r'(<button className="p-2 text-destructive[\s\S]*?</button>\s*)</div>\s*</div>',
    r'\1</div>\n        </Card>',
    content
)

# Replace Badges
content = re.sub(
    r'<span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">\s*Pending\s*</span>',
    r'<Badge variant="secondary" className="uppercase tracking-wider">Pending</Badge>',
    content
)

# Replace View Details Buttons
content = re.sub(
    r'<button className="border-2 border-border text-primary font-bold py-2 px-6 rounded-full hover:bg-primary/10 hover:border-primary/20 transition-colors">\s*View Details\s*</button>',
    r'<Button variant="outline" className="rounded-full border-2 font-bold px-6 text-primary hover:bg-primary/10">View Details</Button>',
    content
)

# Replace Trash Buttons
content = re.sub(
    r'<button className="p-2 text-destructive hover:text-destructive/80 transition-colors">\s*<Trash2 size={20} />\s*</button>',
    r'<Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"><Trash2 size={20} /></Button>',
    content
)

with open("app/res/requests/page.tsx", "w") as f:
    f.write(content)
