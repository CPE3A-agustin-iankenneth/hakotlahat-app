import re

with open("app/drv/schedule/page.tsx", "r") as f:
    content = f.read()

# Add imports
if "import { Card" not in content:
    content = content.replace('import { redirect } from "next/navigation";', 'import { redirect } from "next/navigation";\nimport { Card } from "@/components/ui/card";\nimport { Badge } from "@/components/ui/badge";\nimport { Button } from "@/components/ui/button";')

# Replace <article> with <Card>
content = content.replace('<article', '<Card').replace('</article>', '</Card>')

# Replace Badges
content = content.replace(
    '<span\n                        key={badge}\n                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeStyles[badge]}`}\n                      >\n                        {badge}\n                      </span>',
    '<Badge\n                        key={badge}\n                        className={`text-[10px] uppercase tracking-wide ${badgeStyles[badge]}`}\n                      >\n                        {badge}\n                      </Badge>'
)

# Replace <button> with <Button>
content = content.replace(
    '<button\n                      type="button"\n                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-4 text-xl font-black text-primary-foreground transition hover:brightness-110"\n                    >',
    '<Button\n                      className="shrink-0 rounded-xl px-6 py-8 text-xl font-black transition hover:brightness-110"\n                    >'
)
content = content.replace(
    '<button\n            type="button"\n            className="fixed bottom-28 right-6 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:brightness-110 md:bottom-6"\n            aria-label="Open map actions"\n          >',
    '<Button\n            size="icon"\n            className="fixed bottom-28 right-6 z-30 h-14 w-14 rounded-full shadow-xl transition hover:brightness-110 md:bottom-6"\n            aria-label="Open map actions"\n          >'
)
content = content.replace(
    '<button\n            type="button"\n            className="fixed right-6 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-card-foreground shadow-lg transition hover:bg-muted bottom-[11.5rem] md:bottom-24"\n            aria-label="Open stop map"\n          >',
    '<Button\n            variant="outline"\n            size="icon"\n            className="fixed right-6 z-30 h-11 w-11 rounded-full shadow-lg transition bottom-[11.5rem] md:bottom-24"\n            aria-label="Open stop map"\n          >'
)

content = content.replace('</button>', '</Button>')

with open("app/drv/schedule/page.tsx", "w") as f:
    f.write(content)
