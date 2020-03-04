document.addEventListener('DOMContentLoaded', function() {
    let app = firebase.app();
    let db = app.firestore();
    let nameExpense = document.getElementById("nameExpense");
    let inputExpense = document.getElementById("inputExpense");
    let inputMoney = document.getElementById("inputMoney");
    let expenseAddButton =document.getElementById("addButton-1");
    let moneyAddButton =document.getElementById("addButton-2");
    let myTable = document.getElementById("table");
    let balanceText = document.getElementById("Balance");
    var balance = 0;
    
    moneyAddButton.onclick = () =>{
        var text = "Deposit";
        var value = inputMoney.value;
        var timeStamp = Date.now();

        db.collection("expenses").add({
            name: text,
            price: value,
            type: "Deposit",
            time: timeStamp
        })
        inputMoney.value = '';
    }

    expenseAddButton.onclick = () => {
        var text = nameExpense.value;
        var value = inputExpense.value;
        var timeStamp = Date.now();
        if(balance - parseInt(value)<0){
            console.log("Not Enough Balance");
            nameExpense.value = '';
            inputExpense.value = '';
        }else{
            db.collection("expenses").add({
                name: text,
                price: value,
                type: "Expense",
                time: timeStamp
            })
            nameExpense.value = '';
            inputExpense.value = '';
        }
        
    }


    db
    .collection("expenses")
    .orderBy("time")
    .onSnapshot(querySnapshot => {
        if(querySnapshot.size == 0 ){
            balance = 0;
        }
        myTable.innerHTML = '';
        let trNode = document.createElement("tr");
        let thExpense = document.createElement("th");
        thExpense.innerHTML = "Expense";
        let thPrice = document.createElement("th");
        thPrice.innerHTML = "Price";
        let thType = document.createElement("th");
        thType.innerHTML = "Type";
        let thTime = document.createElement("th");
        thTime.innerHTML = "Time";
        let thFunction = document.createElement("th");
        thFunction.innerHTML = "Functions";

        trNode.appendChild(thExpense);
        trNode.appendChild(thPrice);
        trNode.appendChild(thType);
        trNode.appendChild(thTime);
        trNode.appendChild(thFunction);
        myTable.append(trNode);
        balance = 0;
        querySnapshot.forEach(doc=> {
            console.log("test" + doc.data().expense)
            renderTable(doc.id, doc.data().name,doc.data().price,doc.data().type,doc.data().time);
        });
    });

    const renderTable = (id, name, price, type, time) => {
        var row = myTable.insertRow(1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);

        let linkNode = document.createElement("button");
        linkNode.innerHTML = "Edit";
        linkNode.classList.add("edit-item");

        let saveNode = document.createElement("button");
        saveNode.innerHTML = "Save";
        saveNode.classList.add("save-item");
        saveNode.style.visibility = "collapse";

        let deleteNode = document.createElement("button");
        deleteNode.innerHTML = "Delete";
        deleteNode.classList.add("delete-item");
        
        
        let unix_timestamp = parseInt(time);
        // Create a new JavaScript Date object based on the timestamp
        // multiplied by 1000 so that the argument is in milliseconds, not seconds.
        var date = new Date(unix_timestamp);
        // Hours part from the timestamp
        var hours = date.getHours();
        // Minutes part from the timestamp
        var minutes = "0" + date.getMinutes();
        // Seconds part from the timestamp
        var seconds = "0" + date.getSeconds();
        var month = date.getMonth() + 1;
        var day = date.getDay() + 1;
        var year = date.getFullYear();

        // Will display time in 10:30:23 format
        var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + " / " 
        + month + " " + day +", " + year;

        
        cell1.innerHTML = name;
        cell2.innerHTML = price;
        cell3.innerHTML = type;
        cell4.innerHTML = formattedTime;
        cell5.append(linkNode);
        cell5.append(saveNode);
        cell5.append(deleteNode);

        linkNode.onclick = () => {
            cell1.contentEditable = "true";
            cell2.contentEditable = "true";
            linkNode.style.visibility = "collapse";
            saveNode.style.visibility = "visible";
            deleteNode.style.visibility = "collapse";
            saveNode.onclick = () => {
                let firstCell = cell1.innerHTML;
                var secondCell = cell2.innerHTML;

                if(((balance - parseInt(secondCell) + parseInt(price)) < 0)|| (firstCell == name && secondCell == price)){
                    console.log(balance - parseInt(secondCell));
                    cell1.contentEditable = "false";
                    cell1.innerHTML = name;
                    cell2.contentEditable = "false";
                    cell2.innerHTML = price;
                    linkNode.style.visibility = "visible";
                    saveNode.style.visibility = "collapse";
                    deleteNode.style.visibility = "visible";

                }else{
                    db.collection("expenses").doc(id).update({
                        "name": firstCell,
                        "price": secondCell
                    })
                }
            }
        }

        deleteNode.onclick = () => {
            db.collection("expenses").doc(id).delete().then(() => {
               db.collection("expenses").get().then(querySnapshot=> {
                   if(querySnapshot.size ==0){
                       balance = 0;
                       balanceText.innerHTML = balance;
                   }
               })
            })
        }

        if (type == "Deposit"){
            balance = balance + parseInt(price);
        }else{
            balance = balance - parseInt(price);
        }

        balanceText.innerHTML = '';
        balanceText.innerHTML = balance;
    }


});