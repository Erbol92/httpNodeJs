import { AddTicketForm } from "./addTicketForm";

export class Ticket {
  constructor() {
    this._isActive = true;
  }

  markupTicket(data) {
    const date = new Date(data.created);
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    const strDate = date.toLocaleString("ru-RU", options).replace(",", "");
    return `
            <div class="col-1"><div class="checkmark border rounded-circle"></div></div>
            <div class="col ticket-body">${data.name}</div>
            <div class="col-3">${strDate}</div>
            <div class="col-2 d-flex">
                <div class="edit rounded-circle me-1"></div>
                <div class="delete border rounded-circle d-flex justify-content-center align-items-center">❌</div>
            </div>
        `;
  }

  bindToDom(data) {
    const ticketEl = document.createElement("div");
    ticketEl.className = "row mb-1 border p-2 ticket";
    ticketEl.id = data.id;
    ticketEl.dataset.description = data.description;
    ticketEl.dataset.status = data.status;
    const markup = this.markupTicket(data);
    const template = document.createElement("template");
    template.innerHTML = markup;
    const ticketContent = template.content.cloneNode(true);
    ticketEl.appendChild(ticketContent);
    ticketEl.dataset.status === "true"
      ? (ticketEl.querySelector(".checkmark").textContent = "✔️")
      : (ticketEl.querySelector(".checkmark").textContent = "");
    document.querySelector(".tickets").appendChild(ticketEl);

    ticketEl
      .querySelector(".delete")
      .addEventListener("click", () => this.deleteTicket(ticketEl));
    ticketEl
      .querySelector(".edit")
      .addEventListener("click", (e) => this.editTicket(e, ticketEl));
    ticketEl.querySelector(".ticket-body").addEventListener("click", () => {
      const ticketDescriptionQS = ticketEl.querySelector(".ticket-desctiption");
      if (!ticketDescriptionQS) {
        if (ticketEl.dataset.description) {
          const ticketDescription = document.createElement("div");
          ticketDescription.className = "mt-3 border-top ticket-desctiption";
          ticketDescription.innerHTML =
            "описание:" + "<br>" + ticketEl.dataset.description;
          ticketEl.querySelector(".ticket-body").appendChild(ticketDescription);
        }
      } else {
        ticketDescriptionQS.remove();
      }
    });

    ticketEl
      .querySelector(".checkmark")
      .addEventListener("click", (e) => this.updateStatus(e, ticketEl));
  }

  deleteTicket(ticket) {
    const modal = document.querySelector(".modal");
    const spinner = modal.querySelector(".spinner-border");
    modal.style.display = "block";
    document.addEventListener("click", (e) => {
      if (!modal.contains(e.target) && !e.target.className.includes("delete")) {
        modal.style.display = "none";
      }
    });
    modal.querySelector(".yes").addEventListener("click", () => {
      spinner.style.display = "block";
      const xhr = new XMLHttpRequest();
      xhr.open(
        "DELETE",
        "http://localhost:7070/?method=deleteById&id=" + ticket.id,
      );
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            ticket.remove();
            modal.style.display = "none";
          } catch (e) {
            console.error(e);
          } finally {
            spinner.style.display = "none";
          }
        }
      });
      xhr.addEventListener("error", () => {
        console.error("Ошибка сети");
        spinner.style.display = "none";
      });
      xhr.send();
    });

    modal.querySelector(".no").addEventListener("click", () => {
      modal.style.display = "none";
      spinner.style.display = "none";
    });
  }

  getAllTicket() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:7070/?method=allTickets");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          document.querySelector(".tickets").innerHTML = "";
          const data = JSON.parse(xhr.responseText);
          data.forEach((task) => this.bindToDom(task));
        } catch (e) {
          console.error(e);
        }
      }
    });
    xhr.addEventListener("error", () => {
      console.error("Ошибка сети");
    });
    xhr.send();
  }

  async editTicket(e, ticket) {
    const editForm = new AddTicketForm();
    const editFormEl = editForm.bindToDom();
    if (e.target.className.includes("checkmark"))
      editFormEl.style.opacity = "0";
    editFormEl.dataset.id = ticket.id;
    const dataTicket = await this.ticketById(ticket);
    editFormEl.querySelector('[name="name"]').value = dataTicket.name;
    editFormEl.querySelector('[name="description"]').value =
      dataTicket.description;
    editFormEl.querySelector('[name="status"]').value = ticket.dataset.status;
    editFormEl.querySelector(".send").addEventListener("click", (e) => {
      e.preventDefault();
      editForm.createOrUpdateTicket(editFormEl, "update");
      editForm.closeForm(editFormEl);
    });
    if (e.target.className.includes("checkmark"))
      editFormEl.querySelector(".send").click();
  }

  ticketById(ticket) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        "http://localhost:7070/?method=ticketById&id=" + ticket.id,
      );
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            console.error(e);
            reject(e);
          }
        } else {
          reject(new Error("Ошибка при загрузке данных: " + xhr.statusText));
        }
      });

      xhr.addEventListener("error", () => {
        console.error("Ошибка сети");
        reject(new Error("Ошибка сети"));
      });

      xhr.send();
    });
  }

  updateStatus(e, ticket) {
    const originalStatus = JSON.parse(ticket.dataset.status);
    ticket.dataset.status = String(!originalStatus);
    ticket.dataset.status === "true"
      ? (ticket.querySelector(".checkmark").textContent = "✔️")
      : (ticket.querySelector(".checkmark").textContent = "");
    this.editTicket(e, ticket);
  }
}
