import re

with open("app/drv/points/page.tsx", "r") as f:
    content = f.read()

# Add imports
if "import { Card" not in content:
    content = content.replace('import { Button } from "@/components/ui/button";', 'import { Button } from "@/components/ui/button";\nimport { Card } from "@/components/ui/card";\nimport { Badge } from "@/components/ui/badge";')

# Main Card Container
content = content.replace(
    '<div className="bg-card/50 border border-primary/30 rounded-3xl p-12 flex items-center justify-between gap-12">',
    '<Card className="bg-card/50 border-primary/30 rounded-3xl p-12 flex items-center justify-between gap-12">'
)
content = content.replace(
    '</svg>\n            <div className="absolute flex flex-col items-center">\n              <p className="text-6xl font-bold text-foreground">{progressValue.toLocaleString()}</p>\n              <p className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Total Points</p>\n            </div>\n          </div>\n        </div>\n\n        {/* Stats Cards Grid */}\n        <div className="grid grid-cols-4 gap-4">',
    '</svg>\n            <div className="absolute flex flex-col items-center">\n              <p className="text-6xl font-bold text-foreground">{progressValue.toLocaleString()}</p>\n              <p className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Total Points</p>\n            </div>\n          </div>\n        </Card>\n\n        {/* Stats Cards Grid */}\n        <div className="grid grid-cols-4 gap-4">'
)

# Stats Cards Grid
content = content.replace(
    '<div key={index} className="bg-card/50 border border-border rounded-2xl p-6">',
    '<Card key={index} className="bg-card/50 rounded-2xl p-6">'
)
content = content.replace(
    '</p>\n              </div>\n            );\n          })}\n        </div>\n\n        {/* Fleet Leaderboard */}',
    '</p>\n              </Card>\n            );\n          })}\n        </div>\n\n        {/* Fleet Leaderboard */}'
)

# Stats Badges
content = content.replace(
    '<span className={`text-xs font-bold ${stat.badgeColor}`}>\n                    {stat.badge}\n                  </span>',
    '<Badge variant="outline" className={`text-xs font-bold border-none ${stat.badgeColor}`}>\n                    {stat.badge}\n                  </Badge>'
)

# Fleet Leaderboard
content = content.replace(
    '<div className="bg-card/50 border border-border rounded-3xl p-8">',
    '<Card className="bg-card/50 rounded-3xl p-8">'
)
content = content.replace(
    '</p>\n                </div>\n              </div>\n            ))}\n          </div>\n        </div>\n      </div>\n    </div>',
    '</p>\n                </div>\n              </div>\n            ))}\n          </div>\n        </Card>\n      </div>\n    </div>'
)

# "View Full Rankings" Button
content = content.replace(
    '<button className="text-primary text-sm font-semibold hover:text-primary/80 flex items-center gap-1">',
    '<Button variant="link" className="text-primary font-semibold hover:text-primary/80 flex items-center gap-1 p-0 h-auto">'
).replace(
    'View Full Rankings <ChevronRight size={16} />\n            </button>',
    'View Full Rankings <ChevronRight size={16} />\n            </Button>'
)

# YOU badge
content = content.replace(
    '<span className={`${driver.badgeBg} text-foreground text-xs px-2 py-1 rounded-full font-bold`}>\n                          {driver.badge}\n                        </span>',
    '<Badge className={`${driver.badgeBg} text-foreground text-xs`}>\n                          {driver.badge}\n                        </Badge>'
)


with open("app/drv/points/page.tsx", "w") as f:
    f.write(content)
