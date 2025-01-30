import { IProject, ProjectStatus, UserRole } from "./classes/Project"
import { ProjectsManager } from "./classes/Projectsmanager"

function showModal(id: string) {
  const modal = document.getElementById(id)
  if (modal && modal instanceof HTMLDialogElement) {
    modal.showModal()
  } else {
    console.warn("The provided modal wasn't found. ID: ", id)
  }
}

function closeModal(id: string) {
  const modal = document.getElementById(id)
  if (modal && modal instanceof HTMLDialogElement) {
    modal.close()
  } else {
    console.warn("The provided modal wasn't found. ID: ", id)
  }
}

const projectsListUI = document.getElementById("projects-list") as HTMLElement
const projectsManager = new ProjectsManager(projectsListUI)


const newProjectBtn = document.getElementById("new-project-btn")
if (newProjectBtn)  {
  newProjectBtn.addEventListener("click", () => {
    handleProjectModal('new')})
} else {
  console.warn("New projects button was not found")
}

const editBtn = document.getElementById("edit-btn")
if (editBtn) {
  editBtn.addEventListener("click", () => {
    console.log("Edit button clicked"); // Debug 1
    const detailsPage = document.getElementById("project-details")
    console.log("Details page:", detailsPage); // Debug 2
    const projectId = detailsPage?.getAttribute("data-project-id")
    console.log("Project ID:", projectId); // Debug 3
    if (!projectId) {
      console.log("No project ID found"); // Debug 4
      return;
    }
    handleProjectModal("edit", projectId)
  })
} else {
  console.warn("New edit button was not found")
}

const submitBtn = document.getElementById("submit-btn")
if(submitBtn) {
  submitBtn.addEventListener("click", () => projectsManager.updateProject)
}

const projectForm = document.getElementById("new-project-form") as HTMLFormElement
if (projectForm && projectForm instanceof HTMLFormElement) {
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const formData = new FormData(projectForm)
    const finishDateStr = formData.get("finishDate") as string

    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      finishDate: finishDateStr ? new Date(finishDateStr) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
    try {
      const mode = projectForm.getAttribute('data-mode')
      if (mode === 'edit') {
        const projectId = projectForm.getAttribute('data-project-id')
        if (!projectId) throw new Error("Project ID not found")
        projectsManager.updateProject(projectId, projectData)
      } else {
        const project = projectsManager.newProject(projectData)
        console.log(project)
      }
      projectForm.reset()
      closeModal("new-project-modal")
    } catch (err) {
      alert(err)
    }
  })
} else {
	console.warn("The project form was not found. Check the ID!")
}

//cancel button schließt das modal
const cancelBtn = document.getElementById("cancel-btn")
if(cancelBtn) {
  
  cancelBtn.addEventListener("click", () => {
    projectForm?.reset()
    closeModal("new-project-modal")
  })
}


const exportProjectsBtn= document.getElementById("export-projects-btn")
if (exportProjectsBtn) {
  exportProjectsBtn.addEventListener("click", () => {
    projectsManager.exportToJSON()
  })
}

const importProjectsBtn = document.getElementById("import-projects-btn")
if (importProjectsBtn) {
  importProjectsBtn.addEventListener("click", () => {
    projectsManager.importFromJSON()
  })
}

const projectButton = document.getElementById("project-nav-button")
if(projectButton) {
  projectButton.addEventListener("click", () => {
    const projectsPage = document.getElementById("projects-page")
    const detailsPage = document.getElementById("project-details")
    if(!(projectsPage && detailsPage)) {return}   
    projectsPage.style.display = "flex"
    detailsPage.style.display = "none"
  })
}
function handleProjectModal(mode: 'new' | 'edit', projectId?: string) {
  console.log('handleProjectModal aufgerufen mit:', { mode, projectId })
  
  const modal = document.getElementById("new-project-modal") as HTMLDialogElement
  console.log('Modal-Element gefunden:', modal)
  
  const form = modal?.querySelector("form") as HTMLFormElement
  console.log('Formular-Element gefunden:', form)
  
  if(!modal || !form) {
    console.log('Modal oder Form nicht gefunden')
    return
  }

  //Titel des Modals anpassen
  const modalTitle = document.getElementById("modal-title")
  if(modalTitle) {
    modalTitle.textContent = mode === 'new' ? "New Project" : "Edit Project"
  }

  //Submit-Button Text anpassen
  const submitBtn = document.getElementById("submit-btn")
  if(submitBtn) {
    submitBtn.textContent = mode === 'new' ? "Create" : "Update"
  }

  // Wenn im Edit-Modus, Formular mit existierenden Daten füllen
  if(mode === 'edit' && projectId) {
    const project = projectsManager.getProject(projectId)
    console.log('Gefundenes Projekt:', project)
    
    if(!project) {
      console.log('Kein Projekt gefunden für ID:', projectId)
      return
    }

    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement
    const descInput = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement
    const statusSelect = form.querySelector('select[name="status"]') as HTMLSelectElement
    const roleSelect = form.querySelector('select[name="userRole"]') as HTMLSelectElement
    const dateInput = form.querySelector('input[name="finishDate"]') as HTMLInputElement

    console.log('Gefundene Formular-Elemente:', {
      nameInput,
      descInput,
      statusSelect,
      roleSelect,
      dateInput
    })

    nameInput.value = project.name
    descInput.value = project.description
    statusSelect.value = project.status
    roleSelect.value = project.userRole
    dateInput.value = project.finishDate.toISOString().split('T')[0]
  }

  // Form-Data-Attribut setzen um den Modus zu speichern
  form.setAttribute('data-mode', mode)
  if (projectId) {
    form.setAttribute('data-project-id', projectId)
  } else {
    form.removeAttribute('data-project-id')
  }

  modal.showModal()
  console.log('Modal wurde geöffnet')
}

