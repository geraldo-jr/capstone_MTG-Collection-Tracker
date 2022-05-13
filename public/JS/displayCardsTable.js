async function populateCardTable(){
  const response = await fetch('/cards_collection', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: currentUserId
    })
  });
  const result = await response.json();

  let table = document.getElementById("card-tables-body");
  table.innerHTML = "";
  result.saved_cards.forEach(card => {
    let tableRow = document.createElement("tr");
    tableRow.id = "card-id-" + card.card_id;
    tableRow.className = "card-table-rows";
    for (const cardInfo in card) {
      let tableRecord = document.createElement("td");
      if (Object.hasOwnProperty.call(card, cardInfo)) {
        const element = card[cardInfo];
        if (cardInfo === "card_image") {
          let cardImg = document.createElement("a");
          cardImg.setAttribute("href", card[cardInfo]);
          cardImg.setAttribute("target", "_blank");
          cardImg.innerText = "card img";
          tableRecord.appendChild(cardImg);
          tableRow.appendChild(tableRecord);
        } else if (cardInfo === "foiled") {
          if (card[cardInfo] === true) {
            tableRecord.innerText = "Yes";
          } else {
            tableRecord.innerText = "No";
          }
          tableRow.appendChild(tableRecord);
        } else if(cardInfo !== "card_id") {
          tableRecord.innerText = element;
          tableRow.appendChild(tableRecord);
        }
      }
    }
    table.appendChild(tableRow);
  });
  // Adding Delete and Edit options to each card row
  // console.log(typeof table);
  for (let i = 0; i < table.rows.length; i++) {
    let row = table.rows[i];
    let tdEdit = document.createElement("td");
    let tdDelete = document.createElement("td");
    tdEdit.innerText = "Edit";
    tdDelete.innerText = "Delete";
    row.append(tdEdit, tdDelete);
  }
}
function showCardsByTypes(e) {  
  var table, tableRows, td, textValue;
  table = document.getElementById("myTable");
  tableRows = table.getElementsByTagName("tr");
  console.log(e.innerText)

  // Loop through the tables rows and display only the row that matches the card type that was clicked 
  for (let i = 0; i < tableRows.length; i++) {
    td = tableRows[i].getElementsByTagName("td")[3];
    if (td) {
      textValue = td.textContent || td.innerText;
      console.log(textValue.includes(e.innerText))
      if (e.innerText === "All") {
        tableRows[i].style.display = "table-row";
      } else if (!textValue.includes(e.innerText)) {
        // console.log(e.innerText + " : " + textValue);
        tableRows[i].style.display = "none";
      } else if (textValue.includes(e.innerText)) {
        tableRows[i].style.display = "table-row";
      }
    }

  }
    
  // Loop through the tables records on screen and filter each by e.innerText that was clicked and display only the ones that match, or display all if option "All" was clicked. Example: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_filter_table
}