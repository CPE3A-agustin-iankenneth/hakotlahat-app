import re

with open("app/res/settings/page.tsx", "r") as f:
    content = f.read()

# Add imports
if "import { Card" not in content:
    content = content.replace('import { Switch } from "@/components/ui/switch";', 'import { Switch } from "@/components/ui/switch";\nimport { Card } from "@/components/ui/card";\nimport { Button } from "@/components/ui/button";\nimport { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";')

# Replace <button> with <Button>
# 1. Edit Profile
content = content.replace(
    '<button className="bg-primary hover:bg-primary/90 text-foreground px-6 py-2 rounded-lg font-medium">\n            ✎ Edit Profile\n          </button>',
    '<Button className="px-6 py-2 rounded-lg font-medium">\n            ✎ Edit Profile\n          </Button>'
)
# 2. Pin New Location
content = content.replace(
    '<button className="text-sm text-primary hover:text-primary font-medium">\n                  Pin New Location\n                </button>',
    '<Button variant="link" className="text-sm text-primary hover:text-primary font-medium p-0 h-auto">\n                  Pin New Location\n                </Button>'
)
# 3. Change Password / Two-Factor
content = content.replace(
    '<button className="w-full text-left py-3 px-0 hover:bg-background rounded-lg flex items-center justify-between group border-b">',
    '<Button variant="ghost" className="w-full text-left py-6 px-4 hover:bg-background rounded-lg flex items-center justify-between group border-b h-auto">'
).replace(
    '<button className="w-full text-left py-3 px-0 hover:bg-background rounded-lg flex items-center justify-between group">',
    '<Button variant="ghost" className="w-full text-left py-6 px-4 hover:bg-background rounded-lg flex items-center justify-between group h-auto">'
).replace(
    '</button>',
    '</Button>'
)
# Fix the edit profile Button we just converted
content = content.replace('</Button>\n        </div>\n      </div>\n      {/* Main Content */}', '</Button>\n        </div>\n      </div>\n      {/* Main Content */}')
content = content.replace(
    '<button className="bg-destructive/20 hover:bg-destructive/30 text-destructive px-6 py-2 rounded-lg font-medium flex items-center gap-2">\n            <LogOut className="h-4 w-4" />\n            Sign Out\n          </Button>',
    '<Button variant="destructive" className="bg-destructive/20 hover:bg-destructive/30 text-destructive px-6 py-2 rounded-lg font-medium flex items-center gap-2">\n            <LogOut className="h-4 w-4" />\n            Sign Out\n          </Button>'
)
# Wait, the previous `.replace('</button>', '</Button>')` replaced all `</button>` to `</Button>`. 
# So the Sign Out button now ends with `</Button>`.
content = content.replace(
    '<button className="bg-destructive/20 hover:bg-destructive/30 text-destructive px-6 py-2 rounded-lg font-medium flex items-center gap-2">',
    '<Button variant="destructive" className="bg-destructive/20 hover:bg-destructive/30 text-destructive px-6 py-2 rounded-lg font-medium flex items-center gap-2">'
)

# Replace <select> with <Select>
select_html = """<select className="w-full border border-border rounded-lg px-4 py-3 text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                <option>English (Philippines)</option>
                <option>Tagalog</option>
              </select>"""
select_jsx = """<Select defaultValue="english">
                <SelectTrigger className="w-full h-12 rounded-lg bg-card">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English (Philippines)</SelectItem>
                  <SelectItem value="tagalog">Tagalog</SelectItem>
                </SelectContent>
              </Select>"""
content = content.replace(select_html, select_jsx)

# Replace <div className="bg-card rounded-lg p-6 shadow-sm"> with <Card>
# 1. Pickup Address
content = content.replace(
    '{/* Pickup Address */}\n            <div className="bg-card rounded-lg p-6 shadow-sm">',
    '{/* Pickup Address */}\n            <Card className="p-6 shadow-sm">'
)
content = content.replace(
    '</p>\n                </div>\n              </div>\n            </div>\n            {/* Password & Security */}',
    '</p>\n                </div>\n              </div>\n            </Card>\n            {/* Password & Security */}'
)
# 2. Password & Security
content = content.replace(
    '{/* Password & Security */}\n            <div className="bg-card rounded-lg p-6 shadow-sm">',
    '{/* Password & Security */}\n            <Card className="p-6 shadow-sm">'
)
content = content.replace(
    '</Button>\n              </div>\n            </div>\n          </div>\n          {/* Right Column */}',
    '</Button>\n              </div>\n            </Card>\n          </div>\n          {/* Right Column */}'
)
# 3. Notification Settings
content = content.replace(
    '{/* Notification Settings */}\n            <div className="bg-card rounded-lg p-6 shadow-sm">',
    '{/* Notification Settings */}\n            <Card className="p-6 shadow-sm">'
)
content = content.replace(
    '<Switch className="ml-4 flex-shrink-0" />\n                </div>\n              </div>\n            </div>\n            {/* Language & Localization */}',
    '<Switch className="ml-4 flex-shrink-0" />\n                </div>\n              </div>\n            </Card>\n            {/* Language & Localization */}'
)
# 4. Language & Localization
content = content.replace(
    '{/* Language & Localization */}\n            <div className="bg-card rounded-lg p-6 shadow-sm">',
    '{/* Language & Localization */}\n            <Card className="p-6 shadow-sm">'
)
content = content.replace(
    '</SelectContent>\n              </Select>\n            </div>\n          </div>\n        </div>\n        {/* Danger Zone */}',
    '</SelectContent>\n              </Select>\n            </Card>\n          </div>\n        </div>\n        {/* Danger Zone */}'
)

with open("app/res/settings/page.tsx", "w") as f:
    f.write(content)
