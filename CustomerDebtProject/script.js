const customerList = JSON.parse(localStorage.getItem("customers"));
const purchaseList = JSON.parse(localStorage.getItem("purchases"));
const loansList = JSON.parse(localStorage.getItem("loans"));

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("body").style.display = "none";
  const isAuthenticated = localStorage.getItem("authenticated");
  if (!isAuthenticated){
    
    window.location.href = "index.html"
    return;
  }
  document.querySelector("body").style.display = "block";
  const customerForm = document.getElementById("new_customer_form");

  customerForm.addEventListener("submit", (e) => {
    e.preventDefault(); //prevent form submission

    const firstName = document.getElementById("first_name").value;
    const lastName = document.getElementById("last_name").value;
    const gender = document.getElementById("gender_id").value;
    const email = document.getElementById("email_id").value;
    const phone = document.getElementById("phone_id").value;
    const address = document.getElementById("address_id").value;
    const DOB = document.getElementById("dob_id").value;
    const creditBalance = parseInt(
      document.getElementById("credit_balance").value
    );
    console.log(firstName, lastName, gender, email)
    let id_counter = parseInt(localStorage.getItem("id_counter")) || 0;

    if (
      firstName === "" ||
      lastName === "" ||
      email === "" ||
      phone === "" ||
      address === "" ||
      DOB === "" ||
      gender === ""
    ) {
      alert("Fields cant be empty");
      return;
    }

    const customer = {
      id: "#" + id_counter,
      firstname: firstName,
      lastname: lastName,
      email: email,
      DOB: DOB,
      gender: gender,
      address: address,
      phone: phone,
      balance: creditBalance,
    };
    id_counter = id_counter + 1;
    console.log("This is Id Counter: ", id_counter);

    let customers = JSON.parse(localStorage.getItem("customers")) || [];
    customers.push(customer);
    localStorage.setItem("customers", JSON.stringify(customers));
    localStorage.setItem("id_counter", id_counter);
    console.log("These are the customers: ", customers);

    customerForm.reset();
    window.location.reload();

    alert("customer details saved successfully");
  });

  const disburseForm = document.querySelector("#disburse_loan_form");
  disburseForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const loanAmount = parseFloat(document.getElementById("loan_amount").value);
    const customer_ID = parseInt(
      document.getElementById("customer_select_id").value
    );
    const loandurationInput = document.querySelector("#loan_duration").value;
    console.log(loanAmount);
    console.log(customer_ID);
    const customertoUpdate = customerList.find(
      (customer) => parseInt(customer.id.replace("#", "")) === customer_ID
    );

    if (customertoUpdate) {
      customertoUpdate.balance += loanAmount;
      localStorage.setItem("customers", JSON.stringify(customerList));
      alert("Loan disbursed successfully");
      console.log("New balance: ", customertoUpdate.balance);
      disburseForm.reset();
      window.location.reload();

      let loanId = parseInt(localStorage.getItem("loanID") || 0);
      let disbursedate = new Date();
      let loanDurationDate = new Date(loandurationInput);
      const loanDuration = loanDurationDate.getTime() - disbursedate.getTime();
      let loanDurationInDays = Math.floor(loanDuration / (1000 * 60 * 60 * 24));

      const Loan = {
        id: "#" + loanId,
        customer: customertoUpdate,
        disburseDate: disbursedate.toLocaleDateString(),
        loanduration: loanDurationInDays,
        loandurationDate: loanDurationDate.toLocaleDateString(),
        amount: loanAmount,
      };
      loanId++;

      let loans = JSON.parse(localStorage.getItem("loans")) || [];
      loans.push(Loan);
      localStorage.setItem("loans", JSON.stringify(loans));
      localStorage.setItem("loanID", loanId);
    } else {
      alert("Customer Not found !");
      return;
    }
  });

  const purchaseForm = document.querySelector("#purchase_form");
  purchaseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const purchaseAmount = document.getElementById("purchase_amount").value;
    const itemPurchased = document.getElementById("purchase_item").value;
    const itemSellerID = parseInt(
      document
        .getElementById("purchase_customer_select_id")
        .value.replace("#", "")
    );
    console.log(itemSellerID);
    const itemSeller = customerList.find(
      (customer) => parseInt(customer.id.replace("#", "")) === itemSellerID
    );
    let transactionID = parseInt(localStorage.getItem("transactionID")) || 0;
    let purchases = JSON.parse(localStorage.getItem("purchases")) || [];

    if (itemSeller.balance >= purchaseAmount) {
      updateCustomerBalanceSubtract(itemSeller, purchaseAmount);
      saveCustomerList(customerList);
    }

    let purchaseDate = new Date();

    const purchase = {
      id: "#" + transactionID,
      customer: itemSeller,
      item: itemPurchased,
      purchaseDate: purchaseDate.toLocaleDateString(),
      purchaseAmount: "$" + purchaseAmount,
    };
    transactionID++;
    purchases.push(purchase);
    localStorage.setItem("purchases", JSON.stringify(purchases));
    localStorage.setItem("transactionID", transactionID);
    alert("purchase successful");

    purchaseForm.reset();
    window.location.reload();
  });

  if (purchaseList && purchaseList.length > 0) {
    updateAnyTable(purchaseList, "purchases_table");
    let totalPurchase = 0;
    purchaseList.forEach((purchase) => {
      totalPurchase += parseInt(purchase.purchaseAmount.replace("$", ""))
    })
    document.querySelector("#total_sales_number").innerHTML = `$${totalPurchase}`
    document.querySelector("#total_sales_number_2").innerHTML = `$${totalPurchase}`
  }

  if (customerList && customerList.length > 0) {
    updateAnyTable(customerList, "customers_table")
    customerList.forEach((singleCustomer) => {
      const optionElement = createElementWithClass("option", "customer_style");
      const optionElement_2 = createElementWithClass("option","customer_style");
      optionElement.value = `${singleCustomer.id.replace("#", "")}`;
      optionElement_2.value = `${singleCustomer.id.replace("#", "")}`;
      optionElement.textContent = `${singleCustomer.firstname} ${singleCustomer.lastname}`;
      optionElement_2.textContent = `${singleCustomer.firstname} ${singleCustomer.lastname}`;
      document.querySelector("#customer_select_id").appendChild(optionElement_2);
      document.querySelector("#purchase_customer_select_id").appendChild(optionElement);
    });
    document.getElementById("total_customers_number").innerHTML = `${customerList.length}`;
    document.getElementById("total_customers_number_2").innerHTML = `${customerList.length}`;
  }

  

  if (loansList && loansList.length > 0) {
    updateAnyTable(loansList, "disbursed_loans_table");
    updateAnyTable(getOverdueLoans(), "overdue_loans_table");
    let totalloan = 0;
    loansList.forEach((loan) => {
      totalloan += parseInt(loan.amount);
    })
    document.getElementById("total_loans").innerHTML = `$${totalloan}`;
    document.getElementById("total_loans_2").innerHTML = `$${totalloan}`;


  }

  const searchBar = document.getElementById("searchbar");
  searchBar.addEventListener("input", (event) => {
    const searchTerm = event.target.value;
    const filteredLoans = filterData(loansList, searchTerm);
    const filteredCustomers = filterData(customerList, searchTerm);
    const filteredPurchases = filterData(purchaseList, searchTerm)

    updateAnyTable(filteredLoans, "disbursed_loans_table");
    updateAnyTable(filteredCustomers, "customers_table");
    updateAnyTable(filteredPurchases, "purchases_table")
  });
});

