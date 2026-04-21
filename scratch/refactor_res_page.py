import re

with open("app/res/page.tsx", "r") as f:
    content = f.read()

# Replace <button> with <Button>
content = content.replace(
    '<button\n            onClick={() => setNotifOpen(true)}\n            className="relative text-muted-foreground hover:text-foreground transition-colors"\n            aria-label="Notifications"\n          >',
    '<Button\n            variant="ghost"\n            size="icon"\n            onClick={() => setNotifOpen(true)}\n            className="relative text-muted-foreground hover:text-foreground transition-colors rounded-full"\n            aria-label="Notifications"\n          >'
)
content = content.replace(
    '<button\n            onClick={() => setHelpOpen(true)}\n            className="text-muted-foreground hover:text-foreground transition-colors"\n            aria-label="Help"\n          >',
    '<Button\n            variant="ghost"\n            size="icon"\n            onClick={() => setHelpOpen(true)}\n            className="text-muted-foreground hover:text-foreground transition-colors rounded-full"\n            aria-label="Help"\n          >'
)
content = content.replace(
    '<button className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm hover:bg-primary/30 transition-colors">',
    '<Button variant="ghost" className="w-9 h-9 p-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm hover:bg-primary/30 transition-colors">'
)
content = content.replace(
    '<button\n              onClick={() => setPickupOpen(true)}\n              className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity w-fit"\n            >',
    '<Button\n              onClick={() => setPickupOpen(true)}\n              className="mt-6 rounded-full px-6 py-6 font-semibold w-fit"\n            >'
)
content = content.replace(
    '<button\n              onClick={() => setScanOpen(true)}\n              className="mt-6 bg-primary-foreground text-primary font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity w-fit"\n            >',
    '<Button\n              variant="secondary"\n              onClick={() => setScanOpen(true)}\n              className="mt-6 rounded-xl px-6 py-6 font-semibold text-primary w-fit"\n            >'
)
content = content.replace(
    '<button\n              onClick={() => toast(`Showing all activity — ${activity.length} entries total.`)}\n              className="text-sm text-primary font-semibold hover:underline"\n            >',
    '<Button\n              variant="link"\n              onClick={() => toast(`Showing all activity — ${activity.length} entries total.`)}\n              className="text-primary font-semibold p-0 h-auto"\n            >'
)

content = content.replace(
    '<button\n                key={item.id}\n                onClick={() => {\n                  setSelectedActivity(item);\n                  setActivityOpen(true);\n                }}\n                className="w-full flex items-center justify-between py-3 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors text-left"\n              >',
    '<Button\n                key={item.id}\n                variant="ghost"\n                onClick={() => {\n                  setSelectedActivity(item);\n                  setActivityOpen(true);\n                }}\n                className="w-full h-auto flex items-center justify-between py-4 hover:bg-muted/50 rounded-lg transition-colors text-left"\n              >'
)

content = content.replace('</button>', '</Button>')

# Check if Button is imported, if not, add it
if "import { Button } from" not in content:
    content = content.replace('import { Badge } from', 'import { Button } from "@/components/ui/button";\nimport { Badge } from')

with open("app/res/page.tsx", "w") as f:
    f.write(content)
