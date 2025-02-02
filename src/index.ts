// src/index.ts

import { Project, IProject, ProjectStatus, UserRole } from "./classes/Project";
import { ProjectsManager } from "./classes/Projectsmanager";
import { ITask, TaskProgress } from "./classes/Task";
import { showModal, closeModal, handleTaskModal } from "./modal";

// UI und Manager initialisieren
const projectsListUI = document.getElementById("projects-list") as HTMLElement;
const projectsManager = new ProjectsManager(projectsListUI);

// Für den Zugriff in modal.ts als globale Variable
(window as any).projectsManager = projectsManager;

const newProjectBtn = document.getElementById("new-project-btn");
if (newProjectBtn) {
  newProjectBtn.addEventListener("click", () => {
    handleProjectModal('new');
  });
} else {
  console.warn("New projects button was not found");
}

const editBtn = document.getElementById("edit-btn");
if (editBtn) {
  editBtn.addEventListener("click", () => {
    const detailsPage = document.getElementById("project-details");
    const projectId = detailsPage?.getAttribute("data-project-id");
    console.log("Project ID:", projectId);
    if (!projectId) {
      console.log("No project ID found");
      return;
    }
    handleProjectModal("edit", projectId);
  });
} else {
  console.warn("New edit button was not found");
}
const submitBtn = document.getElementById("submit-btn");
if (submitBtn) {
  submitBtn.addEventListener("click", () => projectsManager.updateProject);
}

const projectForm = document.getElementById("new-project-form") as HTMLFormElement;
if (projectForm && projectForm instanceof HTMLFormElement) {
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(projectForm);
    const finishDateStr = formData.get("finishDate") as string;

    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      finishDate: finishDateStr
        ? new Date(finishDateStr)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
    try {
      const mode = projectForm.getAttribute('data-mode');
      if (mode === 'edit') {
        const projectId = projectForm.getAttribute('data-project-id');
        if (!projectId) throw new Error("Project ID not found");
        projectsManager.updateProject(projectId, projectData);
      } else {
        const project = projectsManager.newProject(projectData);
        console.log(project);
      }
      projectForm.reset();
      closeModal("new-project-modal");
    } catch (err) {
      alert(err);
    }
  });
} else {
  console.warn("The project form was not found. Check the ID!");
}

// Cancel-Button schließt das Modal
const cancelBtn = document.getElementById("cancel-btn");
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    projectForm?.reset();
    closeModal("new-project-modal");
  });
}

const exportProjectsBtn = document.getElementById("export-projects-btn");
if (exportProjectsBtn) {
  exportProjectsBtn.addEventListener("click", () => {
    projectsManager.exportToJSON();
  });
}

const importProjectsBtn = document.getElementById("import-projects-btn");
if (importProjectsBtn) {
  importProjectsBtn.addEventListener("click", () => {
    projectsManager.importFromJSON();
  });
}

const projectButton = document.getElementById("project-nav-button");
if (projectButton) {
  projectButton.addEventListener("click", () => {
    const projectsPage = document.getElementById("projects-page");
    const detailsPage = document.getElementById("project-details");
    if (!(projectsPage && detailsPage)) return;
    projectsPage.style.display = "flex";
    detailsPage.style.display = "none";
  });
}

function handleProjectModal(mode: 'new' | 'edit', projectId?: string) {
  console.log('handleProjectModal aufgerufen mit:', { mode, projectId });
  const modal = document.getElementById("new-project-modal") as HTMLDialogElement;
  const form = modal.querySelector("form") as HTMLFormElement;
  if (!modal || !form) {
    console.log('Modal oder Form nicht gefunden');
    return;
  }

  // Titel des Modals anpassen
  const modalTitle = document.getElementById("modal-title");
  if (modalTitle) {
    modalTitle.textContent = mode === 'new' ? "New Project" : "Edit Project";
  }

  // Submit-Button Text anpassen
  const submitBtn = document.getElementById("submit-btn");
  if (submitBtn) {
    submitBtn.textContent = mode === 'new' ? "Create" : "Update";
  }

  // Falls Edit-Modus: Formular mit existierenden Daten füllen
  if (mode === 'edit' && projectId) {
    const project = projectsManager.getProject(projectId);
    console.log('Gefundenes Projekt:', project);
    if (!project) {
      console.log('Kein Projekt gefunden für ID:', projectId);
      return;
    }

    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
    const descInput = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    const statusSelect = form.querySelector('select[name="status"]') as HTMLSelectElement;
    const roleSelect = form.querySelector('select[name="userRole"]') as HTMLSelectElement;
    const dateInput = form.querySelector('input[name="finishDate"]') as HTMLInputElement;

    console.log('Gefundene Formular-Elemente:', {
      nameInput,
      descInput,
      statusSelect,
      roleSelect,
      dateInput
    });

    nameInput.value = project.name;
    descInput.value = project.description;
    statusSelect.value = project.status;
    roleSelect.value = project.userRole;
    dateInput.value = project.finishDate.toISOString().split('T')[0];
  }

  // Setze Form-Attribute für den Modus
  form.setAttribute('data-mode', mode);
  if (projectId) {
    form.setAttribute('data-project-id', projectId);
  } else {
    form.removeAttribute('data-project-id');
  }

  modal.showModal();
  console.log('Modal wurde geöffnet');
}

const taskForm = document.getElementById("new-task-form") as HTMLFormElement;
if (taskForm && taskForm instanceof HTMLFormElement) {
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(taskForm);
    const detailsPage = document.getElementById("project-details");
    const projectId = detailsPage?.getAttribute("data-project-id") as string;
    const activeProject = projectsManager.getProject(projectId);

    if (activeProject) {
      const taskData: ITask = {
        taskName: formData.get("task-name") as string,
        taskProgress: formData.get("task-progress") as TaskProgress,
        taskDate: new Date(formData.get("task-date") as string)
      };

      // Unterscheide zwischen "new" und "edit"
      const mode = taskForm.getAttribute("data-mode");
      if (mode === "edit") {
        const taskId = taskForm.getAttribute("taskId");
        if (!taskId) {
          console.error("Task ID fehlt im Edit-Modus");
          return;
        }
        activeProject.updateTask(taskId, taskData);
      } else {
        activeProject.newTask(taskData);
      }
      taskForm.reset();
      closeModal("new-task-modal");
    }
  });
}

const canceltaskBtn = document.getElementById("cancel-task-btn");
if (canceltaskBtn) {
  canceltaskBtn.addEventListener("click", () => {
    taskForm?.reset();
    closeModal("new-task-modal");
  });
}

const taskBtn = document.getElementById("task-btn");
if (taskBtn) {
  taskBtn.addEventListener("click", () => {
    handleTaskModal('new');
  });
} else {
  console.warn("New task button was not found");
}

const submitTaskBtn = document.getElementById("submit-task-btn");
if (submitTaskBtn) {
  submitTaskBtn.addEventListener("click", () => projectsManager.updateProject);
}