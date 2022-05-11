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
  const cards = await response.json();
  console.log(cards.saved_cards);

  let table = document.getElementById("card-tables-body");
  table.innerHTML = "";
  cards.saved_cards.forEach(card => {
    let tableRow = document.createElement("tr");
    tableRow.id = "card-id-" + card.card_id;
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
}