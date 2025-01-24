/////making a merkle proof, verifying a txs is in the block
// no protect

const fetchLatestBlock = () =>
    fetch("https://blockchain.info/q/latesthash?cors=true").then(r => r.text());


const fetchMerkleRootAndTransactions = block =>
    fetch(`https://blockchain.info/rawblock/${block}?cors=true`).then(r => r.json()).then(d => [d.mrkl_root, d.tx.map(t => t.hash)]);


// get random txs from the block
const rand = arr =>
    arr[Math.floor(Math.random() * arr.length)]

const toBytes = hex =>
    hex.match(/../g).reduce((acc, hex) => [...acc, parseInt(hex, 16)], []);

const toHex = bytes =>
    bytes.reduce((acc, bytes) => acc + bytes.toString(16).padStart(2, "0"), '');

const toPairs = arr => 
    Array.from(Array(Math.ceil(arr.length /2 )), (_, i) => arr.slice(i * 2, i * 2 + 2));

const hashPair = (a, b = a) => {
    const bytes = toBytes(`${b}${a}`).reverse();
    const hashed = sha256.array(sha256.array(bytes));
    return toHex(hashed.reverse());
}


// create a function to proof this trasaction exists in this  block
// recursive algorithm
const merkleProof = (txs, tx, proof = []) => {
    if(txs.length === 1){
        // complete the proof if there is only one txs
        // base case
        return proof;
    }
    // generate new tree
    const tree = [];

    // getting all the txs to give back proof
    toPairs(txs).forEach(pair => {
        // generate the hash for each one of the pair
        const hash = hashPair(...pair);

        if(pair.includes(tx)){
            // if te left one is the tx we are looking for, we will get the right one to proof vice versa
            const idx = pair[0] === tx | 0;
            //push index and the other pair we need
            proof.push([idx = pair[idx]]);
            tx = hash;
        }

        tree.push(hash)
    });
    // recurisve call
    return merkleProof(tree, tx, proof)
}


// when you get the proof, we want to proof all the computation returns the merkle root of the block
const merkleProofRoot = (proof, tx) => 
    proof.reduce((root, [idx, tx]) => idx ? hashPair(root, tx) : hashPair(tx, root), tx);

fetchLatestBlock().then(fetchMerkleRootAndTransactions).then(([root, txs]) => {
    // console.log(root);
    // console.log(txs);

    const txss = rand(txs);
    const proof = merkleProof(txss, tx);
    console.log(proof)


    const isValid = merkleProofRoot(proof, tx) === root;
    console.log(tx, isValid);
})