// noprotect

 
// merkle tree was named after its creator Rouf Merkle, 1970s

// STEP 1
// grab contents directly from the bitcoin chain... fetch latest blog using the url
const fetchLatestBlock = () =>
    fetch("https://blockchain.info/q/latesthash?cors=true").then(r => r.text());

// fetchLatestBlock().then(console.log)

//STEP 2
// initial api to find merkle tree for each block
// https://blockchain.info/rawblock/12345?cors=true
// pulling out mmerkle roots and transactions from the block.
// raw block information
// pass it as json
// get the transactions and pull out the hashes for each one of those
const fetchMerkleRootAndTransactions = block =>
    fetch(`https://blockchain.info/rawblock/${block}?cors=true`).then(r => r.json()).then(d => [d.mrkl_root, d.tx.map(t => t.hash)]);

// fetchLatestBlock().then(fetchMerkleRootAndTransactions).then(console.log)

// STEP 4
// with hexed string provided, split it up into pairs
// each one of then will parse it and give us in base 10 and provide an array that can be used in the sha256 library
const toBytes = hex =>
    hex.match(/../g).reduce((acc, hex) => [...acc, parseInt(hex, 16)], []);


// STEP 5
// convert bytes back to hex
// makes sure its evrry two hashes hashing together
const toHex = bytes =>
    bytes.reduce((acc, bytes) => acc + bytes.toString(16).padStart(2, "0"), '');


// STEP 7
// goes through the array and pick out each individual pair and the last one will be on its own 
// if it is an odd length in the array
const toPairs = arr => 
    Array.from(Array(Math.ceil(arr.length /2 )), (_, i) => arr.slice(i * 2, i * 2 + 2));

// STEP 3
// verifying merkle root
// uses double sha256 hashing 
// import a sha256 lib in html
// implement hash pair, hashing each pair, even we have an odd number, b, b will hash it self
// if there is no second pair, b will be set to a where it will duplicate itself
const hashPair = (a, b = a) => {
    // convert hashes to byte array
    // joins two hashes together
    const bytes = toBytes(`${b}${a}`).reverse();
    const hashed = sha256.array(sha256.array(bytes));
    return toHex(hashed.reverse());
}

// STEP 6
// create base function
// if txs is one, pass back the root... base case
// then call itself, recursive funtion
// split the transaction into a pair and get tree and pair
const merkleRoot = txs =>
    txs.length === 1
        ? txs[0]
        : merkleRoot(toPairs(txs).reduce((tree, pair) => [...tree, hashPair(...pair)], []));



fetchLatestBlock().then(fetchMerkleRootAndTransactions).then(([root, txs]) => {
    // const isValid = merkleRoot(txs) === root;
    // console.log(isValid);
    console.log(root);
    console.log(txs);

})







