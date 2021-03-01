const { Database } = require("../index");
const db = new Database("mongodb://localhost/test", "JSON", { useUnique: true });

db.on("ready", () => {
    console.log(`Hey, im ready! ${db.toString()}`);
    execute();
});

db.on("error", console.error);
db.on("debug", console.log);

async function execute() {
    await db.deleteAll();
    
    // Methods (everything should be true)
    console.log('[1] Adding Numbers:', typeof (await db.add('myNumber', 100)) === 'number');
    console.log('[2] Setting Data:', typeof (await db.set('myData', 'This data is here')) === 'string');
    console.log('[3] Deleting Data:', (await db.delete('myData')));
    console.log('[4] Fetching Deleted Data:', (await db.get('myData')) === null);
    console.log('[5] Fetching Added Number:', typeof (await db.get('myNumber')) === 'number');
    console.log('[6] Pushing to an array:', (await db.push('myVal', 'val')) instanceof Array);
    console.log('[7] Fetching first prop of array:', (await db.get('myVal.0')) === 'val');
    console.log('[8] Setting prop in object:', (await db.set('myObj.prop', 'myProp')).prop === 'myProp');
    console.log('[9] Fetching prop in object:', (await db.get('myObj.prop')) === 'myProp');
    console.log('[10] Deleting prop in object:', (await db.delete('myObj.prop')));
    console.log('[11] Subtracting from Numbers:', typeof (await db.subtract('myNumber', 50)) === 'number');
    console.log('[12] Pushing in array in object:', (await db.push('myObj.arr', 'myItem')).arr instanceof Array);
    console.log('[13] Fetching deleted prop:', (await db.get('myObj.prop')) === null);

    // Fetching properties from specific tables
    const test = db.createModel('test');
    test.set('data', 'hello world').then(console.log);
    console.log(await db.get('data')); // -> null
    console.log(await test.get('data')); // -> 'hello world'

    // Setting an object in the database:
    db.set('userInfo', { difficulty: 'Easy' }).then(console.log);
    // -> { difficulty: 'Easy' }

    db.push('userInfo.items', 'Sword').then(console.log);
    // -> { difficulty: 'Easy', items: ['Sword'] }

    db.add('userInfo.balance', 500).then(console.log);
    // -> { difficulty: 'Easy', items: ['Sword'], balance: 500 }

    // Repeating previous examples:
    db.push('userInfo.items', 'Watch').then(console.log);
    // -> { difficulty: 'Easy', items: ['Sword', 'Watch'], balance: 500 }

    db.add('userInfo.balance', 500).then(console.log);
    // -> { difficulty: 'Easy', items: ['Sword', 'Watch'], balance: 1000 }

    // Fetching individual properties
    db.get('userInfo.balance').then(console.log);
    // -> 1000
    db.get('userInfo.items').then(console.log);
    // -> ['Sword', 'Watch']
}