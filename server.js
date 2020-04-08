const mysql = require('mysql')
const inquirer = require('inquirer')
const util = require('util')

var connection = mysql.createConnection({
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "0903986011Aa!",
    "database": "greatbayDB"
})

const queryPromise = util.promisify(connection.query).bind(connection)
const questions = [{
    'type': 'rawlist',
    'message': 'Press choose your choice. Bid or Post',
    'name': 'userInput',
    'choices': ['Bid', 'Post']
}]

async function start() {
    const answer = await inquirer.prompt(questions)
    if (answer.userInput == 'Post') {
        postItem()
    } else {
        bidItem()
    }
}

function bidItem() {
    readDatabase()   
}

async function readDatabase() {
    try {
        let result = await queryPromise('SELECT * FROM items')
        const choicesFromDataBase = {}

        for (let i = 0; i < result.length; i++) {
            choicesFromDataBase[result[i].name] = result[i].price
        }

        let itemName = Object.keys(choicesFromDataBase)

        bidChoices = [{
            'type': 'rawlist',
            'message': 'Which item would you like to bet on?',
            'name': 'bidChoice',
            'choices': itemName
        },{
            'type': 'input',
            'message': 'How much do you want to bid?',
            'name': 'bidPrice'
        }]

        const answer = await inquirer.prompt(bidChoices)

        if(answer.bidPrice > choicesFromDataBase[answer.bidChoice]){
            console.log('Higher!')
            // Take name and price
            updateItem(answer.bidChoice, answer.bidPrice)
        } else {
            console.log('Lower!')
            
            start()
        }
        
     
    } catch (e) {
        throw e
    }

}

async function updateItem(choice,price){
    const result = await queryPromise('UPDATE items SET ? WHERE ?', [{
       price: price
    },{
       name: choice
    }])
    connection.end()
    
    console.log('Update successful')
}

async function postItem() {
    const postQuestion = [{
        'type': 'input',
        'message': 'What is the name of the item you want to post?',
        'name': 'nameOfItem',
    }, {
        'type': 'input',
        'message': 'What is the price of this item in $?',
        'name': 'priceOfItem',
    }]

    // Ask them for question 
    const answer = await inquirer.prompt(postQuestion)

    //Save in variable
    const itemName = answer.nameOfItem
    const price = answer.priceOfItem // This is bid

    // Connect to greatbayDB and post it
    const sql = "INSERT INTO items SET ?"
    const data = {
        'name': itemName,
        'price': price
    }

    connection.connect(function (err) {
        if (err) throw err

        console.log('Connected Successfully')

        connection.query(sql, data, (err, res) => {
            console.log('Added successfully')
            console.log(res.affectedRows + " product inserted!\n");
            connection.end()
        })
    })

}

connection.connect()// Connect first
start()

