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

const hashedTransactions = transactions.map(hashName);

const root = merkleRoot(hashedTransactions);

console.log("Merkle Root:", root);
console.log("Hashed Transactions:", hashedTransactions);
