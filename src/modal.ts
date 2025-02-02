
export function showModal(id: string) {
    const modal = document.getElementById(id);
    if (modal && modal instanceof HTMLDialogElement) {
      modal.showModal();
    } else {
      console.warn("The provided modal wasn't found. ID: ", id);
    }
  }
  
  export function closeModal(id: string) {
    const modal = document.getElementById(id);
    if (modal && modal instanceof HTMLDialogElement) {
      modal.close();
    } else {
      console.warn("The provided modal wasn't found. ID: ", id);
    }
  }
  
  export function handleTaskModal(mode: 'new' | 'edit', taskId?: string) {
    const modal = document.getElementById("new-task-modal") as HTMLDialogElement;
    const form = document.getElementById("new-task-form") as HTMLFormElement;
    const modalTitle = document.getElementById("task-form-title") as HTMLElement;
  
    if (modalTitle) {
      modalTitle.textContent = mode === 'new' ? "New Task" : "Edit Task";
    }
    const submitBtn = document.getElementById("submit-task-btn");
    if (submitBtn) {
      submitBtn.textContent = mode === 'new' ? "Create" : "Update";
    }
  
    // Setze den Modus im Formular
    form.setAttribute('data-mode', mode);
  
    if (mode === 'edit' && taskId) {
      form.setAttribute("taskId", taskId);
  
      const nameInput = form.querySelector('input[name="task-name"]') as HTMLInputElement;
      const progressSelect = form.querySelector('select[name="task-progress"]') as HTMLSelectElement;
      const dateInput = form.querySelector('input[name="task-date"]') as HTMLInputElement;
  
      // Greife über das globale projectsManager (siehe index.ts) auf das aktive Projekt zu
      const projectElement = document.querySelector("#project-details") as HTMLElement;
      const projectId = projectElement?.dataset.projectId;
      const project = (window as any).projectsManager?.getProject(projectId);
      const task = project?.getTask(taskId);
  
      if (task) {
        nameInput.value = task.taskName;
        progressSelect.value = task.taskProgress;
        dateInput.value = task.taskDate.toISOString().split('T')[0];
      }
    }
  
    modal.showModal();
  }