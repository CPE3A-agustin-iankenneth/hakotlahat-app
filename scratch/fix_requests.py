import re

with open("app/res/requests/page.tsx", "r") as f:
    content = f.read()

# The current broken structure is:
#             </div>
#         </Card>
#         </div>

content = content.replace(
    '            </div>\n        </Card>\n        </div>',
    '            </div>\n          </div>\n        </Card>'
)

# Wait, my regex earlier was:
# r'(<button className="p-2 text-destructive[\s\S]*?</button>\s*)</div>\s*</div>',
# r'\1</div>\n        </Card>',
# So the actual content has:
#               <button className="p-2 text-destructive hover:text-destructive/80 transition-colors">
#                 <Trash2 size={20} />
#               </button>
#             </div>
#         </Card>
#         </div>
# Let's just do a string replacement for the exact mistake.

content = content.replace(
    '              </button>\n            </div>\n        </Card>\n        </div>',
    '              </button>\n            </div>\n          </div>\n        </Card>'
)

# Also let's fix the trash button not being replaced earlier because I messed up the regex.
content = content.replace(
    '<button className="p-2 text-destructive hover:text-destructive/80 transition-colors">\n                <Trash2 size={20} />\n              </button>',
    '<Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">\n                <Trash2 size={20} />\n              </Button>'
)

# Ensure the Button tag is imported
if "import { Button } from" not in content:
    pass # it's already there

with open("app/res/requests/page.tsx", "w") as f:
    f.write(content)
