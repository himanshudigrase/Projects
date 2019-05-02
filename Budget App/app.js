//3 modules budgetController,UIController,controller

//budgetController module
var budgetController = (function (){
  
    var Expense  = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        //for storing percentage
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage =Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income  = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
        
    };
    var data = {
        allItems: {
            inc : [],
            exp : []
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget: 0,
        percentage: -1

    };
    return {
        addItem: function(type, des, val){
            var newItem,ID;

            //Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }
            else{
                ID = 0;
            }
            //Create new Items based on inc or exp
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            //Push items into data structure
            data.allItems[type].push(newItem);

            //Return new element
            return newItem;
        },
        deleteItem: function(type,id){
            var ids,index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }

        },


        calculateBudget : function(){
            //Calculate income and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            
            //Calculate budget : income-exp
             data.budget = data.totals.inc - data.totals.exp;

            //calculate percent of income spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            } 
            
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentage:function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function(){
            console.log(data);
        }
    }
})();


//UIController module
var UIController = (function (){

    var DOMstrings  =  {
      inputype  : '.add__type',
      inputdesription : '.add__description',
      inputvalue : '.add__value',
      inputbutton : '.add__btn',
      incomeContainer: '.income__list',
      expensesContainer : '.expenses__list',
      budgetLabel : '.budget__value',
      incomeLabel : '.budget__income--value' ,
      expensesLabel: '.budget__expenses--value',
      percentageLabel: '.budget__expenses--percentage',
      container: '.container',
      expensesPercLabel: '.item__percentage',
      dateLabel: '.budget__title--month'
    };
    var formatNumbers = function(num,type){
        var splitNum,inc,dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        splitNum = num.split('.');

        int  = splitNum[0];
        if(int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3);
        }
        dec = splitNum[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    var nodeListForEach = function(list,callback){
        for(var i=0; i<list.length;i++){
            callback(list[i],i);
        }
    };
    return {
        getInput:function()
        {
            return{
                type : document.querySelector(DOMstrings.inputype).value,
                description : document.querySelector(DOMstrings.inputdesription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputvalue).value) 
            };
            
        },
        addListItem: function(obj,type){
            var html,newHtml,element; 
             //1.Create HTML strings with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html =  '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
             
            //2.Replace placeholder
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumbers( obj.value,type));
            
            //3.Insert html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
         },
         deleteListItem: function(selectID){
             var el = document.getElementById(selectID);
             el.parentNode.removeChild(el);
         },
         clearFields: function(){
            var fields,fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputdesription + ',' + DOMstrings.inputvalue);
            fieldsArr=Array.prototype.slice.call(fields);
            fieldsArr.forEach( function(current,index,array){
                current.value = "";
            });
            fieldsArr[0].focus();
         },
         displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
             document.querySelector(DOMstrings.budgetLabel).textContent =formatNumbers(obj.budget,type);
             document.querySelector(DOMstrings.incomeLabel).textContent = formatNumbers(obj.totalInc,type);
             document.querySelector(DOMstrings.expensesLabel).textContent =formatNumbers(obj.totalExp,type);
             if(obj.totalInc > 0)
             {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
             }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
             }
             
         },
         displayPercentages:function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
           

            nodeListForEach(fields,function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });
         },
         displayDate: function(){
             var now,year,month,months;

             months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
             now = new Date();
             year = now.getFullYear();
             month = now.getMonth();
             
             document.querySelector(DOMstrings.dateLabel).textContent = months[month] +' '+ year;
         },
         changedType: function(){
             var fields = document.querySelectorAll(
                DOMstrings.inputype + ','+
                DOMstrings.inputdesription +','+
                DOMstrings.inputvalue 
             );
             nodeListForEach(fields,function(cur){
                 cur.classList.toggle('red-focus');

             });
             document.querySelector(DOMstrings.inputbutton).classList.toggle('red');
         },
        getDOMstrings: function(){
            return DOMstrings;
        }
    };
    
})();


//controller module
var controller = (function (bdgtCntrl,UICntrl){
    var setupEventListeners  =  function(){
        var DOM  = UICntrl.getDOMstrings();
        document.querySelector(DOM.inputbutton).addEventListener('click',cntrlAddItem);
        document.addEventListener('keypress',function(e){
            if(e.keyCode == 13 || e.which === 13){
                cntrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click',cntrlDeleteItem);

        document.querySelector(DOM.inputype).addEventListener('change',UICntrl.changedType);
    };
    var updateBudget = function(){
        //1.Calculate
        bdgtCntrl.calculateBudget();
        //2.Return Budget
        var budget = bdgtCntrl.getBudget()
        //3.Display the budget
        UICntrl.displayBudget(budget);
    };
    var updatePercentages = function(){
        //1.Calculate pecentage
        bdgtCntrl.calculatePercentages();
        //2.Read percentage from budget controller
        var percentages = bdgtCntrl.getPercentage();
        //3.Update UI with new percentage
        UICntrl.displayPercentages(percentages);
    }
    var cntrlAddItem = function (){ 
        var  input, newItem;
        
        //1.get the input field
            input = UICntrl.getInput(); 
         if(input.description !== "" && !isNaN(input.value) && input.value > 0) 
         {
             //2.Add the item to budget controller
            newItem = bdgtCntrl.addItem(input.type, input.description,input.value);
            
            //3.Dispay it on UI
            UICntrl.addListItem(newItem,input.type);
            
            //4.Clear fields
            UICntrl.clearFields();   
             
            //5. Calculate and update budget
            updateBudget();  
            
            //6.Calculate and update percentages
            updatePercentages();
         }  
        
    };
     var cntrlDeleteItem = function(event){
        var itemID,splitID,type,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            //inc
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //update the data structure
            bdgtCntrl.deleteItem(type,ID);
            //update the ui
            UICntrl.deleteListItem(itemID);
            //update BUdget
            updateBudget();

            //Calculate and update percentages
            updatePercentages();
        }
        
     }

    return {
        init : function(){
            console.log("App started");
            UICntrl.displayDate();
            UICntrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    }
    
    
})(budgetController,UIController);

controller.init();