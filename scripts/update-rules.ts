import pkg from 'pokemon-showdown';
const { Dex } = pkg;
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
            
            if (species.isNonstandard === 'Past') {
                continue; 
            }
            
            // Wait, formatDex.data.Species might be empty if we don't call includeData!
            // Actually `formatDex.species.all()` is the proper way to get all species

            
            // Extract learnset: get all move IDs this species can learn
            const allowedMoves: string[] = [];
            try {
                // Access learnsets via data.Learnsets directly
                const speciesLearnset = (formatDex.data as any).Learnsets?.[species.id];
                if (speciesLearnset && speciesLearnset.learnset) {
                    for (const moveId of Object.keys(speciesLearnset.learnset)) {
                        allowedMoves.push(moveId);
                    }
                }
                
                // For alternate forms (Mega, regional), inherit base species learnset
                if (allowedMoves.length === 0 && species.baseSpecies && species.baseSpecies !== species.name) {
                    const baseId = species.baseSpecies.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const baseLearnset = (formatDex.data as any).Learnsets?.[baseId];
                    if (baseLearnset && baseLearnset.learnset) {
                        for (const moveId of Object.keys(baseLearnset.learnset)) {
                            allowedMoves.push(moveId);
                        }
                    }
                }
            } catch (e) {
                // Learnset extraction failed; leave empty as fallback
            }
            
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
            
            // Normalize megaEvolves and megaStone since showdown data structures can vary
            let megaEvolves = item.megaEvolves || null;
            let megaStone = item.megaStone || null;
            
            legalItems[item.id] = {
                id: item.id,
                name: item.name,
                desc: item.desc,
                megaEvolves: megaEvolves,
                megaStone: megaStone
            };
        }

        const legalMoves: any = {};
        for (const move of formatDex.moves.all()) {
            if (move.isNonstandard || move.num <= 0) continue;
            
            legalMoves[move.id] = {
                id: move.id,
                name: move.name,
                type: move.type,
                basePower: move.basePower,
                category: move.category
            };
        }
        
        outputData[format.id] = {
            id: format.id,
            name: format.name,
            pokemon: legalPokemon,
            items: legalItems,
            moves: legalMoves
        };
    }
    
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
    console.log(`\nSuccessfully wrote format data to ${OUTPUT_FILE}`);
}

extractRules().catch(console.error);
