// const sha256 = require("sha256");

const transactions = [
    "debby",
    "ola",
    "james",
    "victory",
    "jerry",
    "manji"
];

const toBytes = str =>
    new TextEncoder().encode(str);

const toHex = bytes =>
    bytes.reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), '');

const toPairs = arr =>
    Array.from(Array(Math.ceil(arr.length / 2)), (_, i) => arr.slice(i * 2, i * 2 + 2));

const hashName = name => {
    const bytes = sha256.array(toBytes(name));
    return toHex(bytes);
};

const hashPair = (a, b = a) => {
    const bytes = toBytes(`${b}${a}`);
    const hashed = sha256.array(sha256.array(bytes));
    return toHex(hashed);
};

const merkleRoot = txs =>
    txs.length === 1
        ? txs[0]
        : merkleRoot(toPairs(txs).reduce((tree, pair) => [...tree, hashPair(...pair)], []));

const merkleProof = (txs, tx, proof = []) => {
    if (txs.length === 1) {
        return proof; 
    }

    const tree = [];
    toPairs(txs).forEach(pair => {
        const hash = hashPair(...pair);
        if (pair.includes(tx)) {
            const idx = pair[0] === tx ? 0 : 1;
            proof.push([idx, pair[1 - idx]]); 
            tx = hash;
        }
        tree.push(hash);
    });

    return merkleProof(tree, tx, proof); 
};


const merkleProofRoot = (proof, tx) =>
    proof.reduce((root, [idx, sibling]) =>
        idx ? hashPair(root, sibling) : hashPair(sibling, root), tx);

const hashedTransactions = transactions.map(hashName);

const root = merkleRoot(hashedTransactions);

const randomTx = hashedTransactions[Math.floor(Math.random() * hashedTransactions.length)];
const proof = merkleProof(hashedTransactions, randomTx);

const isValid = merkleProofRoot(proof, randomTx) === root;

console.log("Merkle Root:", root);
console.log("Random Transaction:", randomTx);
console.log("Proof:", proof);
console.log("Is Valid Proof:", isValid);
