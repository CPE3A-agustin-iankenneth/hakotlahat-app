import re

with open("app/drv/page.tsx", "r") as f:
    content = f.read()

# Add imports
if "import { Badge" not in content:
    content = content.replace("import { Button } from '@/components/ui/button';", "import { Button } from '@/components/ui/button';\nimport { Badge } from '@/components/ui/badge';")

# Replace Badge
content = content.replace(
    '<div className="bg-destructive/20 text-destructive px-3 py-1 rounded text-xs font-semibold">\n              {currentStop.priority}\n            </div>',
    '<Badge variant="destructive" className="bg-destructive/20 text-destructive hover:bg-destructive/20 rounded">\n              {currentStop.priority}\n            </Badge>'
)

# Replace <button> in list
content = content.replace(
    '<button\n                    key={stop.id}\n                    onClick={() => setSelectedStop(stop)}\n                    className={`w-full text-left p-3 rounded-lg transition-colors ${\n                      selectedStop?.id === stop.id\n                        ? \'bg-primary/20 border border-primary\'\n                        : \'bg-muted/50 hover:bg-muted-foreground/30\'\n                    }`}\n                  >',
    '<Button\n                    key={stop.id}\n                    variant="ghost"\n                    onClick={() => setSelectedStop(stop)}\n                    className={`w-full h-auto justify-start text-left p-3 rounded-lg transition-colors ${\n                      selectedStop?.id === stop.id\n                        ? \'bg-primary/20 border border-primary\'\n                        : \'bg-muted/50 hover:bg-muted-foreground/30\'\n                    }`}\n                  >'
)
content = content.replace('</button>\n                ))}', '</Button>\n                ))}')

with open("app/drv/page.tsx", "w") as f:
    f.write(content)
