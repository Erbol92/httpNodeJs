import { Ticket } from "./components/ticket";
import { AddTicketForm } from "./components/addTicketForm";

document.addEventListener("DOMContentLoaded", () => {
  const ticket = new Ticket();
  const addForm = new AddTicketForm();
  const addTicketBtn = document.querySelector(".add-ticket");
  window.addTicketBtn = addTicketBtn;

  ticket.getAllTicket();

  addTicketBtn.addEventListener("click", () => {
    // ticket.bindToDom()
    if (!document.querySelector(".add-form-ticket")) {
      const addFormEl = addForm.bindToDom();
      addFormEl.querySelector(".send").addEventListener("click", (e) => {
        e.preventDefault();
        addForm.createOrUpdateTicket(addFormEl, "create");
        addForm.closeForm(addFormEl);
      });
    }
  });
});
