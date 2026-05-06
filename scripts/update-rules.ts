import pkg from 'pokemon-showdown';
const { Dex, TeamValidator } = pkg;
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the formats we want to support
const FORMATS_TO_EXTRACT = [
    { id: 'gen9championsvgc2026regma', name: 'Gen 9 Champions Reg M-A' }
];

const OUTPUT_DIR = path.join(__dirname, '../src/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'format_data.json');

async function extractRules() {
    console.log('Starting Pokemon Showdown rules extraction...');
    
    const outputData: any = {};

    for (const format of FORMATS_TO_EXTRACT) {
        console.log(`\nExtracting format: ${format.name} (${format.id})`);
        
        const formatDex = Dex.forFormat(format.id);
        const formatObj = formatDex.formats.get(format.id);
        
        if (!formatObj.exists) {
            console.error(`Format ${format.id} does not exist in the current pokemon-showdown npm version.`);
            continue;
        }

        const legalPokemon: any = {};
        let legalCount = 0;
        
        // Use a simpler approach: if a species has a tier other than 'Illegal' or 'Unreleased' in the dex, it's generally legal.
        // Wait, VGC Reg G uses 'gen9vgc2025regg', which has no specific tiers assigned per-pokemon. Tiers are usually singles tiers (OU, UU, etc.)
        // So for VGC we must check the ruleTable!
        
        const ruleTable = formatDex.formats.getRuleTable(formatObj);

        for (const species of formatDex.species.all()) {
            if (species.num <= 0) continue;
            
            if (ruleTable.isBannedSpecies(species)) {
                continue;
            }
            
            if (species.isNonstandard === 'Custom' || species.isNonstandard === 'CAP' || species.isNonstandard === 'LGPE' || species.isNonstandard === 'Gigantamax' || species.isNonstandard === 'Unobtainable') {
                continue;
            }
            
            // For Gen 9 VGC, standard rules allow:
            // - Any Pokemon in the Paldea, Kitakami, or Blueberry Pokedex
            // - Certain transferable Pokemon
            // Instead of doing perfect validation which is complex via scripting,
            // We just ensure they exist in Gen 9 and are not explicitly banned.
            if (species.gen > 9) continue;
            
            // "Past" is tricky. Some "Past" mons are transferable via HOME and legal, some aren't.
            // If they are marked 'Past', they might not be in Gen 9 at all.
            if (species.isNonstandard === 'Past') {
                continue; 
            }
            
            // Wait, why is it finding 0? Let's debug inside the loop!
            if (species.name === 'Pikachu') {
                 console.log('Pikachu debug:', { 
                     isNonstandard: species.isNonstandard, 
                     tier: species.tier,
                     isBannedByRuleTable: ruleTable.isBannedSpecies(species)
                 });
            }
            
            // Wait, formatDex.data.Species might be empty if we don't call includeData!
            // Actually `formatDex.species.all()` is the proper way to get all species

            
            // We can skip the learnset for now to make this faster and less error prone.
            // Move legality is extremely complex in VGC (egg moves, event moves, etc).
            // A basic team builder usually just uses all learnable moves by getting them from a static pokedex API or we just omit them for now.
            const allowedMoves: string[] = [];
            
            legalPokemon[species.id] = {
                id: species.id,
                name: species.name,
                num: species.num,
                types: species.types,
                baseStats: species.baseStats,
                abilities: species.abilities,
                allowedMoves: allowedMoves 
            };
            legalCount++;
        }
        
        console.log(`Found ${legalCount} legal Pokemon for ${format.name}`);
        
        const legalItems: any = {};
        for (const item of formatDex.items.all()) {
            if (item.isNonstandard) continue;
            
            legalItems[item.id] = {
                id: item.id,
                name: item.name,
                desc: item.desc
            };
        }
        
        outputData[format.id] = {
            id: format.id,
            name: format.name,
            pokemon: legalPokemon,
            items: legalItems
        };
    }
    
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
    console.log(`\nSuccessfully wrote format data to ${OUTPUT_FILE}`);
}

extractRules().catch(console.error);
