# pf_randomizr
Pathfinder character generator

All Core/APG/ACG classes are in
All core/featured/uncommon races are in
Normalize fn has been updated- works i think, there's a bit of a ghost in the machine there
Leveling has partial support

CURRENT: feats are underway (data entry and structural determination.) Need support for levels of classes, OR handling (feat A or feat B.) Feature support.

NEXT 3 months ago: Update objects.json for new feature/result retrieval structure, then update generation logic: skills, saves, bab, hp, and incorporate level (math: total bab = math.floor(class_level*bab_type))

TODO:
  -Add Magus, special classes
  
  -spells/feats
  
  -Add unarmed damage table
  
  -Add animal companion table
  
  -Add combat feat/style feat table
  
  -Add Racial bonuses (ac, atk, etc) to obj data
  
  -Skill selection package
  
  -Ifrits have some complicated fire sorceror garbage, might need to be angularized to actually work
  
  -Inventory interface: randomized + chosen. "Generate New" button generates full inventory based on gold max, but user can update counts/items, with cusom items options. recorded with saves. Maybe separate inv generation button.
  
  -Spellbook interface- from spells known, select spells per day. Randomize both. allow for customization.
  
  -Updating core stats/skills? feat selection? is this a character builder tool now rather than a randomizer if I add the spell/inventory trackers?