function handleNewCustomer() {
  document.querySelector("#New_customer_form_container").style.display = "flex";
}
function handleDisburseLoan() {
  document.querySelector("#disburse_loan_form_container").style.display =
    "flex";
}
function handleMakePurchase() {
  document.querySelector("#purchase_form_container").style.display = "flex";
}
function handleclosePurchase() {
  document.querySelector("#purchase_form_container").style.display = "none";
}
function handlecloseDisburseLoan() {
  document.querySelector("#disburse_loan_form_container").style.display =
    "none";
}
function handlecloseCustomer() {
  document.querySelector("#New_customer_form_container").style.display = "none";
}
function handlecloseEditCustomer(){
  document.querySelector("#editCustomerForm").reset();
  document.querySelector("#editCustomerForm_container").style.display = "none";
}
function createElementWithClass(tag, className) {
  const newDiv = document.createElement(tag);
  newDiv.classList.add(className);
  return newDiv;
}
function reloadandScrollToView() {
  window.location.reload();
}

function openTabs(buttonClass, tabClass, selectTab, selectButton){
    const tabs = document.querySelectorAll(tabClass);
    const buttons = document.querySelectorAll(buttonClass);
  
    tabs.forEach(tab => {
      if (tab.classList.contains(selectTab)) {
        tab.style.display = "block";
      } else {
        tab.style.display = "none";
      }
    });
  
    buttons.forEach(button => {
      if (button.id === selectButton) {
        button.style.cssText = "background: #9665EA; padding: 10px 30px; border-radius: 5px; box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); color: #ffff;";
      } else {
        button.style.cssText = "background: none; padding: 0px; border-radius: 0px; box-shadow: none; color: #201D23;";
      }
    });
  
}
function openRecentPurchases() {
  openTabs(".navigation_btn", ".hidden", "recent_purchase_tab", "recent_purchases_btn");
}
function openPurchases() {
  openTabs(".navigation_btn", ".hidden", "purchase_tab", "purchases_btn");
}
function openCustomers() {
  openTabs(".navigation_btn", ".hidden", "customers_tab", "customers_btn");

}
function openOverdueLoans() {
  openTabs(".navigation_btn", ".hidden", "overdue_loans_tab", "overdue_loans_btn");
}
function openDisbursedLoans() {
  openTabs(".navigation_btn", ".hidden", "Disbursed_loans_tab", "disbursed_loan_btn");
 }


