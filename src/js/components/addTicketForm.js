import { Ticket } from "./ticket";

export class AddTicketForm {
  markupTicketForm() {
    return `
            <h3 class="text-center m-0">Добавить тикет</h3>
            <div class="p-3">
                <p class="m-0">Краткое описание</p>
                <input class="w-100" type="text" name="name">
            </div>
            <div class="p-3">
                <p class="m-0">Подробное описание</p>
                <textarea class="w-100" type="text" name="description"></textarea>
            </div>
            <input type="hidden" name="status" value="false">
            <div class="text-end m-2">
                <button class="btn btn-light border cancel">ОТМЕНА</button>
                <button class="btn btn-light border send">ОК</button>
            </div>
        `;
  }

  bindToDom() {
    const addTicketForm = document.createElement("form");
    addTicketForm.className = "border rounded-5 add-form-ticket bg-light";
    addTicketForm.method = "POST";
    const markup = this.markupTicketForm();
    const template = document.createElement("template");
    template.innerHTML = markup;
    const formContent = template.content.cloneNode(true);
    addTicketForm.appendChild(formContent);

    addTicketForm.querySelector(".cancel").addEventListener("click", (e) => {
      e.preventDefault();
      this.closeForm(addTicketForm);
    });

    document.addEventListener("click", (e) => {
      if (
        !addTicketForm.contains(e.target) &&
        e.target !== window.addTicketBtn &&
        !e.target.className.includes("edit") &&
        !e.target.className.includes("checkmark")
      ) {
        this.closeForm(addTicketForm);
      }
    });

    document.documentElement.appendChild(addTicketForm);
    return addTicketForm;
  }

  closeForm(form) {
    form.remove();
  }

  createOrUpdateTicket(form, method) {
    const ticket = new Ticket();
    const xhr = new XMLHttpRequest();
    switch (method) {
      case "create": {
        xhr.open("POST", "http://localhost:7070/?method=createTicket");
        break;
      }

      case "update": {
        xhr.open(
          "PUT",
          "http://localhost:7070/?method=updateById&id=" + form.dataset.id,
        );
        break;
      }
    }

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    const formData = {
      name: form.name.value,
      description: form.description.value,
      status: form.status.value,
    };

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          ticket.getAllTicket();
        } catch (e) {
          console.error(e);
        }
      }
    });
    xhr.addEventListener("error", () => {
      console.error("Ошибка сети");
    });
    xhr.send(JSON.stringify(formData));
  }
}
