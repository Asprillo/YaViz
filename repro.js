
import { parseDocument } from 'yaml';

const yamlStr = `enabledGameModes:
  0: #BR
    solo: false
    duo: false
`;

function testUpdate(path, newValue) {
    console.log(`--- Testing update of ${path} to ${newValue} ---`);
    const doc = parseDocument(yamlStr);
    
    const visit = (node, p = 'root') => {
        if (!node) return;
        if (node.comment) console.log(`Comment found at ${p}.comment: "${node.comment}"`);
        if (node.commentBefore) console.log(`Comment found at ${p}.commentBefore: "${node.commentBefore}"`);
        
        // Relocation logic
        if (node.items) {
            node.items.forEach((item, i) => {
                if (item.value && item.value.commentBefore && !item.comment) {
                    console.log(`Relocating comment from ${p}.items[${i}].value.commentBefore to ${p}.items[${i}].key.comment`);
                    item.key.comment = item.value.commentBefore;
                    item.value.commentBefore = null;
                }
                if (item.key) visit(item.key, `${p}.items[${i}].key`);
                if (item.value) visit(item.value, `${p}.items[${i}].value`);
                visit(item, `${p}.items[${i}]`);
            });
        }
    };
    visit(doc.contents);
    
    const parts = path.split('.');
    const typedParts = parts.map(p => isNaN(Number(p)) ? p : Number(p));
    
    const node = doc.getIn(typedParts, true);
    if (node && 'value' in node) node.value = newValue;

    const output = doc.toString({ 
        lineWidth: 0, 
        simpleKeys: false
    });
    console.log('--- Output ---');
    console.log(output);
}

testUpdate('enabledGameModes.0.solo', true);
