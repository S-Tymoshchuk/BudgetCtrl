//Budget controller
const budgetController = (function () {

    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    };

    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    };

    const calculateTotal = (type) => {
        let sum = 0;
        data.allItems[type].forEach((cur) => {
            sum += cur.value;
        });
        data.totals[type] = sum;

    };

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0
    }

    return {
        addItem: function (type, des, val) {
            let newItem, ID;

            // Create new item based  on 'inc' or 'exp' type
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            // Return the new element
            return newItem;
        },
        deleteItem: (type, id) => {
            let ids, index;
            // id = 3
            //data.allItems[type][id];

            ids = data.allItems[type].map((cur) => {
                return cur.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: () => {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // Calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;
        },
        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        },
        testing: () => {
            console.log(data);
        }
    }


})();



// Ui controller
const UiController = (function () {

    const formatNumber = (num, type) => {
        let  numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input 2310, output 2,310
        }

        dec = numSplit[1];
        
        return (type === 'exp' ? '-' : '+') + '' + int + '.' + dec;

    };

    return {
        getInput: function () {
            return {
                type: document.querySelector('.add__type').value, //Will be either inc or exp
                description: document.querySelector('.add__description').value,
                value: parseFloat(document.querySelector('.add__value').value)
            }
        },
        addListItem: function (obj, type) {
            // Create HTML string with placeholder text
            let html, newHtml, element;

            if (type === 'inc') {
                element = document.querySelector('.income__list');
                html = `<div class="items" id="inc-%id%"><div class="item__description">%description%</div><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>`
            } else if (type === 'exp') {
                element = document.querySelector('.expenses__list');
                html = `<div class="items" id="exp-%id%"><div class="item__description">%description%</div><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>`
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            // Insert the HTML into the DOM

            element.insertAdjacentHTML("beforeend", newHtml);

        },
        deletelistItem: (selectorID) => {
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: () => {

            let fields, fieldsArr, addDesc, addVal;
            addDesc = '.add__description';
            addVal = '.add__value';
            fields = document.querySelectorAll(addDesc + ', ' + addVal);

            //fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr = Array.from(fields);
            fieldsArr.forEach(function (cur) {
                cur.value = "";
            })
        },
        displayBudget: (obj) => {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector('.budget__value').textContent = formatNumber(obj.budget, type);
            document.querySelector('.budget__income--value').textContent = formatNumber (obj.totalInc, type);
            document.querySelector('.budget__expenses--value').textContent = formatNumber(obj.totalExp, type);
        }
        
    }
})();

/// Global App controller
const controller = (function (budgetCtrl, UiCtrl) {

    const setupEvenListeners = () => {
        document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }

        });
        document.querySelector('.container').addEventListener('click', ctrlDeleteItem);

    }

    const updateBudget = () => {

        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return the budget
        let budget = budgetCtrl.getBudget();
        //3. Display the budget on the UI
        UiCtrl.displayBudget(budget);
    }


    const ctrlAddItem = function () {
        let input, newItem;
        //1. Get the filed input data
        input = UiCtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2.Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //3. Add the item to the  UI
            UiCtrl.addListItem(newItem, input.type);
            //4. Clear the fields
            UiCtrl.clearFields();
            //5. Calculate and update budget
            updateBudget();
        }

    };

    const ctrlDeleteItem = (event) => {
        let itemID, splitId, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.id;

        if (itemID) {
            // inc-1
            splitId = itemID.split('-');
            type = splitId[0];
            ID = parseFloat(splitId[1]);

            //1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            UiCtrl.deletelistItem(itemID);
            updateBudget();

        }
    }

    return {
        init: () => {
            console.log('Aplication has started.')
            UiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0
            })
            setupEvenListeners();
        }
    };

})(budgetController, UiController);

controller.init();