function updateCustomerBalance(customer, loanAmount) {
  customer.balance += loanAmount;
}
function updateCustomerBalanceSubtract(customer, purchaseAmount) {
  customer.balance -= purchaseAmount;
}
function saveCustomerList(theList) {
  localStorage.setItem("customers", JSON.stringify(theList));
}



function filterData(data, filter) {
  const filteredData = data.filter((item) => {
    let fullName = "";
    if (item.firstname && item.lastname) {
      fullName = `${item.firstname} ${item.lastname}`.toLowerCase();
    } else if (
      item.customer &&
      item.customer.firstname &&
      item.customer.lastname
    ) {
      fullName =
        `${item.customer.firstname} ${item.customer.lastname}`.toLowerCase();
    }

    return fullName.includes(filter.toLowerCase());
  });
  return filteredData;
}

function updateAnyTable(data, tableId) {
  const table = document.getElementById(String(tableId));
  const tbody = table.getElementsByTagName("tbody")[0];
  tbody.innerHTML = "";

  data.forEach((item) => {
    const row = document.createElement("tr");
    
    let fullNameCellCreated = false;

    Object.keys(item).forEach((property) => {
      if (property === "customer") {
        const cell = document.createElement("td");
        cell.innerText = `${item.customer.firstname} ${item.customer.lastname}`;
        row.appendChild(cell);
      } else if (property === "firstname" || property === "lastname") {
        if (!fullNameCellCreated) {
          const cell = document.createElement("td");
          cell.innerText = `${item.firstname} ${item.lastname}`;
          fullNameCellCreated = true;
          row.appendChild(cell);
        };
      } else if(property === "id") {
        if (!item.hasOwnProperty("customer")){
          const LinkItem = createElementWithClass('a', 'row_link');
          const LinkNode = document.createTextNode(`${item[property]}`);
          LinkItem.href = "#"
          LinkItem.appendChild(LinkNode);
          const cell = createElementWithClass('td', "cell_style");
          cell.appendChild(LinkItem)
          row.appendChild(cell)

          LinkItem.addEventListener("click", (event) => {
            event.preventDefault();
            displayCustomerEditForm(item);
        })

        } else if(item.hasOwnProperty("customer")) {
          const cell = createElementWithClass('td');
          cell.innerText = item[property];
          row.appendChild(cell)
        };
        
      }else if(property === "balance") {
        const cell = document.createElement("td");
        cell.innerText = `$${item[property]}`;
        row.appendChild(cell);
      }else {
        const cell = document.createElement("td");
        cell.innerText = item[property];
        row.appendChild(cell);
      }
    });
    tbody.appendChild(row);
  });
}
function displayCustomerEditForm(customerObject){
  document.querySelector("#editCustomerForm_container").style.display = "flex";
  const form = document.getElementById('editCustomerForm');
  const inputs = form.querySelectorAll('input, select');
  const DeleteForm = document.getElementById('DeleteCustomer');

// Map the property keys from the customer data to the corresponding input IDs
  const inputMappings = {
    edit_customer_id: 'id',
    edit_first_name: 'firstname',
    edit_last_name: 'lastname',
    edit_email_id: 'email',
    edit_dob_id: 'DOB',
    edit_gender_id: 'gender',
    edit_address_id: 'address',
    edit_phone_id: 'phone',
    edit_credit_balance: 'balance'
  };

  inputs.forEach((input) => {
    const inputId = inputMappings[input.id];
    if (customerObject.hasOwnProperty(inputId)) {
      input.value = customerObject[inputId];
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleditCustomerformsubmit(form, customerObject)
  })
  DeleteForm.addEventListener("click", (e) => {
    e.preventDefault();
    handleDeleteCustomer(customerObject);

  })
}

function handleditCustomerformsubmit(formData, updateCustomer){
  console.log(formData.edit_first_name.value)
  updateCustomer.firstname = formData.edit_first_name.value;
  updateCustomer.lastname = formData.edit_last_name.value;
  updateCustomer.email = formData.edit_email_id.value;
  updateCustomer.DOB = formData.edit_dob_id.value;
  updateCustomer.gender = formData.edit_gender_id.value;
  updateCustomer.address = formData.edit_address_id.value;
  updateCustomer.phone = formData.edit_phone_id.value;
  updateCustomer.balance = formData.edit_credit_balance.value;
  localStorage.setItem("customers", JSON.stringify(customerList));
  alert("Customer updated successfully")
  formData.reset();
  window.location.reload();
}
function handleDeleteCustomer(customertoDelete){
 const customerid = cleanID(customertoDelete.id);
 let updatedCustomers = customerList.filter((customer) => cleanID(customer.id) !== customerid);
 let updatedLoans = loansList.filter((loan) => cleanID(loan.customer.id) !== customerid);
 let updatedPurchases = purchaseList.filter((purchase) => cleanID(purchase.customer.id) !== customerid);

 localStorage.setItem("customers", JSON.stringify(updatedCustomers));
 localStorage.setItem("loans", JSON.stringify(updatedLoans));
 localStorage.setItem("purchases", JSON.stringify(updatedPurchases));

 alert("customer deleted successfully");
 window.location.reload();

}
function getOverdueLoans() {

  const overdueLoans = loansList.filter((loan) => {
    const loandurationDate = new Date(loan.loandurationDate.split("/").reverse().join("-"));
    const currentDate = new Date();
    return loandurationDate < currentDate;
  });

  return overdueLoans;
}

function cleanID(data){
  return data.replace("#", "")
}

function logoutUser(){
  localStorage.removeItem("authenticated");
  window.location.reload()
}